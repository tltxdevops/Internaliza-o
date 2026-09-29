import { includesPrimeDeploy } from "@/domain/demand-fields";

export const AREAS = [
  "comercial",
  "arquitetura",
  "internalizacao",
  "pmo",
  "soc",
  "transicao",
  "financas",
  "supply",
] as const;

export type Area = (typeof AREAS)[number];

/** Frentes de Operações (listas de trabalho). */
export const OPS_TRACKS = ["pmo", "soc", "transicao"] as const;
export type OpsTrack = (typeof OPS_TRACKS)[number];

/** Hub de Operações (visão geral + frentes). Não é AreaWork. */
export const OPS_VIEW_SLUG = "operacoes";

/** Frentes de Finanças (listas de trabalho). */
export const FIN_TRACKS = ["financas", "supply"] as const;
export type FinTrack = (typeof FIN_TRACKS)[number];

/** Hub de Finanças na sidebar (`/areas/financas`). */
export const FIN_VIEW_SLUG = "financas" as const;

/** Colunas do board central: Ops e Fin agregam frentes. */
export const CENTRAL_COLUMNS = [
  "comercial",
  "arquitetura",
  "internalizacao",
  "operacoes",
  "financas",
] as const;
export type CentralColumn = (typeof CENTRAL_COLUMNS)[number];

export const CENTRAL_COLUMN_LABEL: Record<CentralColumn, string> = {
  comercial: "Comercial",
  arquitetura: "Arquitetura",
  internalizacao: "Internalização",
  operacoes: "Operações",
  financas: "Finanças",
};

export const AREA_LABEL: Record<Area, string> = {
  comercial: "Comercial",
  arquitetura: "Arquitetura",
  internalizacao: "Internalização",
  pmo: "PMO",
  soc: "SOC",
  /** Antes SG / Serviços Gerenciados. */
  transicao: "Transição",
  financas: "Finanças",
  supply: "Supply",
};

/** Cores da faixa do card no board central. */
export const BOARD_STRIPE: Record<Area | "concluido" | "operacoes", string> = {
  comercial: "#fd7e14",
  arquitetura: "#0b5ed7",
  internalizacao: "#808080",
  pmo: "#ef4444",
  soc: "#f97316",
  transicao: "#be123c",
  financas: "#facc15",
  supply: "#ca8a04",
  concluido: "#16a34a",
  operacoes: "#ef4444",
};

export const RETRABALHO_STRIPE = "#d92d20";

export function stripeForBoard(
  area: Area | "concluido" | "operacoes",
  status: string,
): string {
  if (status === "retrabalho") {
    return RETRABALHO_STRIPE;
  }
  return BOARD_STRIPE[area] ?? "#d0d7de";
}

export const ALL_STATUSES = [
  "nao_iniciado",
  "em_andamento",
  "em_pausa",
  "aguardando_aprovacao",
  "aguardando_ajustes",
  "retrabalho",
  "concluido",
] as const;

export type Status = (typeof ALL_STATUSES)[number];

const SIMPLE_TRANSITIONS: Record<string, string[]> = {
  nao_iniciado: ["em_andamento"],
  em_andamento: ["concluido", "retrabalho"],
  retrabalho: ["em_andamento", "concluido"],
  concluido: [],
};

const INTERNALIZACAO_TRANSITIONS: Record<string, string[]> = {
  nao_iniciado: ["em_andamento"],
  em_andamento: [
    "em_pausa",
    "aguardando_aprovacao",
    "aguardando_ajustes",
    "concluido",
    "retrabalho",
  ],
  em_pausa: ["em_andamento", "aguardando_ajustes"],
  aguardando_aprovacao: ["em_andamento", "aguardando_ajustes", "concluido"],
  aguardando_ajustes: ["retrabalho"],
  retrabalho: ["em_andamento", "concluido"],
  concluido: [],
};

