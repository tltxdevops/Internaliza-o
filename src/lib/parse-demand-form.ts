import {
  BUS_ARQUITETURA,
  decodeList,
  encodeList,
  isPlausibleEmail,
  isPrioridade,
  isStatusInternalizacao,
  isTipoDemanda,
  MOTIVOS_CORRECAO,
  prioridadeNeedsJustification,
  SA_SES_ARQUITETURA,
  SERVICOS_CONTEMPLADOS,
  showGpAndLider,
  statusInternalizacaoMeansDone,
} from "@/domain/demand-fields";
import type { DemandFieldWrite } from "@/lib/demand-board";

function readMulti(formData: FormData, name: string) {
  const values = formData
    .getAll(name)
    .map(String)
    .flatMap((item) => decodeList(item));
  return [...new Set(values)];
}

function filterKnown(values: string[], options: { value: string }[]) {
  if (options.length === 0) {
    return values;
  }
  const allowed = new Set(options.map((option) => option.value));
  return values.filter((value) => allowed.has(value));
}

function readEmail(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export function parseDemandFields(
  formData: FormData,
  lookups?: {
    servicos: { value: string }[];
    bus: { value: string }[];
    saSes: { value: string }[];
  },
):
  | { error: string }
  | { data: DemandFieldWrite } {
  const cliente = String(formData.get("cliente") ?? "").trim();
  const tipoDemanda = String(formData.get("tipoDemanda") ?? "").trim();
  const prioridade = String(formData.get("prioridade") ?? "").trim();
  const prioridadeJustificativa = String(
    formData.get("prioridadeJustificativa") ?? "",
  ).trim();
  const area = String(formData.get("formArea") ?? "").trim();
  const servicosContemplados = filterKnown(
    readMulti(formData, "servicosContemplados"),
    lookups?.servicos ?? SERVICOS_CONTEMPLADOS,
  );
  const saSesArquitetura = filterKnown(
    readMulti(formData, "saSesArquitetura"),
    lookups?.saSes ?? SA_SES_ARQUITETURA,
  );
  const busArquitetura = filterKnown(
    readMulti(formData, "busArquitetura"),
    lookups?.bus ?? BUS_ARQUITETURA,
  );
  const responsavelEmail = readEmail(formData, "responsavelEmail");
  const accountManagerEmail = readEmail(formData, "accountManagerEmail");
  const retrabalhoMarcado = formData.get("retrabalhoMarcado") === "1";
  const motivoCorrecao = filterKnown(
    readMulti(formData, "motivoCorrecao"),
    MOTIVOS_CORRECAO,
  );
  const descricaoAjuste = String(formData.get("descricaoAjuste") ?? "").trim();
  const gerenteProjetosEmail = readEmail(formData, "gerenteProjetosEmail");
  const liderTecnicoEmail = readEmail(formData, "liderTecnicoEmail");
  const statusInternalizacao = String(
    formData.get("statusInternalizacao") ?? "",
  ).trim();

  if (!cliente) {
    return { error: "Informe o cliente." };
  }
  if (!isTipoDemanda(tipoDemanda)) {
    return { error: "Selecione o tipo de demanda: Regular ou Pré-demanda." };
  }
  if (!isPrioridade(prioridade)) {
    return { error: "Selecione a prioridade." };
  }
  if (prioridadeNeedsJustification(prioridade) && !prioridadeJustificativa) {
    return { error: "Alta e Crítica exigem justificativa." };
  }
  if (!isPlausibleEmail(responsavelEmail)) {
    return { error: "Informe um e-mail válido no responsável." };
  }
  if (!isPlausibleEmail(accountManagerEmail)) {
    return { error: "Informe um e-mail válido no account manager." };
  }
  if (showGpAndLider(area, servicosContemplados)) {
    if (!gerenteProjetosEmail) {
      return { error: "PrimeDeploy em Operações exige o gerente de projetos." };
    }
    if (!liderTecnicoEmail) {
      return { error: "PrimeDeploy em Operações exige o líder técnico." };
    }
  }
  if (!isPlausibleEmail(gerenteProjetosEmail)) {
    return { error: "Informe um e-mail válido no gerente de projetos." };
  }
  if (!isPlausibleEmail(liderTecnicoEmail)) {
    return { error: "Informe um e-mail válido no líder técnico." };
  }
  if (statusInternalizacao && !isStatusInternalizacao(statusInternalizacao)) {
    return { error: "Selecione um status de internalização válido." };
  }

  return {
    data: {
      cliente,
      title: cliente,
      tipoDemanda,
      nomeOportunidade: String(formData.get("nomeOportunidade") ?? "").trim(),
      codigoProtheus: String(formData.get("codigoProtheus") ?? "").trim(),
      prioridade,
      prioridadeJustificativa: prioridadeNeedsJustification(prioridade)
        ? prioridadeJustificativa
        : "",
      servicosContemplados: encodeList(servicosContemplados),
      squadComercial: "",
      saSesArquitetura: encodeList(saSesArquitetura),
      busArquitetura: encodeList(busArquitetura),
      responsavelEmail,
      accountManagerEmail,
      retrabalhoMarcado,
      motivoCorrecao: encodeList(motivoCorrecao),
      descricaoAjuste,
      gerenteProjetosEmail,
      liderTecnicoEmail,
      statusInternalizacao,
      internalizado: statusInternalizacao
        ? statusInternalizacaoMeansDone(statusInternalizacao)
        : formData.get("internalizadoAtual") === "1",
    },
  };
}
