"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EditDemandForm } from "@/app/edit-demand-form";
import { DemandComments } from "@/components/demand-comments";
import { AREA_LABEL, type Area } from "@/domain/status-machine";
import type { DemandCardModel } from "@/lib/demand-board";
import type { DemandCommentModel } from "@/lib/demand-comments";
import type { FormLookups } from "@/lib/catalog";

export function DemandDetailPanel({
  demand,
  area,
  comments,
  lookups,
}: {
  demand: DemandCardModel | null;
  area: Area;
  comments: DemandCommentModel[];
  lookups: FormLookups;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = Boolean(demand);
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    setCommentsOpen(false);
  }, [demand?.id]);

  const close = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("demanda");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
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

  if (!demand) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-start p-3 sm:p-5">
      <button
        type="button"
        aria-label="Fechar demanda"
        className="absolute inset-0 bg-zinc-950/45"
        onClick={close}
      />
      <div className="relative h-full w-[min(960px,calc(100vw-2.5rem))] shrink-0">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="demand-dialog-title"
          className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-950"
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
            <div className="min-w-0">
              <h2
                id="demand-dialog-title"
                className="flex min-w-0 items-center gap-2"
              >
                <span className="truncate font-mono text-base font-semibold">
                  {demand.intCode}
                </span>
                {demand.teveRetrabalho ? (
                  <span className="shrink-0 rounded-full bg-[#d92d20] px-2 py-0.5 text-[10px] font-bold text-white">
                    RETRABALHO
                  </span>
                ) : null}
              </h2>
              <p className="text-[11px] text-zinc-500">{AREA_LABEL[area]}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setCommentsOpen((current) => !current)}
                aria-pressed={commentsOpen}
                aria-controls="demand-comments-panel"
                className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm ${
                  commentsOpen
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-900"
                }`}
              >
                Comentários
                <span
                  className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                    commentsOpen
                      ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white"
                      : comments.length > 0
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100"
                  }`}
                >
                  {comments.length}
                </span>
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-md px-2.5 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Fechar
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <EditDemandForm
              key={demand.id}
              demand={demand}
              area={area}
              lookups={lookups}
              onCancel={close}
              onSaved={() => router.refresh()}
            />
          </div>
        </div>

        <div
          id="demand-comments-panel"
          className="absolute inset-y-0 left-[calc(100%+0.75rem)] min-w-0 overflow-hidden transition-[width] duration-300 ease-out"
          style={{ width: commentsOpen ? "22rem" : 0 }}
          aria-hidden={!commentsOpen}
        >
          <div className="flex h-full w-[22rem] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950">
            <DemandComments
              key={demand.id}
              demandId={demand.id}
              area={area}
              comments={comments}
              onPosted={() => router.refresh()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
