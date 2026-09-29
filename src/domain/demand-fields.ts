export const TIPOS_DEMANDA = ["regular", "pre_demanda"] as const;

export type TipoDemanda = (typeof TIPOS_DEMANDA)[number];

export const TIPO_DEMANDA_LABEL: Record<TipoDemanda, string> = {
  regular: "Regular",
  pre_demanda: "Pré-demanda",
};

export function isTipoDemanda(value: string): value is TipoDemanda {
  return (TIPOS_DEMANDA as readonly string[]).includes(value);
}

export function tipoDemandaLabel(value: string) {
  if (isTipoDemanda(value)) {
    return TIPO_DEMANDA_LABEL[value];
  }
  return value.trim() ? value : "—";
}

export const PRIORIDADES = ["normal", "media", "alta", "critica"] as const;

export type Prioridade = (typeof PRIORIDADES)[number];

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  normal: "Normal",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

export function isPrioridade(value: string): value is Prioridade {
  return (PRIORIDADES as readonly string[]).includes(value);
}

export function prioridadeNeedsJustification(value: string) {
  return value === "alta" || value === "critica";
}

export function prioridadeLabel(value: string) {
  if (isPrioridade(value)) {
    return PRIORIDADE_LABEL[value];
  }
  return value.trim() ? value : "—";
}

export type LookupOption = { value: string; label: string };

export const SERVICO_PRIME_DEPLOY = "prime_deploy";

function labeled(labels: string[]): LookupOption[] {
  return labels.map((label) => ({ value: label, label }));
}

export const SERVICOS_CONTEMPLADOS: LookupOption[] = [
  { value: SERVICO_PRIME_DEPLOY, label: "PrimeDeploy" },
  ...labeled([
    "NOC",
    "SOC",
    "PrimeSD",
    "PrimeMS",
    "PrimeMSS",
    "PrimeIAAS",
    "PrimeHoras",
    "PrimeOutsourcing",
  ]),
];

export const MOTIVOS_CORRECAO: LookupOption[] = [
  { value: "ajustes_comercial", label: "Ajustes comercial" },
  { value: "ajustes_arquitetura", label: "Ajustes arquitetura" },
];

/** Motivos a partir dos destinos do pedido de ajustes. */
export function motivosFromAdjustmentTargets(targets: string[]) {
  const motivos: string[] = [];
  if (targets.includes("comercial")) {
    motivos.push("ajustes_comercial");
  }
  if (targets.includes("arquitetura")) {
    motivos.push("ajustes_arquitetura");
  }
  return motivos;
}

export function motivoCorrecaoLabel(value: string) {
  return MOTIVOS_CORRECAO.find((item) => item.value === value)?.label ?? value;
}

export const SA_SES_ARQUITETURA: LookupOption[] = labeled([
  "Andre Frank",
  "Bruno da Costa Pereira",
  "Estefani Frutos",
  "Bruna Menezes Cerri",
  "Elison Padilha Feliciano",
  "Felipe Assis Santos",
  "Felipe Porto",
  "Fernando Piovesan",
  "Gregorio Augusto R. L. Bueno",
  "Gregório Oliveira",
  "Gustavo Tadeu",
  "Igor Vinicius Mussoi de Lima",
  "Jean Patrick Cachoeira",
  "Lidiane Wiesner",
  "Maiquel Consalter",
  "Marcos Vinicius Fraga",
  "Matheus Gustavo Montico",
  "Pedro Ferreira",
  "Default",
]);

export const BUS_ARQUITETURA: LookupOption[] = labeled([
  "Data Center",
  "Networking",
  "Observabilidade",
  "Segurança",
  "Serviços",
  "Smart Devices",
]);

export function lookupLabel(options: LookupOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function lookupLabels(options: LookupOption[], values: string[]) {
  return values
    .map((value) => lookupLabel(options, value))
    .filter(Boolean)
    .join(", ");
}

export function decodeList(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((item) => item.trim()).filter(Boolean);
      }
    } catch {
      // texto livre
    }
  }
  return trimmed
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function encodeList(values: string[]) {
  return JSON.stringify(values.map((item) => item.trim()).filter(Boolean));
}

export function includesPrimeDeploy(servicos: string[]) {
  return servicos.includes(SERVICO_PRIME_DEPLOY);
}

export function showGpAndLider(area: string, servicos: string[]) {
  return area === "pmo" && includesPrimeDeploy(servicos);
}

export function isPlausibleEmail(value: string) {
  if (!value) {
    return true;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const STATUS_INTERNALIZACAO: LookupOption[] = [
  { value: "internalizado", label: "Internalizado" },
  {
    value: "internalizado_com_pendencia",
    label: "Internalizado com pendência",
  },
  { value: "nao_internalizado", label: "Não internalizado" },
];

export function isStatusInternalizacao(value: string) {
  return STATUS_INTERNALIZACAO.some((item) => item.value === value);
}

export function statusInternalizacaoLabel(
  value: string,
  fallbackInternalizado = false,
) {
  const found = STATUS_INTERNALIZACAO.find((item) => item.value === value);
  if (found) {
    return found.label;
  }
  if (fallbackInternalizado) {
    return "Internalizado";
  }
  return value.trim() ? value : "—";
}

export function statusInternalizacaoMeansDone(value: string) {
  return (
    value === "internalizado" || value === "internalizado_com_pendencia"
  );
}

/** Flag vermelha do card: só o campo Retrabalho? = sim, não a coluna do kanban. */
export function showRetrabalhoBadge(retrabalhoMarcado: boolean) {
  return retrabalhoMarcado;
}
