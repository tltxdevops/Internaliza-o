import { decodeList } from "@/domain/demand-fields";
import { prisma } from "@/lib/prisma";
import {
  FIN_VIEW_SLUG,
  OPS_VIEW_SLUG,
  activeFinWorks,
  activeOpsWorks,
  isArea,
  isFinTrack,
  isOpsTrack,
  openWorks,
  type Area,
  type AreaSnapshot,
  type FinTrack,
  type OpsTrack,
} from "@/domain/status-machine";

export type DemandRecord = {
  id: string;
  intCode: string;
  title: string;
  tipoDemanda?: string;
  cliente?: string;
  nomeOportunidade?: string;
  codigoProtheus?: string;
  prioridade?: string;
  prioridadeJustificativa?: string;
  teveRetrabalho?: boolean;
  comercialStatus: string;
  internalizado: boolean;
  createdAt: Date;
  areaWorks: {
    area: string;
    status: string;
    ajustePara?: string | null;
    ajusteJustificativa?: string | null;
  }[];
};

export type DemandCardModel = {
  id: string;
  intCode: string;
  title: string;
  tipoDemanda: string;
  cliente: string;
  nomeOportunidade: string;
  codigoProtheus: string;
  prioridade: string;
  prioridadeJustificativa: string;
  servicosContemplados: string[];
  squadComercial: string;
  saSesArquitetura: string[];
  busArquitetura: string[];
  responsavelEmail: string;
  accountManagerEmail: string;
  retrabalhoMarcado: boolean;
  motivoCorrecao: string[];
  descricaoAjuste: string;
  gerenteProjetosEmail: string;
  liderTecnicoEmail: string;
  statusInternalizacao: string;
  teveRetrabalho: boolean;
  internalizado: boolean;
  createdAt: string;
  works: AreaSnapshot[];
};

export function toDemandCard(demand: DemandRecord): DemandCardModel {
  const typedWorks = demand.areaWorks.filter((work) => isArea(work.area));
  const works: AreaSnapshot[] =
    typedWorks.length > 0
      ? typedWorks.map((work) => ({
          area: work.area as Area,
          status: work.status,
          ajustePara:
            "ajustePara" in work ? String(work.ajustePara ?? "") : "",
          ajusteJustificativa:
            "ajusteJustificativa" in work
              ? String(work.ajusteJustificativa ?? "")
              : "",
        }))
      : [{ area: "comercial", status: demand.comercialStatus }];
  return {
    id: demand.id,
    intCode: demand.intCode,
    title: demand.title,
    tipoDemanda: demand.tipoDemanda ?? "",
    cliente: demand.cliente ?? "",
    nomeOportunidade: demand.nomeOportunidade ?? "",
    codigoProtheus: demand.codigoProtheus ?? "",
    prioridade: demand.prioridade ?? "",
    prioridadeJustificativa: demand.prioridadeJustificativa ?? "",
    servicosContemplados: [],
    squadComercial: "",
    saSesArquitetura: [],
    busArquitetura: [],
    responsavelEmail: "",
    accountManagerEmail: "",
    retrabalhoMarcado: false,
    motivoCorrecao: [],
    descricaoAjuste: "",
    gerenteProjetosEmail: "",
    liderTecnicoEmail: "",
    statusInternalizacao: "",
    teveRetrabalho: Boolean(demand.teveRetrabalho),
    internalizado: demand.internalizado,
    createdAt: demand.createdAt.toISOString(),
    works,
  };
}

export function cardsInArea(demands: DemandCardModel[], area: Area) {
  return demands.flatMap((demand) => {
    const work = demand.works.find((item) => item.area === area);
    if (!work) {
      return [];
    }
    return [{ demand, status: work.status }];
  });
}

export function cardsOnCentralColumn(demands: DemandCardModel[], area: Area) {
  return demands.flatMap((demand) => {
    const open = openWorks(demand.works);
    if (!open.some((work) => work.area === area)) {
      return [];
    }
    const work = demand.works.find((item) => item.area === area);
    if (!work) {
      return [];
    }
    return [{ demand, status: work.status }];
  });
}

/**
 * Board central — Operações: um card por frente ativa.
 * Frente em aguardando_ajustes não aparece aqui (voltou ao destino do pedido).
 */
export function cardsOnOpsCentralColumn(demands: DemandCardModel[]) {
  return demands.flatMap((demand) =>
    activeOpsWorks(demand.works).map((work) => ({
      demand,
      status: work.status,
      area: work.area as OpsTrack,
    })),
  );
}

