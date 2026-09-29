"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AREA_LABEL,
  OPS_TRACKS,
  OPS_VIEW_SLUG,
  isOpsTrack,
  type OpsTrack,
} from "@/domain/status-machine";

function overviewHref(view: string | null) {
  if (view === "kanban" || view === "dashboard") {
    return `/areas/${OPS_VIEW_SLUG}?view=${view}`;
  }
  return `/areas/${OPS_VIEW_SLUG}`;
}

function buildHref(track: OpsTrack, view: string | null, demanda: string | null) {
  const params = new URLSearchParams();
  params.set("frente", track);
  if (view === "kanban" || view === "dashboard") {
    params.set("view", view);
  }
  if (demanda) {
    params.set("demanda", demanda);
  }
  const qs = params.toString();
  return `/areas/${OPS_VIEW_SLUG}?${qs}`;
}

export function OpsTrackTabs({ active }: { active?: OpsTrack | "todas" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const demanda = searchParams.get("demanda");
  const frenteParam = searchParams.get("frente");
  const fromPath = pathname.match(/^\/areas\/(pmo|soc|transicao)/)?.[1];
  const current: OpsTrack | "todas" =
    active ??
    (isOpsTrack(frenteParam ?? "")
      ? (frenteParam as OpsTrack)
      : isOpsTrack(fromPath ?? "")
        ? (fromPath as OpsTrack)
        : "todas");

  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
      <Link
        href={overviewHref(view)}
        className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
          current === "todas"
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }`}
      >
        Visão geral
      </Link>
      {OPS_TRACKS.map((track) => (
        <Link
          key={track}
          href={buildHref(track, view, demanda)}
          className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
            current === track
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {AREA_LABEL[track]}
        </Link>
      ))}
    </div>
  );
}
