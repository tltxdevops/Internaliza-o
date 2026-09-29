"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { BoardView } from "@/lib/viewer";

export type { BoardView };

const OPTIONS: { id: BoardView; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "kanban", label: "Kanban" },
  { id: "lista", label: "Lista" },
];

export function ViewToggle({ view }: { view: BoardView }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(next: BoardView) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "lista") {
      params.delete("view");
    } else {
      params.set("view", next);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="flex rounded-md border border-zinc-200 p-0.5 text-xs dark:border-zinc-700">
      {OPTIONS.map((option) => (
        <Link
          key={option.id}
          href={hrefFor(option.id)}
          className={tabClass(view === option.id)}
          aria-current={view === option.id ? "page" : undefined}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

function tabClass(active: boolean) {
  return active
    ? "rounded px-2.5 py-1 font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900"
    : "rounded px-2.5 py-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800";
}
