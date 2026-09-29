import assert from "node:assert/strict";
import { test } from "node:test";
import { signAppSession, verifyAppSession } from "./app-session";

test("JWT da sessão aceita assinatura HS256 e recusa token alterado", () => {
  const token = signAppSession({
    sub: "abc",
    email: "vitor.leal@teletex.com.br",
    nome: "Vitor",
    cargo: "admin",
    departamento: "",
  });
  const session = verifyAppSession(token);
  assert.equal(session?.email, "vitor.leal@teletex.com.br");
  assert.equal(session?.cargo, "admin");
  assert.equal(verifyAppSession(`${token}x`), null);
});
