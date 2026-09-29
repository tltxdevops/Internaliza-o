import Link from "next/link";
import { redirect } from "next/navigation";
import { removeCatalogContactAction, removeCatalogItemAction } from "@/app/actions";
import { CatalogContactForm } from "@/components/catalog-contact-form";
import { CatalogItemForm } from "@/components/catalog-item-form";
import { PageHeader } from "@/components/page-header";
import {
  AREA_LABEL,
  isArea,
  statusLabelForArea,
} from "@/domain/status-machine";
import {
  CATALOG_KIND_LABEL,
  isCatalogKind,
  type CatalogKind,
} from "@/domain/notify-recipients";
import { listCatalog, listNotificationLogs } from "@/lib/catalog";
import { readViewer } from "@/lib/read-viewer";
import { memberHomePath } from "@/lib/viewer";

export const dynamic = "force-dynamic";

const TABS: CatalogKind[] = ["servico", "bu", "sa_se"];

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("pt-BR");
}

export default async function CadastrosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo: tipoParam } = await searchParams;
  const viewer = await readViewer();
  if (viewer.role === "member") {
    redirect(memberHomePath(viewer.area));
  }
  const kind: CatalogKind = isCatalogKind(tipoParam ?? "")
    ? (tipoParam as CatalogKind)
    : "servico";
  const items = await listCatalog(kind);
  const logs = await listNotificationLogs(25);
  const smtpReady = Boolean(process.env.SMTP_HOST?.trim());

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
      <PageHeader
        title="Cadastros"
        badge="Lookups"
        description="Serviços, BUs e os nomes de SA/SE desta base são as opções dos campos do card. Incluir ou remover aqui atualiza a lista. Os e-mails em cada serviço ou BU continuam só para o disparo de status."
      />

      <nav className="flex flex-wrap gap-1">
        {TABS.map((tab) => {
          const active = tab === kind;
          return (
            <Link
              key={tab}
              href={`/cadastros?tipo=${tab}`}
              className={
                active
                  ? "rounded bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "rounded px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }
            >
              {CATALOG_KIND_LABEL[tab]}
            </Link>
          );
        })}
      </nav>

      <CatalogItemForm key={kind} kind={kind} />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold">{item.label}</h2>
                {item.code !== item.label ? (
                  <p className="text-xs text-zinc-500">{item.code}</p>
                ) : null}
              </div>
              <form action={removeCatalogItemAction}>
                <input type="hidden" name="itemId" value={item.id} />
                <button
                  type="submit"
                  className="text-xs text-red-700 hover:underline"
                >
                  Remover
                </button>
              </form>
            </div>
            {kind === "sa_se" ? null : (
              <>
                {item.contacts.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-500">
                    Nenhum e-mail. Enquanto estiver vazio, este item não entra no
                    disparo.
                  </p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1">
                    {item.contacts.map((contact) => (
                      <li
                        key={contact.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-sm"
                      >
                        <span className="min-w-0 break-all">
                          {contact.email}
                          {contact.displayName ? ` · ${contact.displayName}` : ""}
                          {contact.role ? ` · ${contact.role}` : ""}
                        </span>
                        <form action={removeCatalogContactAction}>
                          <input type="hidden" name="contactId" value={contact.id} />
                          <button
                            type="submit"
                            className="text-xs text-red-700 hover:underline"
                          >
                            Remover
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
                <CatalogContactForm itemId={item.id} />
              </>
            )}
          </article>
        ))}
      </section>

      <section className="flex flex-col gap-3 pb-8">
        <div>
          <h2 className="text-lg font-semibold">Envios</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {smtpReady
              ? "SMTP configurado: o disparo tenta sair de verdade e fica registrado abaixo."
              : "Sem SMTP_HOST no .env: a mudança de status grava o e-mail aqui (canal log). Quando tiver servidor, preenche SMTP_* e APP_URL."}
          </p>
        </div>
        {logs.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Ainda não houve mudança de status desde que o cadastro foi ligado.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {logs.map((log) => {
              const areaLabel = isArea(log.area)
                ? AREA_LABEL[log.area]
                : log.area;
              const fromLabel = isArea(log.area)
                ? statusLabelForArea(log.area, log.fromStatus)
                : log.fromStatus;
              const toLabel = isArea(log.area)
                ? statusLabelForArea(log.area, log.toStatus)
                : log.toStatus;
              return (
                <li
                  key={log.id}
                  className="flex min-h-0 flex-col rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium">{log.subject}</p>
                    <p className="text-xs text-zinc-500">
                      {formatWhen(log.createdAt)} · {log.channel}
                      {log.error ? " · erro" : ""}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {areaLabel}: {fromLabel} → {toLabel}
                    {log.recipients.length
                      ? ` · ${log.recipients.join(", ")}`
                      : " · sem destinatários"}
                  </p>
                  {log.error ? (
                    <p className="mt-1 text-xs text-red-700">{log.error}</p>
                  ) : null}
                  <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap font-sans text-xs text-zinc-600 dark:text-zinc-400">
                    {log.body}
                  </pre>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
