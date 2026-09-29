"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CreateForm } from "@/app/create-form";
import type { FormLookups } from "@/lib/catalog";

export function CreateDemandPanel({ lookups }: { lookups: FormLookups }) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (searchParams.get("nova") !== "1") {
      return;
    }
    setOpen(true);
    router.replace(pathname);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Nova demanda
      </button>

      {open ? (
        <div className="fixed inset-0 z-30">
          <button
            type="button"
            aria-label="Fechar formulário"
            className="absolute inset-0 bg-zinc-950/40"
            onClick={close}
          />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <header className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-semibold">Nova demanda</h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Comercial · o card nasce em Não iniciado
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Fechar
              </button>
            </header>
            <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
              <CreateForm lookups={lookups} onCancel={close} onCreated={close} />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
