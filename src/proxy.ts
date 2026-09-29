import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifyAppSession } from "@/lib/app-session";

function isPublic(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/sem-acesso") ||
    pathname === "/auth/microsoft/login" ||
    pathname === "/api/auth/microsoft/login" ||
    pathname === "/auth/microsoft/callback" ||
    pathname === "/api/auth/microsoft/callback" ||
    pathname === "/auth/logout" ||
    pathname === "/api/auth/logout"
  );
}

function bearer(request: NextRequest) {
  const header = request.headers.get("authorization") ?? "";
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const finishingLogin = pathname === "/" && Boolean(code && state);
  if (finishingLogin) {
    requestHeaders.set("x-sso-pending", "1");
  }

  const token = bearer(request) || request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifyAppSession(token);
  const apiPath = pathname.startsWith("/api/") || pathname.startsWith("/auth/");

  if (apiPath && !isPublic(pathname)) {
    if (!session) {
      return NextResponse.json(
        { error: "Autenticacao SSO obrigatoria." },
        { status: 401 },
      );
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!isPublic(pathname) && !finishingLogin && !session && !pathname.startsWith("/api/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|gif|webp)$).*)",
  ],
};
