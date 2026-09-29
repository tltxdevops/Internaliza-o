import type { Prisma } from "@prisma/client";
import { decodeList, encodeList, motivosFromAdjustmentTargets } from "@/domain/demand-fields";
import {
  RESUME_AFTER_ADJUSTMENTS_STATUS,
  encodeAdjustmentTargets,
  needsArquiteturaValidationAfterComercial,
  nextAreasFor,
  parseAdjustmentTargets,
  withArquiteturaValidation,
  type Area,
} from "@/domain/status-machine";
import { prisma } from "@/lib/prisma";

export async function ensureComercialWork(
  demandId: string,
  comercialStatus: string,
) {
  await prisma.areaWork.upsert({
    where: {
      demandId_area: { demandId, area: "comercial" },
    },
    create: {
      demandId,
      area: "comercial",
      status: comercialStatus,
    },
    update: {},
  });
}

async function servicosOfDemand(demandId: string): Promise<string[]> {
  try {
    const rows = await prisma.$queryRaw<
      Array<{ servicosContemplados: string | null }>
    >`
      SELECT "servicosContemplados" FROM "Demand" WHERE "id" = ${demandId} LIMIT 1
    `;
    return decodeList(rows[0]?.servicosContemplados ?? "");
  } catch {
    return [];
  }
}

export async function unlockNextAreas(demandId: string, fromArea: Area) {
  const servicos =
    fromArea === "internalizacao" ? await servicosOfDemand(demandId) : [];
  const next = nextAreasFor(fromArea, servicos);
  for (const area of next) {
    await prisma.areaWork.upsert({
      where: { demandId_area: { demandId, area } },
      create: { demandId, area, status: "nao_iniciado" },
      update: {},
    });
  }
  if (fromArea === "internalizacao") {
    await prisma.demand.update({
      where: { id: demandId },
      data: { internalizado: true },
    });
  }
}

export async function syncDemandWorks(
  demandId: string,
  comercialStatus: string,
) {
  await ensureComercialWork(demandId, comercialStatus);
  const works = await prisma.areaWork.findMany({ where: { demandId } });
  const byArea = Object.fromEntries(works.map((work) => [work.area, work]));
  const chain: Area[] = ["comercial", "arquitetura", "internalizacao"];
  for (const area of chain) {
    if (byArea[area]?.status === "concluido") {
      await unlockNextAreas(demandId, area);
    }
  }
}

export async function markDemandHadRework(
  tx: Prisma.TransactionClient,
  demandId: string,
) {
  await tx.$executeRaw`
    UPDATE "Demand" SET "teveRetrabalho" = 1 WHERE "id" = ${demandId}
  `;
}

async function setAjusteFields(
  tx: Prisma.TransactionClient,
  id: string,
  para: string,
  justificativa: string,
) {
  await tx.$executeRaw`
    UPDATE "AreaWork"
    SET "ajustePara" = ${para},
        "ajusteJustificativa" = ${justificativa}
    WHERE "id" = ${id}
  `;
}

async function setAjusteParaOnly(
  tx: Prisma.TransactionClient,
  id: string,
  para: string,
) {
  await tx.$executeRaw`
    UPDATE "AreaWork"
    SET "ajustePara" = ${para}
    WHERE "id" = ${id}
  `;
}

export async function sendForAdjustments(
  tx: Prisma.TransactionClient,
  demandId: string,
  fromArea: Area,
  fromStatus: string,
  targetAreas: Area[],
  justificativa: string,
) {
  const targets = parseAdjustmentTargets(targetAreas.join(","));
  if (targets.length === 0) {
    return;
  }
  const updated = await tx.areaWork.update({
    where: { demandId_area: { demandId, area: fromArea } },
    data: { status: "aguardando_ajustes" },
  });
  await setAjusteFields(
    tx,
    updated.id,
    encodeAdjustmentTargets(targets),
    justificativa,
  );
  await markDemandHadRework(tx, demandId);
  await syncDemandRetrabalhoFields(tx, demandId, targets, justificativa);
  await tx.statusEvent.create({
    data: {
      demandId,
      area: fromArea,
      from: fromStatus,
      to: "aguardando_ajustes",
    },
  });

  for (const targetArea of targets) {
    await putAreaInRetrabalho(tx, demandId, targetArea);
  }
}

