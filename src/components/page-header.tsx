import { Suspense, type ReactNode } from "react";
import { ViewToggle } from "@/components/view-toggle";
import type { BoardView } from "@/lib/viewer";

export function PageHeader({
  title,
  description,
  badge,
  actions,
  view,
}: {
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
  view?: BoardView;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {title}
          </h1>
          {badge ? (
            <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
              {badge}
            </span>
          ) : null}
          {view ? (
            <Suspense>
              <ViewToggle view={view} />
            </Suspense>
          ) : null}
        </div>
        {description ? (
          <p className="max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
