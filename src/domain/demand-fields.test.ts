import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BUS_ARQUITETURA,
  decodeList,
  encodeList,
  includesPrimeDeploy,
  isPlausibleEmail,
  lookupLabels,
  MOTIVOS_CORRECAO,
  SA_SES_ARQUITETURA,
  SERVICO_PRIME_DEPLOY,
  SERVICOS_CONTEMPLADOS,
  showGpAndLider,
  showRetrabalhoBadge,
  STATUS_INTERNALIZACAO,
  statusInternalizacaoLabel,
  statusInternalizacaoMeansDone,
} from "./demand-fields";

test("lista JSON e texto viram array", () => {
  assert.deepEqual(decodeList('["prime_deploy"]'), ["prime_deploy"]);
  assert.deepEqual(decodeList("Ajustes comercial\nAjustes arquitetura"), [
    "Ajustes comercial",
    "Ajustes arquitetura",
  ]);
  assert.equal(encodeList(["prime_deploy"]), '["prime_deploy"]');
});

test("PrimeDeploy no serviço pede GP e líder só em PMO", () => {
  assert.equal(includesPrimeDeploy([SERVICO_PRIME_DEPLOY]), true);
  assert.equal(showGpAndLider("pmo", [SERVICO_PRIME_DEPLOY]), true);
  assert.equal(showGpAndLider("comercial", [SERVICO_PRIME_DEPLOY]), false);
  assert.equal(showGpAndLider("pmo", []), false);
  assert.equal(showGpAndLider("operacoes", [SERVICO_PRIME_DEPLOY]), false);
});

test("motivo de correção tem Comercial e Arquitetura", () => {
  assert.equal(
    lookupLabels(MOTIVOS_CORRECAO, ["ajustes_comercial", "ajustes_arquitetura"]),
    "Ajustes comercial, Ajustes arquitetura",
  );
});

test("listas de serviço, SA/SE e BU batem com o SharePoint", () => {
  assert.equal(
    SERVICOS_CONTEMPLADOS.some((item) => item.value === SERVICO_PRIME_DEPLOY),
    true,
  );
  assert.equal(
    SERVICOS_CONTEMPLADOS.some((item) => item.label === "PrimeOutsourcing"),
    true,
  );
  assert.equal(
    SA_SES_ARQUITETURA.some((item) => item.label === "Default"),
    true,
  );
  assert.equal(
    BUS_ARQUITETURA.some((item) => item.label === "Smart Devices"),
    true,
  );
});

test("internalização tem os três status do SharePoint", () => {
  assert.deepEqual(
    STATUS_INTERNALIZACAO.map((item) => item.label),
    [
      "Internalizado",
      "Internalizado com pendência",
      "Não internalizado",
    ],
  );
  assert.equal(statusInternalizacaoMeansDone("internalizado"), true);
  assert.equal(
    statusInternalizacaoMeansDone("internalizado_com_pendencia"),
    true,
  );
  assert.equal(statusInternalizacaoMeansDone("nao_internalizado"), false);
  assert.equal(
    statusInternalizacaoLabel("internalizado_com_pendencia"),
    "Internalizado com pendência",
  );
});

test("flag RETRABALHO só com o campo Retrabalho? marcado", () => {
  assert.equal(showRetrabalhoBadge(true), true);
  assert.equal(showRetrabalhoBadge(false), false);
});

test("e-mail vazio passa; e-mail incompleto não", () => {
  assert.equal(isPlausibleEmail(""), true);
  assert.equal(isPlausibleEmail("ana@teletex.com"), true);
  assert.equal(isPlausibleEmail("ana"), false);
});