/** Espelha o pedido nos campos de retrabalho da demanda (visíveis no card/lista). */
async function syncDemandRetrabalhoFields(
  tx: Prisma.TransactionClient,
  demandId: string,
  targets: Area[],
  justificativa: string,
) {
  const motivos = encodeList(motivosFromAdjustmentTargets(targets));
  await tx.$executeRaw`
    UPDATE "Demand"
    SET
      "retrabalhoMarcado" = 1,
      "motivoCorrecao" = ${motivos},
      "descricaoAjuste" = ${justificativa},
      "teveRetrabalho" = 1
    WHERE "id" = ${demandId}
  `;
}

async function clearDemandRetrabalhoFieldsIfIdle(
  tx: Prisma.TransactionClient,
  demandId: string,
) {
  const waiting = await tx.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM "AreaWork"
    WHERE "demandId" = ${demandId}
      AND "status" = 'aguardando_ajustes'
    LIMIT 1
  `;
  if (waiting.length > 0) {
    return;
  }
  await tx.$executeRaw`
    UPDATE "Demand"
    SET
      "retrabalhoMarcado" = 0,
      "motivoCorrecao" = '',
      "descricaoAjuste" = ''
    WHERE "id" = ${demandId}
  `;
}

async function putAreaInRetrabalho(
  tx: Prisma.TransactionClient,
  demandId: string,
  targetArea: Area,
) {
  const target = await tx.areaWork.findUnique({
    where: { demandId_area: { demandId, area: targetArea } },
  });

  if (!target) {
    await tx.areaWork.create({
      data: {
        demandId,
        area: targetArea,
        status: "retrabalho",
      },
    });
    await tx.statusEvent.create({
      data: {
        demandId,
        area: targetArea,
        from: "nao_iniciado",
        to: "retrabalho",
      },
    });
  } else if (target.status !== "retrabalho") {
    await tx.areaWork.update({
      where: { id: target.id },
      data: { status: "retrabalho" },
    });
    await tx.statusEvent.create({
      data: {
        demandId,
        area: targetArea,
        from: target.status,
        to: "retrabalho",
      },
    });
  }

  if (targetArea === "comercial") {
    await tx.demand.update({
      where: { id: demandId },
      data: { comercialStatus: "retrabalho" },
    });
  }
}

export async function resumeAfterAdjustments(
  tx: Prisma.TransactionClient,
  demandId: string,
  finishedTarget: Area,
) {
  const waiting = await tx.$queryRaw<
    Array<{ id: string; area: string; ajustePara: string }>
  >`
    SELECT "id", "area", "ajustePara" FROM "AreaWork"
    WHERE "demandId" = ${demandId}
      AND "status" = 'aguardando_ajustes'
  `;
  const works = await tx.areaWork.findMany({ where: { demandId } });
  const statusByArea: Record<string, string> = Object.fromEntries(
    works.map((work) => [work.area, work.status]),
  );

  for (const item of waiting) {
    let targets = parseAdjustmentTargets(item.ajustePara);
    if (!targets.includes(finishedTarget)) {
      continue;
    }

    if (needsArquiteturaValidationAfterComercial(finishedTarget, targets)) {
      await putAreaInRetrabalho(tx, demandId, "arquitetura");
      targets = withArquiteturaValidation(targets);
      statusByArea.arquitetura = "retrabalho";
      await setAjusteParaOnly(tx, item.id, encodeAdjustmentTargets(targets));
    }

    const stillWaiting = targets.some(
      (target) => statusByArea[target] === "retrabalho",
    );
    if (stillWaiting) {
      continue;
    }

    await tx.areaWork.update({
      where: { id: item.id },
      data: { status: RESUME_AFTER_ADJUSTMENTS_STATUS },
    });
    await setAjusteFields(tx, item.id, "", "");
    await tx.statusEvent.create({
      data: {
        demandId,
        area: item.area,
        from: "aguardando_ajustes",
        to: RESUME_AFTER_ADJUSTMENTS_STATUS,
      },
    });
  }

  await clearDemandRetrabalhoFieldsIfIdle(tx, demandId);
}
