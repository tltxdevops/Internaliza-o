import { redirect } from "next/navigation";
import { SsoLoginButton } from "@/components/sso-login-button";
import { readAppSession } from "@/lib/app-session";
import { microsoftSettings } from "@/lib/microsoft";
import { findUser, userCanEnter } from "@/lib/users";
import { memberHomePath } from "@/lib/viewer";

const ERRORS: Record<string, string> = {
  microsoft: "A Microsoft não concluiu o login. Tente de novo.",
  dominio: "Use uma conta @teletex.com.br.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; detalhe?: string }>;
}) {
  const session = await readAppSession();
  if (session) {
    const user = await findUser(session.email);
    if (user && userCanEnter(user)) {
      redirect(user.role === "member" && user.area ? memberHomePath(user.area) : "/");
    }
  }

  const { erro, detalhe } = await searchParams;
  const settings = microsoftSettings();
  const message = erro ? ERRORS[erro] : "";

  return (
    <main className="flex min-h-full items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <p className="text-xs tracking-wide text-zinc-500 uppercase">Internalização</p>
        <h1 className="mt-2 text-2xl font-semibold">Entrar</h1>
        <p className="mt-2 text-sm text-zinc-400">
          O acesso é só com a conta Microsoft da Teletex. Não há senha local.
        </p>
        {message ? (
          <p className="mt-4 rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {message}
            {detalhe ? <span className="mt-1 block text-red-300/80">{detalhe}</span> : null}
          </p>
        ) : null}
        {settings.ready ? (
          <SsoLoginButton />
        ) : (
          <div className="mt-6 rounded-lg border border-zinc-700 px-3 py-3 text-sm text-zinc-300">
            <p>Registre um app Web no Entra ID e preencha o `.env`:</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-zinc-400">
              <li>MICROSOFT_TENANT_ID</li>
              <li>MICROSOFT_CLIENT_ID</li>
              <li>MICROSOFT_CLIENT_SECRET</li>
              <li>APP_SESSION_SECRET</li>
            </ul>
            <p className="mt-3 text-zinc-400">
              Redirect URI local:{" "}
              <span className="break-all text-zinc-200">{settings.redirectUri}</span>
            </p>
            <p className="mt-2 text-zinc-400">
              Permissões delegadas: openid, profile, email, User.Read. Tenant único da empresa.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
