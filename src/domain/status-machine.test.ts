import assert from "node:assert/strict";
import { test } from "node:test";
import {
  activeFinWorks,
  activeOpsWorks,
  aggregateStatus,
  allowedNext,
  APPROVAL_MANAGER_PLACEHOLDERS,
  boardAreaLabel,
  canTransition,
  formatIntCode,
  needsArquiteturaValidationAfterComercial,
  nextAreasAfterInternalizacao,
  NEXT_AREAS,
  opsTracksForServicos,
  parseAdjustmentTargets,
  RESUME_AFTER_ADJUSTMENTS_STATUS,
  statusLabelForArea,
  statusesForArea,
  withArquiteturaValidation,
} from "./status-machine";
import { SERVICO_PRIME_DEPLOY } from "./demand-fields";

test("INT sequencial com 4 dígitos", () => {
  assert.equal(formatIntCode(1), "INT0001");
  assert.equal(formatIntCode(12), "INT0012");
});

test("Comercial e Arquitetura: não iniciado só vai para em andamento", () => {
  assert.deepEqual(allowedNext("comercial", "nao_iniciado"), ["em_andamento"]);
  assert.deepEqual(allowedNext("arquitetura", "nao_iniciado"), ["em_andamento"]);
  assert.equal(canTransition("comercial", "nao_iniciado", "concluido"), false);
});

test("Comercial e Arquitetura não têm Aguardando aprovação nem ajustes", () => {
  assert.equal(
    canTransition("comercial", "em_andamento", "aguardando_ajustes"),
    false,
  );
  assert.equal(
    canTransition("arquitetura", "em_andamento", "aguardando_aprovacao"),
    false,
  );
});

test("Internalização tem Aguardando aprovação; frentes de Ops e Finanças não", () => {
  assert.equal(
    canTransition("internalizacao", "em_andamento", "aguardando_aprovacao"),
    true,
  );
  assert.equal(
    canTransition("pmo", "em_andamento", "aguardando_aprovacao"),
    false,
  );
  assert.equal(
    canTransition("soc", "em_andamento", "aguardando_aprovacao"),
    false,
  );
  assert.equal(
    canTransition("financas", "em_andamento", "aguardando_aprovacao"),
    false,
  );
  assert.equal(canTransition("supply", "em_andamento", "aguardando_aprovacao"), false);
});

test("Concluir Internalização abre frentes por serviço + Finanças + Supply", () => {
  assert.deepEqual(NEXT_AREAS.comercial, ["arquitetura"]);
  assert.deepEqual(nextAreasAfterInternalizacao([SERVICO_PRIME_DEPLOY]), [
    "pmo",
    "financas",
    "supply",
  ]);
  assert.deepEqual(nextAreasAfterInternalizacao(["SOC"]), [
    "soc",
    "financas",
    "supply",
  ]);
  assert.deepEqual(nextAreasAfterInternalizacao(["NOC", "PrimeMSS"]), [
    "soc",
    "transicao",
    "financas",
    "supply",
  ]);
  assert.deepEqual(nextAreasAfterInternalizacao([]), ["financas", "supply"]);
});

test("regras Power Automate: PMO / SOC / Transição por serviços", () => {
  assert.deepEqual(opsTracksForServicos([SERVICO_PRIME_DEPLOY]), ["pmo"]);
  assert.deepEqual(opsTracksForServicos(["SOC"]), ["soc"]);
  assert.deepEqual(opsTracksForServicos(["PrimeMSS"]), ["soc"]);
  assert.deepEqual(opsTracksForServicos(["PrimeSD", "PrimeHoras"]), [
    "transicao",
  ]);
  assert.deepEqual(
    opsTracksForServicos([SERVICO_PRIME_DEPLOY, "SOC", "NOC"]),
    ["pmo", "soc", "transicao"],
  );
});

test("status do board é o mais atrasado das frentes abertas", () => {
  assert.equal(
    aggregateStatus([
      { area: "pmo", status: "em_andamento" },
      { area: "financas", status: "concluido" },
    ]),
    "em_andamento",
  );
  assert.equal(
    boardAreaLabel([
      { area: "pmo", status: "em_andamento" },
      { area: "financas", status: "concluido" },
    ]),
    "PMO",
  );
});

