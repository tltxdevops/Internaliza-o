import type { ReactNode, Ref } from "react";

export function KanbanBoard({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 items-stretch gap-3 overflow-x-auto">
      {children}
    </div>
  );
}

export function KanbanColumn({
  title,
  count,
  children,
  className = "",
  innerRef,
  wide,
  dotClass,
}: {
  title: string;
  count: number;
  children: ReactNode;
  className?: string;
  innerRef?: Ref<HTMLElement>;
  wide?: boolean;
  dotClass?: string;
}) {
  return (
    <section
      ref={innerRef}
      className={`flex h-full min-h-0 shrink-0 flex-col rounded-xl border bg-white shadow-sm dark:bg-zinc-950 ${wide === false ? "w-[17.5rem]" : "w-[20.5rem]"} ${className || "border-zinc-200 dark:border-zinc-800"}`}
    >
      <header className="flex shrink-0 items-baseline justify-between gap-2 px-3 py-2.5">
        <h2 className="flex items-center gap-1.5 text-sm font-medium">
          {dotClass ? (
            <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
          ) : null}
          {title}
        </h2>
        <span className="rounded-full bg-zinc-200/80 px-1.5 py-0.5 text-[11px] tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {count}
        </span>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        <div className="flex flex-col gap-2">{children}</div>
      </div>
    </section>
  );
}

export function KanbanEmpty() {
  return (
    <p className="rounded-md border border-dashed border-zinc-200 px-2 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
      Nenhuma demanda
    </p>
  );
}