const OPS_FIN_TRANSITIONS: Record<string, string[]> = {
  nao_iniciado: ["em_andamento"],
  em_andamento: ["em_pausa", "aguardando_ajustes", "concluido", "retrabalho"],
  em_pausa: ["em_andamento", "aguardando_ajustes"],
  aguardando_ajustes: ["retrabalho"],
  retrabalho: ["em_andamento", "concluido"],
  concluido: [],
};

const TRANSITIONS: Record<Area, Record<string, string[]>> = {
  comercial: SIMPLE_TRANSITIONS,
  arquitetura: SIMPLE_TRANSITIONS,
  internalizacao: INTERNALIZACAO_TRANSITIONS,
  pmo: OPS_FIN_TRANSITIONS,
  soc: OPS_FIN_TRANSITIONS,
  transicao: OPS_FIN_TRANSITIONS,
  financas: OPS_FIN_TRANSITIONS,
  supply: OPS_FIN_TRANSITIONS,
};

export function statusesForArea(area: Area): string[] {
  const allowed = new Set(Object.keys(TRANSITIONS[area]));
  return ALL_STATUSES.filter((status) => allowed.has(status));
}

export const STATUS_LABEL: Record<string, string> = {
  nao_iniciado: "Não iniciado",
  em_andamento: "Em andamento",
  retrabalho: "Retrabalho",
  concluido: "Concluído",
  em_pausa: "Em pausa",
  aguardando_aprovacao: "Aguardando aprovação",
  aguardando_ajustes: "Aguardando ajustes",
};

export function isOpsTrack(value: string): value is OpsTrack {
  return (OPS_TRACKS as readonly string[]).includes(value);
}

export function isFinTrack(value: string): value is FinTrack {
  return (FIN_TRACKS as readonly string[]).includes(value);
}

export function statusLabelForArea(area: Area, status: string): string {
  if (status === "retrabalho" && !isAdjustmentTarget(area)) {
    return "Pós ajustes";
  }
  return STATUS_LABEL[status] ?? status;
}

const STATUS_PROGRESS: Record<string, number> = {
  nao_iniciado: 0,
  retrabalho: 1,
  aguardando_ajustes: 1,
  em_pausa: 2,
  aguardando_aprovacao: 3,
  em_andamento: 4,
  concluido: 5,
};

export const ADJUSTMENT_TARGETS = ["comercial", "arquitetura"] as const;

export function isAdjustmentTarget(value: string): value is Area {
  return value === "comercial" || value === "arquitetura";
}

