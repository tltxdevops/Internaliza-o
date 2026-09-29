import { NextResponse } from "next/server";
import { microsoftAuthorizeUrl, microsoftSettings } from "@/lib/microsoft";

export async function GET(request: Request) {
  if (!microsoftSettings().ready) {
    return NextResponse.json(
      { error: "SSO Microsoft nao configurado." },
      { status: 503 },
    );
  }
  const state = new URL(request.url).searchParams.get("state")?.trim() ?? "";
  if (!state) {
    return NextResponse.json({ error: "state obrigatorio." }, { status: 400 });
  }
  return NextResponse.json({ authUrl: microsoftAuthorizeUrl(state) });
}
