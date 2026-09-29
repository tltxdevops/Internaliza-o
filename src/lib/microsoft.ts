function publicOrigin() {
  const explicit = process.env.PUBLIC_APP_ORIGIN?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  if (productionHost) return `https://${productionHost}`;
  const appUrl = process.env.APP_URL?.trim().replace(/\/$/, "");
  if (appUrl) return appUrl;
  return "http://localhost:3000";
}

export function microsoftSettings() {
  const tenantId = (
    process.env.MICROSOFT_TENANT_ID ||
    process.env.AZURE_AD_TENANT_ID ||
    ""
  ).trim();
  const clientId = (
    process.env.MICROSOFT_CLIENT_ID ||
    process.env.AZURE_AD_CLIENT_ID ||
    ""
  ).trim();
  const clientSecret = (
    process.env.MICROSOFT_CLIENT_SECRET ||
    process.env.AZURE_AD_CLIENT_SECRET ||
    ""
  ).trim();
  const scope = (process.env.MICROSOFT_SCOPE || "openid profile email User.Read").trim();
  const origin = publicOrigin();
  const redirectUri = (
    process.env.MICROSOFT_REDIRECT_URI ||
    `${origin}/api/auth/microsoft/callback`
  ).trim();
  const sessionSecret = (
    process.env.APP_SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    "dev-internalizacao-troque-em-producao"
  ).trim();
  const ttlSec = Number(process.env.APP_SESSION_TTL_SEC || 2_592_000);
  return {
    tenantId,
    clientId,
    clientSecret,
    scope,
    origin,
    redirectUri,
    sessionSecret,
    ttlSec: Number.isFinite(ttlSec) && ttlSec > 0 ? ttlSec : 2_592_000,
    ready: Boolean(tenantId && clientId && clientSecret),
  };
}

export function allowedEmailDomain() {
  return (process.env.ALLOWED_EMAIL_DOMAIN?.trim() || "teletex.com.br").toLowerCase();
}

export function isAllowedEmail(email: string) {
  return email.trim().toLowerCase().endsWith(`@${allowedEmailDomain()}`);
}

export function bootstrapAdminEmail() {
  return (process.env.BOOTSTRAP_ADMIN_EMAIL?.trim() || "").toLowerCase();
}

export function microsoftAuthorizeUrl(state: string) {
  const { tenantId, clientId, redirectUri, scope } = microsoftSettings();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope,
    state,
  });
  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params}`;
}

type TokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

export async function exchangeMicrosoftCode(code: string) {
  const { tenantId, clientId, clientSecret, redirectUri, scope } = microsoftSettings();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    scope,
  });
  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
  );
  const token = (await response.json()) as TokenResponse;
  if (!response.ok || !token.access_token) {
    throw new Error(token.error_description || token.error || "Falha ao trocar o code.");
  }
  return token.access_token;
}

export type MicrosoftAccount = {
  sub: string;
  email: string;
  nome: string;
  cargo: string;
  departamento: string;
  photo: string | null;
};

export async function microsoftAccount(accessToken: string): Promise<MicrosoftAccount> {
  const response = await fetch(
    "https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,jobTitle,department",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) {
    throw new Error("Não foi possível ler o perfil na Microsoft.");
  }
  const me = (await response.json()) as {
    id?: string;
    displayName?: string;
    mail?: string;
    userPrincipalName?: string;
    jobTitle?: string;
    department?: string;
  };
  const email = String(me.mail || me.userPrincipalName || "")
    .trim()
    .toLowerCase();
  if (!email) {
    throw new Error("A Microsoft não devolveu o e-mail da conta.");
  }
  return {
    sub: String(me.id || ""),
    email,
    nome: String(me.displayName || "").trim(),
    cargo: String(me.jobTitle || "").trim(),
    departamento: String(me.department || "").trim(),
    photo: await microsoftPhoto(accessToken),
  };
}

async function microsoftPhoto(accessToken: string) {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      return null;
    }
    const type = response.headers.get("content-type") || "image/jpeg";
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}
