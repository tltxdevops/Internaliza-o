export default async function SemAcessoPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <main className="flex min-h-full items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-2xl font-semibold">Sem acesso</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {email ? (
            <>
              A conta <span className="text-zinc-200">{email}</span> entrou na Microsoft, mas ainda não tem uma tela liberada.
            </>
          ) : (
            "Esta conta ainda não tem uma tela liberada."
          )}{" "}
          Um admin precisa definir se você é admin ou member e, no caso de member, a área.
        </p>
        <a
          href="/login"
          className="mt-6 inline-flex text-sm text-zinc-300 underline underline-offset-4"
        >
          Voltar ao login
        </a>
      </div>
    </main>
  );
}
