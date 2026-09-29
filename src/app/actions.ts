"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { decodeList } from "@/domain/demand-fields";
import {
  AREA_LABEL,
  AREAS,
  OPS_VIEW_SLUG,
  assertTransition,
  canRequestAdjustments,
  formatIntCode,
  isAdjustmentTarget,
  isArea,
  parseAdjustmentTargets,
} from "@/domain/status-machine";
import {
  ensureComercialWork,
  resumeAfterAdjustments,
  sendForAdjustments,
  unlockNextAreas,
  markDemandHadRework,
} from "@/lib/area-work";
import {
  addCatalogContact as saveCatalogContact,
  addCatalogItem as saveCatalogItem,
  listFormLookups,
  removeCatalogContact as deleteCatalogContact,
  removeCatalogItem as deleteCatalogItem,
  type FormLookups,
} from "@/lib/catalog";
import { persistDemandFields } from "@/lib/demand-board";
import { insertDemandComment } from "@/lib/demand-comments";
import {
  nextAreasAfterConclude,
  notifyStatusChange,
} from "@/lib/notify-status";
import { parseDemandFields } from "@/lib/parse-demand-form";
import { prisma } from "@/lib/prisma";
import { readViewer } from "@/lib/read-viewer";
import { isAllowedEmail } from "@/lib/microsoft";

export type ActionState = { error?: string; ok?: string };

function revalidateBoards() {
  revalidatePath("/");
  revalidatePath("/cadastros");
  revalidatePath(`/areas/${OPS_VIEW_SLUG}`);
  for (const area of AREAS) {
    revalidatePath(`/areas/${area}`);
  }
}

function mergeLookup(
  options: FormLookups["servicos"],
  current: string[],
) {
  const known = new Set(options.map((item) => item.value));
  return [
    ...options,
    ...current
      .filter((value) => value && !known.has(value))
      .map((value) => ({ value, label: value })),
  ];
}

export async function createDemand(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const lookups = await listFormLookups();
  const parsed = parseDemandFields(formData, lookups);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const counter = await tx.intCounter.upsert({
        where: { id: 1 },
        create: { id: 1, value: 1 },
        update: { value: { increment: 1 } },
      });
      const intCode = formatIntCode(counter.value);
      const demand = await tx.demand.create({
        data: {
          intCode,
          title: parsed.data.title,
          comercialStatus: "nao_iniciado",
        },
      });
      await persistDemandFields(tx, demand.id, parsed.data);
      await tx.areaWork.create({
        data: {
          demandId: demand.id,
          area: "comercial",
          status: "nao_iniciado",
        },
      });
    });
  } catch (e) {
    console.error(e);
    return { error: "Não foi possível criar a demanda." };
  }

  revalidateBoards();
  return { ok: "Demanda criada." };
}

export async function updateDemand(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const demandId = String(formData.get("demandId") ?? "");
  if (!demandId) {
    return { error: "Demanda inválida." };
  }

  const lookups = await listFormLookups();
  const current = await prisma.demand.findUnique({
    where: { id: demandId },
    select: {
      servicosContemplados: true,
      busArquitetura: true,
      saSesArquitetura: true,
    },
  });
  const allowed: FormLookups = current
    ? {
        servicos: mergeLookup(
          lookups.servicos,
          decodeList(current.servicosContemplados),
        ),
        bus: mergeLookup(lookups.bus, decodeList(current.busArquitetura)),
        saSes: mergeLookup(
          lookups.saSes,
          decodeList(current.saSesArquitetura),
        ),
      }
    : lookups;
  const parsed = parseDemandFields(formData, allowed);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  try {
    const updated = await persistDemandFields(
      prisma,
      demandId,
      parsed.data,
    );
    if (updated === 0) {
      return { error: "Demanda não encontrada." };
    }
  } catch (e) {
    console.error(e);
    return { error: "Não foi possível salvar a demanda." };
  }

  revalidateBoards();
  return { ok: "Demanda atualizada." };
}