/**
 * Board central — Finanças: um card por frente ativa (Finanças / Supply).
 * Independente de Operações e das demais frentes do mesmo INT.
 */
export function cardsOnFinCentralColumn(demands: DemandCardModel[]) {
  return demands.flatMap((demand) =>
    activeFinWorks(demand.works).map((work) => ({
      demand,
      status: work.status,
      area: work.area as FinTrack,
    })),
  );
}

export function fullyDoneCards(demands: DemandCardModel[]) {
  return demands.filter((demand) => openWorks(demand.works).length === 0);
}

export function demandDetailPath(area: Area, demandId: string) {
  if (isOpsTrack(area)) {
    return `/areas/${OPS_VIEW_SLUG}?frente=${area}&demanda=${demandId}`;
  }
  if (isFinTrack(area)) {
    return `/areas/${FIN_VIEW_SLUG}?frente=${area}&demanda=${demandId}`;
  }
  return `/areas/${area}?demanda=${demandId}`;
}

export function opsFrentePath(track: OpsTrack, extras?: { view?: string; demanda?: string }) {
  const params = new URLSearchParams();
  params.set("frente", track);
  if (extras?.view === "kanban" || extras?.view === "dashboard") {
    params.set("view", extras.view);
  }
  if (extras?.demanda) {
    params.set("demanda", extras.demanda);
  }
  return `/areas/${OPS_VIEW_SLUG}?${params.toString()}`;
}

export function finFrentePath(track: FinTrack, extras?: { view?: string; demanda?: string }) {
  const params = new URLSearchParams();
  params.set("frente", track);
  if (extras?.view === "kanban" || extras?.view === "dashboard") {
    params.set("view", extras.view);
  }
  if (extras?.demanda) {
    params.set("demanda", extras.demanda);
  }
  return `/areas/${FIN_VIEW_SLUG}?${params.toString()}`;
}

export type AreaBoardItem = {
  demand: DemandCardModel;
  status: string;
  /** Quando a lista mistura frentes (visão geral Ops/Fin). */
  area?: Area;
};

export type DemandFieldWrite = {
  title: string;
  cliente: string;
  tipoDemanda: string;
  nomeOportunidade: string;
  codigoProtheus: string;
  prioridade: string;
  prioridadeJustificativa: string;
  servicosContemplados: string;
  squadComercial: string;
  saSesArquitetura: string;
  busArquitetura: string;
  responsavelEmail: string;
  accountManagerEmail: string;
  retrabalhoMarcado: boolean;
  motivoCorrecao: string;
  descricaoAjuste: string;
  gerenteProjetosEmail: string;
  liderTecnicoEmail: string;
  statusInternalizacao: string;
  internalizado: boolean;
};

/** Prisma gerado no `next dev` costuma ficar velho; SQL evita Unknown argument. */
export async function persistDemandFields(
  client: Pick<typeof prisma, "$executeRaw">,
  demandId: string,
  data: DemandFieldWrite,
) {
  const retrabalho = data.retrabalhoMarcado ? 1 : 0;
  const internalizado = data.internalizado ? 1 : 0;
  return client.$executeRaw`
    UPDATE "Demand"
    SET
      "title" = ${data.title},
      "cliente" = ${data.cliente},
      "tipoDemanda" = ${data.tipoDemanda},
      "nomeOportunidade" = ${data.nomeOportunidade},
      "codigoProtheus" = ${data.codigoProtheus},
      "prioridade" = ${data.prioridade},
      "prioridadeJustificativa" = ${data.prioridadeJustificativa},
      "servicosContemplados" = ${data.servicosContemplados},
      "squadComercial" = ${data.squadComercial},
      "saSesArquitetura" = ${data.saSesArquitetura},
      "busArquitetura" = ${data.busArquitetura},
      "responsavelEmail" = ${data.responsavelEmail},
      "accountManagerEmail" = ${data.accountManagerEmail},
      "retrabalhoMarcado" = ${retrabalho},
      "motivoCorrecao" = ${data.motivoCorrecao},
      "descricaoAjuste" = ${data.descricaoAjuste},
      "gerenteProjetosEmail" = ${data.gerenteProjetosEmail},
      "liderTecnicoEmail" = ${data.liderTecnicoEmail},
      "statusInternalizacao" = ${data.statusInternalizacao},
      "internalizado" = ${internalizado}
    WHERE "id" = ${demandId}
  `;
}