test("frentes Ops/Fin em aguardando_ajustes não seguram as outras no board", () => {
  assert.deepEqual(
    activeOpsWorks([
      { area: "pmo", status: "aguardando_ajustes" },
      { area: "soc", status: "em_andamento" },
      { area: "financas", status: "em_andamento" },
    ]).map((work) => work.area),
    ["soc"],
  );
  assert.deepEqual(
    activeFinWorks([
      { area: "financas", status: "aguardando_ajustes" },
      { area: "supply", status: "em_pausa" },
      { area: "pmo", status: "em_andamento" },
    ]).map((work) => work.area),
    ["supply"],
  );
  assert.equal(
    boardAreaLabel([
      { area: "pmo", status: "aguardando_ajustes" },
      { area: "soc", status: "em_andamento" },
      { area: "comercial", status: "retrabalho" },
    ]),
    "SOC + Comercial",
  );
});

test("colunas de status por área", () => {
  assert.deepEqual(statusesForArea("comercial"), [
    "nao_iniciado",
    "em_andamento",
    "retrabalho",
    "concluido",
  ]);
  assert.equal(statusesForArea("internalizacao").includes("aguardando_aprovacao"), true);
  assert.equal(statusesForArea("internalizacao").includes("aguardando_ajustes"), true);
  assert.equal(statusesForArea("pmo").includes("aguardando_aprovacao"), false);
  assert.equal(statusesForArea("transicao").includes("aguardando_ajustes"), true);
  assert.equal(statusesForArea("financas").includes("aguardando_ajustes"), true);
  assert.equal(statusesForArea("supply").includes("aguardando_ajustes"), true);
  assert.equal(statusesForArea("comercial").includes("aguardando_ajustes"), false);
});

test("Retrabalho em Comercial/Arquitetura; Pós ajustes nas outras áreas", () => {
  assert.equal(statusLabelForArea("comercial", "retrabalho"), "Retrabalho");
  assert.equal(statusLabelForArea("arquitetura", "retrabalho"), "Retrabalho");
  assert.equal(statusLabelForArea("internalizacao", "retrabalho"), "Pós ajustes");
  assert.equal(statusLabelForArea("pmo", "retrabalho"), "Pós ajustes");
  assert.equal(statusLabelForArea("soc", "retrabalho"), "Pós ajustes");
});

test("ajustes aceitam Comercial e Arquitetura juntos", () => {
  assert.deepEqual(parseAdjustmentTargets("comercial,arquitetura"), [
    "comercial",
    "arquitetura",
  ]);
  assert.deepEqual(parseAdjustmentTargets("comercial"), ["comercial"]);
  assert.deepEqual(parseAdjustmentTargets(""), []);
});

test("Internalização, Ops e Finanças pedem ajustes para Comercial ou Arquitetura", () => {
  assert.equal(canTransition("internalizacao", "em_andamento", "aguardando_ajustes"), true);
  assert.equal(canTransition("pmo", "em_andamento", "aguardando_ajustes"), true);
  assert.equal(canTransition("transicao", "em_pausa", "aguardando_ajustes"), true);
  assert.equal(canTransition("financas", "em_pausa", "aguardando_ajustes"), true);
  assert.equal(canTransition("supply", "em_pausa", "aguardando_ajustes"), true);
  assert.equal(canTransition("internalizacao", "aguardando_ajustes", "concluido"), false);
  assert.equal(
    canTransition("internalizacao", "aguardando_ajustes", "retrabalho"),
    true,
  );
  assert.equal(
    canTransition("soc", "aguardando_ajustes", "retrabalho"),
    true,
  );
});

test("só Comercial pede validação de Arquitetura depois; só Arquitetura não força Comercial", () => {
  assert.equal(
    needsArquiteturaValidationAfterComercial("comercial", ["comercial"]),
    true,
  );
  assert.equal(
    needsArquiteturaValidationAfterComercial("comercial", [
      "comercial",
      "arquitetura",
    ]),
    false,
  );
  assert.equal(
    needsArquiteturaValidationAfterComercial("arquitetura", ["arquitetura"]),
    false,
  );
  assert.deepEqual(withArquiteturaValidation(["comercial"]), [
    "comercial",
    "arquitetura",
  ]);
  assert.equal(RESUME_AFTER_ADJUSTMENTS_STATUS, "retrabalho");
});

test("aprovação tem gestores placeholder até os e-mails oficiais", () => {
  assert.ok(APPROVAL_MANAGER_PLACEHOLDERS.length >= 1);
  assert.ok(
    APPROVAL_MANAGER_PLACEHOLDERS.every(
      (item) => item.email.includes("@") && item.label.trim(),
    ),
  );
  assert.equal(
    APPROVAL_MANAGER_PLACEHOLDERS[0]?.email,
    "vitor.leal@teletex.com.br",
  );
});
