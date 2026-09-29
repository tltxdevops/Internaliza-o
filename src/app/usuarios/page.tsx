import { redirect } from "next/navigation";
import { saveUserAccess } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { AREA_LABEL, AREAS } from "@/domain/status-machine";
import { readViewer } from "@/lib/read-viewer";
import { listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const viewer = await readViewer();
  if (viewer.role !== "admin") {
    redirect("/");
  }
  const users = await listUsers();

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
      <PageHeader
        title="Usuários"
        description="Quem entra pela Microsoft já tem sessão. Aqui você define se a pessoa é admin ou member e, para member, a área da lista."
      />

      <form action={saveUserAccess} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          E-mail
          <input
            name="email"
            type="email"
            required
            placeholder="nome@teletex.com.br"
            className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <RoleFields />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Salvar
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead className="text-xs text-zinc-500">
            <tr>
              <th className="px-3 py-2 font-medium">Pessoa</th>
              <th className="px-3 py-2 font-medium">Acesso</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-zinc-400" colSpan={2}>
                  Ninguém entrou ainda. Inclua o e-mail antes, ou a pessoa entra e fica sem acesso até você liberar.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.email} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-3 py-2">
                    <div className="font-medium">{user.name || user.email}</div>
                    {user.name ? (
                      <div className="text-xs text-zinc-500">{user.email}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    <form action={saveUserAccess} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="email" value={user.email} />
                      <RoleFields role={user.role} area={user.area} />
                      <button
                        type="submit"
                        className="rounded-md border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
                      >
                        Atualizar
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleFields({
  role = "member",
  area = "comercial",
}: {
  role?: string;
  area?: string;
}) {
  return (
    <>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Papel
        <select
          name="role"
          defaultValue={role}
          className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        >
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="pending">Sem acesso</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Área do member
        <select
          name="area"
          defaultValue={area || "comercial"}
          className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        >
          {AREAS.map((item) => (
            <option key={item} value={item}>
              {AREA_LABEL[item]}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
