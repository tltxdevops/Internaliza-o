import assert from "node:assert/strict";
import { test } from "node:test";
import {
  memberHomePath,
  memberMaySeeAreaRoute,
  parseBoardView,
} from "./viewer";

test("lista continua o padrão da visão", () => {
  assert.equal(parseBoardView(undefined), "lista");
  assert.equal(parseBoardView("lista"), "lista");
  assert.equal(parseBoardView("kanban"), "kanban");
  assert.equal(parseBoardView("dashboard"), "dashboard");
});

test("e-mail da Teletex é aceito no login", async () => {
  const { isAllowedEmail } = await import("./microsoft");
  assert.equal(isAllowedEmail("vitor.leal@teletex.com.br"), true);
  assert.equal(isAllowedEmail("alguem@gmail.com"), false);
});

test("member abre só a frente escolhida", () => {
  assert.equal(memberHomePath("comercial"), "/areas/comercial");
  assert.equal(
    memberHomePath("pmo", "kanban"),
    "/areas/operacoes?frente=pmo&view=kanban",
  );
  assert.equal(
    memberHomePath("supply", "dashboard"),
    "/areas/financas?frente=supply&view=dashboard",
  );
  assert.equal(memberMaySeeAreaRoute("pmo", "operacoes", "pmo"), true);
  assert.equal(memberMaySeeAreaRoute("pmo", "operacoes", "soc"), false);
  assert.equal(memberMaySeeAreaRoute("pmo", "operacoes", null), false);
  assert.equal(memberMaySeeAreaRoute("comercial", "comercial", null), true);
  assert.equal(memberMaySeeAreaRoute("comercial", "arquitetura", null), false);
});