export function parseAdjustmentTargets(raw: string): Area[] {
  const parts = raw
    .split(/[\n,;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const unique = [...new Set(parts.filter(isAdjustmentTarget))];
  return unique;
}

export function encodeAdjustmentTargets(targets: Area[]) {
  return parseAdjustmentTargets(targets.join(",")).join(",");
}

export type AdjustmentRequest = {
  from: Area;
  para: Area[];
  justificativa: string;
};

/** Pedidos ativos (área em aguardando_ajustes com justificativa). */
export function pendingAdjustmentRequests(
  works: AreaSnapshot[],
): AdjustmentRequest[] {
  return works
    .filter(
      (work) =>
        work.status === "aguardando_ajustes" &&
        Boolean(work.ajusteJustificativa?.trim() || work.ajustePara?.trim()),
    )
    .map((work) => ({
      from: work.area,
      para: parseAdjustmentTargets(work.ajustePara ?? ""),
      justificativa: (work.ajusteJustificativa ?? "").trim(),
    }));
}

/** Pedidos que afetam Comercial ou Arquitetura na visão atual. */
export function adjustmentRequestsForViewer(
  works: AreaSnapshot[],
  viewingArea: Area,
): AdjustmentRequest[] {
  const all = pendingAdjustmentRequests(works);
  if (isAdjustmentTarget(viewingArea)) {
    return all.filter((item) => item.para.includes(viewingArea));
  }
  return all.filter((item) => item.from === viewingArea);
}

/**
 * Se o pedido foi só Comercial (ou Comercial sem Arquitetura),
 * depois que Comercial sai de Retrabalho a Arquitetura deve validar.
 */
export function needsArquiteturaValidationAfterComercial(
  finishedTarget: Area,
  targets: Area[],
) {
  return (
    finishedTarget === "comercial" &&
    targets.includes("comercial") &&
    !targets.includes("arquitetura")
  );
}

export function withArquiteturaValidation(targets: Area[]): Area[] {
  return parseAdjustmentTargets([...targets, "arquitetura"].join(","));
}

/** Status em que a área pedinte retoma após os destinos saírem de Retrabalho. */
export const RESUME_AFTER_ADJUSTMENTS_STATUS = "retrabalho" as const;

/** Gestores de aprovação — por enquanto só o e-mail de teste. */
export const APPROVAL_MANAGER_PLACEHOLDERS: Array<{
  email: string;
  label: string;
}> = [
  { email: "vitor.leal@teletex.com.br", label: "Vitor Leal (teste)" },
];

/** Serviços que abrem a lista SOC (regra Power Automate). */
export const SERVICOS_TRACK_SOC = ["SOC", "PrimeMSS"] as const;

/** Serviços que abrem a lista Transição (ex-SG / Serviços Gerenciados). */
export const SERVICOS_TRACK_TRANSICAO = [
  "NOC",
  "PrimeSD",
  "PrimeMS",
  "PrimeIAAS",
  "PrimeHoras",
  "PrimeOutsourcing",
] as const;

/** Quais frentes de Operações abrem, conforme Serviços contemplados. */
export function opsTracksForServicos(servicos: string[]): OpsTrack[] {
  const set = new Set(servicos.map((item) => item.trim()).filter(Boolean));
  const tracks: OpsTrack[] = [];
  if (includesPrimeDeploy(servicos) || set.has("PrimeDeploy")) {
    tracks.push("pmo");
  }
  if (SERVICOS_TRACK_SOC.some((code) => set.has(code))) {
    tracks.push("soc");
  }
  if (SERVICOS_TRACK_TRANSICAO.some((code) => set.has(code))) {
    tracks.push("transicao");
  }
  return tracks;
}

export function canRequestAdjustments(area: Area): boolean {
  return (
    area === "internalizacao" ||
    isOpsTrack(area) ||
    isFinTrack(area)
  );
}

/** Encadeamento fixo (Internalização usa nextAreasAfterInternalizacao). */
export const NEXT_AREAS: Record<Area, Area[]> = {
  comercial: ["arquitetura"],
  arquitetura: ["internalizacao"],
  internalizacao: [],
  pmo: [],
  soc: [],
  transicao: [],
  financas: [],
  supply: [],
};

export function nextAreasAfterInternalizacao(servicoCodes: string[]): Area[] {
  return [...opsTracksForServicos(servicoCodes), ...FIN_TRACKS];
}

export function nextAreasFor(
  fromArea: Area,
  servicoCodes: string[] = [],
): Area[] {
  if (fromArea === "internalizacao") {
    return nextAreasAfterInternalizacao(servicoCodes);
  }
  return NEXT_AREAS[fromArea] ?? [];
}

export function formatIntCode(n: number): string {
  return `INT${String(n).padStart(4, "0")}`;
}

export function isArea(value: string): value is Area {
  return (AREAS as readonly string[]).includes(value);
}

export function isAreaRoute(value: string): value is Area | typeof OPS_VIEW_SLUG {
  return isArea(value) || value === OPS_VIEW_SLUG;
}

export function isCentralColumn(value: string): value is CentralColumn {
  return (CENTRAL_COLUMNS as readonly string[]).includes(value);
}

export function parseOpsFrente(value: string | undefined | null): OpsTrack | null {
  return value && isOpsTrack(value) ? value : null;
}

export function parseFinFrente(value: string | undefined | null): FinTrack | null {
  return value && isFinTrack(value) ? value : null;
}

export function allowedNext(area: Area, from: string): string[] {
  return TRANSITIONS[area][from] ?? [];
}

export function canTransition(area: Area, from: string, to: string): boolean {
  if (from === to) {
    return false;
  }
  return allowedNext(area, from).includes(to);
}

export function assertTransition(area: Area, from: string, to: string): void {
  if (!canTransition(area, from, to)) {
    throw new Error(
      `${AREA_LABEL[area]} não pode ir de ${STATUS_LABEL[from] ?? from} para ${STATUS_LABEL[to] ?? to}.`,
    );
  }
}

export function actionLabel(area: Area, to: string): string {
  if (to === "em_andamento") {
    return "Iniciar / retomar";
  }
  if (to === "concluido") {
    return `Concluir ${AREA_LABEL[area].toLowerCase()}`;
  }
  if (to === "retrabalho") {
    return statusLabelForArea(area, "retrabalho");
  }
  if (to === "aguardando_ajustes") {
    return "Pedir ajustes";
  }
  if (to === "em_pausa") {
    return "Pausar";
  }
  if (to === "aguardando_aprovacao") {
    return "Aguardando aprovação";
  }
  return STATUS_LABEL[to] ?? to;
}

export function isPrimaryAction(to: string): boolean {
  return to === "em_andamento";
}

export type AreaSnapshot = {
  area: Area;
  status: string;
  ajustePara?: string;
  ajusteJustificativa?: string;
};

export function openWorks(works: AreaSnapshot[]): AreaSnapshot[] {
  return works.filter((work) => work.status !== "concluido");
}

export function opsWorks(works: AreaSnapshot[]): AreaSnapshot[] {
  return works.filter((work) => isOpsTrack(work.area));
}

export function finWorks(works: AreaSnapshot[]): AreaSnapshot[] {
  return works.filter((work) => isFinTrack(work.area));
}

/** Frentes Ops/Fin em aguardando_ajustes “voltaram” ao destino do pedido. */
export function isParkedForAdjustments(status: string) {
  return status === "aguardando_ajustes";
}

/**
 * Frentes paralelas ainda ativas na coluna Ops/Fin.
 * Quem pediu ajustes some daqui e fica só no Comercial/Arquitetura (Retrabalho),
 * sem segurar as outras frentes do mesmo INT.
 */
export function activeOpsWorks(works: AreaSnapshot[]): AreaSnapshot[] {
  return openWorks(opsWorks(works)).filter(
    (work) => !isParkedForAdjustments(work.status),
  );
}

export function activeFinWorks(works: AreaSnapshot[]): AreaSnapshot[] {
  return openWorks(finWorks(works)).filter(
    (work) => !isParkedForAdjustments(work.status),
  );
}

export function aggregateStatus(works: AreaSnapshot[]): string {
  const open = openWorks(works);
  if (open.length === 0) {
    return works.length > 0 ? "concluido" : "nao_iniciado";
  }
  return open.reduce((slowest, work) => {
    const current = STATUS_PROGRESS[work.status] ?? 0;
    const best = STATUS_PROGRESS[slowest] ?? 0;
    return current < best ? work.status : slowest;
  }, open[0].status);
}

export function boardAreaLabel(works: AreaSnapshot[]): string {
  const open = openWorks(works).filter((work) => {
    if (isOpsTrack(work.area) || isFinTrack(work.area)) {
      return !isParkedForAdjustments(work.status);
    }
    return true;
  });
  if (open.length === 0) {
    const parked = openWorks(works).filter((work) =>
      isParkedForAdjustments(work.status),
    );
    if (parked.length > 0) {
      return parked.map((work) => AREA_LABEL[work.area]).join(" + ");
    }
    return "Concluído";
  }
  return open.map((work) => AREA_LABEL[work.area]).join(" + ");
}
