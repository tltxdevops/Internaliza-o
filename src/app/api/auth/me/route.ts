import { NextResponse } from "next/server";
import { AUTH_REQUIRED, tokenFromRequest, verifyAppSession } from "@/lib/app-session";

export async function GET(request: Request) {
  const session = verifyAppSession(tokenFromRequest(request));
  if (!session) {
    return NextResponse.json(AUTH_REQUIRED, { status: 401 });
  }
  return NextResponse.json({
    user: {
      sub: session.sub,
      email: session.email,
      nome: session.nome,
      cargo: session.cargo,
      departamento: session.departamento,
    },
  });
}