export async function addDemandComment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const demandId = String(formData.get("demandId") ?? "");
  const area = String(formData.get("area") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!demandId) {
    return { error: "Demanda inválida." };
  }
  if (!isArea(area)) {
    return { error: "Área inválida." };
  }
  if (!body) {
    return { error: "Escreva o comentário." };
  }

  try {
    const exists = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "Demand" WHERE id = ${demandId} LIMIT 1
    `;
    if (exists.length === 0) {
      return { error: "Demanda não encontrada." };
    }
    const viewer = await readViewer();
    await insertDemandComment({
      demandId,
      author: viewer.name || viewer.email,
      body,
      area,
    });
  } catch (e) {
    console.error(e);
    return { error: "Não foi possível publicar o comentário." };
  }

  revalidateBoards();
  return { ok: "Comentário publicado." };
}

export async function changeAreaStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const demandId = String(formData.get("demandId") ?? "");
  const area = String(formData.get("area") ?? "");
  const to = String(formData.get("to") ?? "");
  const ajustePara = formData.getAll("ajustePara").map(String).join(",");
  const justificativa = String(formData.get("justificativa") ?? "");

  if (!demandId || !isArea(area) || !to) {
    return { error: "Dados inválidos." };
  }

  return moveDemandStatus(demandId, area, to, { ajustePara, justificativa });
}

export async function moveDemandStatus(
  demandId: string,
  area: string,
  to: string,
  extra?: { ajustePara?: string | string[]; justificativa?: string },
): Promise<ActionState> {
  if (!demandId || !isArea(area) || !to) {
    return { error: "Dados inválidos." };
  }

  const demand = await prisma.demand.findUnique({
    where: { id: demandId },
    include: { areaWorks: true },
  });
  if (!demand) {
    return { error: "Demanda não encontrada." };
  }

  await ensureComercialWork(demand.id, demand.comercialStatus);

  const work = await prisma.areaWork.findUnique({
    where: { demandId_area: { demandId, area } },
  });
  if (!work) {
    return { error: "Esta área ainda não está aberta nesta demanda." };
  }

  try {
    assertTransition(area, work.status, to);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Transição inválida." };
  }

  if (to === "aguardando_ajustes") {
    if (!canRequestAdjustments(area)) {
      return { error: "Esta área não pede ajustes." };
    }
    const rawTargets = extra?.ajustePara ?? "";
    const targets = parseAdjustmentTargets(
      Array.isArray(rawTargets) ? rawTargets.join(",") : rawTargets,
    );
    const justificativa = (extra?.justificativa ?? "").trim();
    if (targets.length === 0) {
      return { error: "Escolha Comercial e/ou Arquitetura para receber os ajustes." };
    }
    if (!justificativa) {
      return { error: "Informe a justificativa dos ajustes." };
    }

    await prisma.$transaction(async (tx) => {
      await sendForAdjustments(
        tx,
        demandId,
        area,
        work.status,
        targets,
        justificativa,
      );
    });

    await notifyStatusChange({
      demandId,
      area,
      from: work.status,
      to: "aguardando_ajustes",
      ajustePara: targets,
      justificativa,
    });

    revalidateBoards();
    return {
      ok: `${demand.intCode} · aguardando ajustes em ${targets
        .map((item) => AREA_LABEL[item])
        .join(" e ")}.`,
    };
  }

  const leavingRework =
    work.status === "retrabalho" &&
    (to === "em_andamento" || to === "concluido") &&
    isAdjustmentTarget(area);

  await prisma.$transaction(async (tx) => {
    await tx.areaWork.update({
      where: { id: work.id },
      data: { status: to },
    });
    await tx.statusEvent.create({
      data: {
        demandId,
        area,
        from: work.status,
        to,
      },
    });
    if (area === "comercial") {
      await tx.demand.update({
        where: { id: demandId },
        data: { comercialStatus: to },
      });
    }
    if (to === "retrabalho") {
      await markDemandHadRework(tx, demandId);
    }
    if (leavingRework) {
      await resumeAfterAdjustments(tx, demandId, area);
    }
  });

  let unlockedAreas: ReturnType<typeof nextAreasAfterConclude> = [];
  if (to === "concluido") {
    const servicos =
      area === "internalizacao"
        ? decodeList(
            (
              await prisma.$queryRaw<
                Array<{ servicosContemplados: string | null }>
              >`
                SELECT "servicosContemplados" FROM "Demand"
                WHERE "id" = ${demandId} LIMIT 1
              `
            )[0]?.servicosContemplados ?? "",
          )
        : [];
    unlockedAreas = nextAreasAfterConclude(area, servicos);
    await unlockNextAreas(demandId, area);
  }

  await notifyStatusChange({
    demandId,
    area,
    from: work.status,
    to,
    unlockedAreas,
  });

  revalidateBoards();
  return { ok: `${demand.intCode} · ${area} atualizado.` };
}

export async function addCatalogItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const kind = String(formData.get("kind") ?? "");
  const label = String(formData.get("label") ?? "");
  const result = await saveCatalogItem({ kind, label });
  if (result.error) {
    return { error: result.error };
  }
  revalidateBoards();
  return { ok: "Item adicionado ao cadastro." };
}

export async function removeCatalogItemAction(formData: FormData): Promise<void> {
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) {
    return;
  }
  await deleteCatalogItem(itemId);
  revalidateBoards();
}

export async function addCatalogContactAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const itemId = String(formData.get("itemId") ?? "");
  const email = String(formData.get("email") ?? "");
  const displayName = String(formData.get("displayName") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!itemId) {
    return { error: "Item inválido." };
  }
  const result = await saveCatalogContact({
    itemId,
    email,
    displayName,
    role,
  });
  if (result.error) {
    return { error: result.error };
  }
  revalidatePath("/cadastros");
  return { ok: "E-mail adicionado." };
}

export async function removeCatalogContactAction(
  formData: FormData,
): Promise<void> {
  const contactId = String(formData.get("contactId") ?? "");
  if (!contactId) {
    return;
  }
  await deleteCatalogContact(contactId);
  revalidatePath("/cadastros");
}

export async function saveUserAccess(formData: FormData): Promise<void> {
  const viewer = await readViewer();
  if (viewer.role !== "admin") {
    redirect("/");
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "pending");
  const area = String(formData.get("area") ?? "");
  if (!isAllowedEmail(email)) {
    return;
  }
  if (role !== "admin" && role !== "member" && role !== "pending") {
    return;
  }
  if (role === "member" && !isArea(area)) {
    return;
  }
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      role,
      area: role === "member" ? area : "",
    },
    update: {
      role,
      area: role === "member" ? area : "",
    },
  });
  revalidatePath("/usuarios");
}
