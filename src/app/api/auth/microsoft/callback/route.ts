import { NextResponse } from "next/server";
import { isArea } from "@/domain/status-machine";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signAppSession,
} from "@/lib/app-session";
import {
  exchangeMicrosoftCode,
  isAllowedEmail,
  microsoftAccount,
  microsoftSettings,
  bootstrapAdminEmail,
} from "@/lib/microsoft";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dest = new URL("/", microsoftSettings().origin);
  const error = url.searchParams.get("error");
  if (error) {
    dest.pathname = "/login";
    dest.searchParams.set("erro", "microsoft");
    return NextResponse.redirect(dest);
  }
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (code) {
    dest.searchParams.set("code", code);
  }
  if (state) {
    dest.searchParams.set("state", state);
  }
  return NextResponse.redirect(dest);
}

export async function POST(request: Request) {
  if (!microsoftSettings().ready) {
    return NextResponse.json(
      { error: "SSO Microsoft nao configurado." },
      { status: 503 },
    );
  }
  let code = "";
  try {
    const body = (await request.json()) as { code?: string };
    code = String(body.code ?? "").trim();
  } catch {
    code = "";
  }
  if (!code) {
    return NextResponse.json({ error: "code obrigatorio." }, { status: 400 });
  }

  try {
    const accessToken = await exchangeMicrosoftCode(code);
    const account = await microsoftAccount(accessToken);
    if (!isAllowedEmail(account.email)) {
      return NextResponse.json(
        { error: "Use uma conta @teletex.com.br." },
        { status: 403 },
      );
    }
    const access = await grantAccess(account);
    const token = signAppSession({
      sub: account.sub,
      email: account.email,
      nome: account.nome,
      cargo: access.cargo,
      departamento: access.departamento,
    });
    const response = NextResponse.json({
      user: {
        sub: account.sub,
        email: account.email,
        nome: account.nome,
        cargo: access.cargo,
        departamento: access.departamento,
        photo: account.photo,
      },
      session: {
        token,
        expiresAt: Math.floor(Date.now() / 1000) + microsoftSettings().ttlSec,
      },
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Falha ao concluir o login Microsoft." },
      { status: 401 },
    );
  }
}

async function grantAccess(account: {
  email: string;
  nome: string;
  sub: string;
  departamento: string;
}) {
  const email = account.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  const admin = email === bootstrapAdminEmail();
  const graphArea = isArea(account.departamento) ? account.departamento : "";
  const role = admin
    ? "admin"
    : existing?.role === "admin" || existing?.role === "member"
      ? existing.role
      : graphArea
        ? "member"
        : "pending";
  const area = role === "member" ? existing?.area || graphArea : "";
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: account.nome,
      microsoftId: account.sub,
      role,
      area,
    },
    update: {
      name: account.nome || existing?.name || "",
      microsoftId: account.sub || existing?.microsoftId || "",
      role,
      area: role === "member" ? area : "",
    },
  });
  return { cargo: role, departamento: role === "member" ? area : "" };
}
