import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { microsoftSettings } from "@/lib/microsoft";

export const SESSION_COOKIE = "internalizacao_session";

export type AppSession = {
  sub: string;
  email: string;
  nome: string;
  cargo: string;
  departamento: string;
  iat: number;
  exp: number;
};

function secret() {
  return microsoftSettings().sessionSecret;
}

function ttlSec() {
  return microsoftSettings().ttlSec;
}

function sign(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function signAppSession(input: {
  sub: string;
  email: string;
  nome: string;
  cargo: string;
  departamento: string;
}) {
  const now = Math.floor(Date.now() / 1000);
  const payload: AppSession = {
    sub: input.sub,
    email: input.email.trim().toLowerCase(),
    nome: input.nome,
    cargo: input.cargo,
    departamento: input.departamento,
    iat: now,
    exp: now + ttlSec(),
  };
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url",
  );
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const data = `${header}.${body}`;
  return `${data}.${sign(data)}`;
}

export function verifyAppSession(token: string | undefined | null): AppSession | null {
  if (!token) {
    return null;
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [header, body, mac] = parts;
  const data = `${header}.${body}`;
  const expected = sign(data);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AppSession;
    if (!payload.email || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function tokenFromRequest(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!cookie) {
    return null;
  }
  return decodeURIComponent(cookie.slice(SESSION_COOKIE.length + 1));
}

export function sessionCookieOptions() {
  const ttl = ttlSec();
  const secure =
    process.env.NODE_ENV === "production" ||
    microsoftSettings().origin.startsWith("https://");
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: ttl,
  };
}

export async function readAppSession(): Promise<AppSession | null> {
  const store = await cookies();
  return verifyAppSession(store.get(SESSION_COOKIE)?.value);
}

export const AUTH_REQUIRED = { error: "Autenticacao SSO obrigatoria." } as const;