type HydrateRow = {
  id: string;
  cliente: string | null;
  tipoDemanda: string | null;
  nomeOportunidade: string | null;
  codigoProtheus: string | null;
  prioridade: string | null;
  prioridadeJustificativa: string | null;
  servicosContemplados: string | null;
  squadComercial: string | null;
  saSesArquitetura: string | null;
  busArquitetura: string | null;
  responsavelEmail: string | null;
  accountManagerEmail: string | null;
  retrabalhoMarcado: number | boolean | null;
  motivoCorrecao: string | null;
  descricaoAjuste: string | null;
  gerenteProjetosEmail: string | null;
  liderTecnicoEmail: string | null;
  statusInternalizacao: string | null;
  teveRetrabalho: number | boolean | null;
};

export async function hydrateRetrabalhoFlags(demands: DemandCardModel[]) {
  try {
    const rows = await prisma.$queryRaw<HydrateRow[]>`
      SELECT
        id,
        cliente,
        tipoDemanda,
        nomeOportunidade,
        codigoProtheus,
        prioridade,
        prioridadeJustificativa,
        servicosContemplados,
        squadComercial,
        saSesArquitetura,
        busArquitetura,
        responsavelEmail,
        accountManagerEmail,
        retrabalhoMarcado,
        motivoCorrecao,
        descricaoAjuste,
        gerenteProjetosEmail,
        liderTecnicoEmail,
        statusInternalizacao,
        teveRetrabalho
      FROM Demand
    `;
    const byId = new Map(rows.map((row) => [row.id, row]));
    for (const demand of demands) {
      const row = byId.get(demand.id);
      if (!row) {
        continue;
      }
      demand.cliente = row.cliente ?? demand.cliente;
      demand.title = demand.cliente || demand.title;
      demand.tipoDemanda = row.tipoDemanda ?? demand.tipoDemanda;
      demand.nomeOportunidade =
        row.nomeOportunidade ?? demand.nomeOportunidade;
      demand.codigoProtheus = row.codigoProtheus ?? demand.codigoProtheus;
      demand.prioridade = row.prioridade ?? demand.prioridade;
      demand.prioridadeJustificativa =
        row.prioridadeJustificativa ?? demand.prioridadeJustificativa;
      demand.servicosContemplados = decodeList(
        row.servicosContemplados ?? "",
      );
      demand.squadComercial = row.squadComercial ?? "";
      demand.saSesArquitetura = decodeList(row.saSesArquitetura ?? "");
      demand.busArquitetura = decodeList(row.busArquitetura ?? "");
      demand.responsavelEmail = row.responsavelEmail ?? "";
      demand.accountManagerEmail = row.accountManagerEmail ?? "";
      demand.retrabalhoMarcado = Boolean(row.retrabalhoMarcado);
      demand.motivoCorrecao = decodeList(row.motivoCorrecao ?? "");
      demand.descricaoAjuste = row.descricaoAjuste ?? "";
      demand.gerenteProjetosEmail = row.gerenteProjetosEmail ?? "";
      demand.liderTecnicoEmail = row.liderTecnicoEmail ?? "";
      demand.statusInternalizacao = row.statusInternalizacao ?? "";
      if (row.teveRetrabalho) {
        demand.teveRetrabalho = true;
      }
    }
  } catch {
    try {
      const rows = await prisma.$queryRaw<
        Array<{
          id: string;
          cliente: string | null;
          tipoDemanda: string | null;
          nomeOportunidade: string | null;
          codigoProtheus: string | null;
          prioridade: string | null;
          prioridadeJustificativa: string | null;
          teveRetrabalho: number | boolean | null;
        }>
      >`
        SELECT
          id,
          cliente,
          tipoDemanda,
          nomeOportunidade,
          codigoProtheus,
          prioridade,
          prioridadeJustificativa,
          teveRetrabalho
        FROM Demand
      `;
      const byId = new Map(rows.map((row) => [row.id, row]));
      for (const demand of demands) {
        const row = byId.get(demand.id);
        if (!row) {
          continue;
        }
        demand.cliente = row.cliente ?? demand.cliente;
        demand.title = demand.cliente || demand.title;
        demand.tipoDemanda = row.tipoDemanda ?? demand.tipoDemanda;
        demand.nomeOportunidade =
          row.nomeOportunidade ?? demand.nomeOportunidade;
        demand.codigoProtheus = row.codigoProtheus ?? demand.codigoProtheus;
        demand.prioridade = row.prioridade ?? demand.prioridade;
        demand.prioridadeJustificativa =
          row.prioridadeJustificativa ?? demand.prioridadeJustificativa;
        if (row.teveRetrabalho) {
          demand.teveRetrabalho = true;
        }
      }
    } catch {
      // colunas ainda não existem neste banco
    }
  }
}
