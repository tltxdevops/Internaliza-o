"use client";

import { useActionState, useState } from "react";
import { changeAreaStatus, type ActionState } from "@/app/actions";
import {
  actionLabel,
  allowedNext,
  AREA_LABEL,
  isPrimaryAction,
  statusLabelForArea,
  type Area,
} from "@/domain/status-machine";

const initial: ActionState = {};

export function StatusForm({
  demandId,
  area,
  current,
  showAreaLabel = true,
}: {
  demandId: string;
  area: Area;
  current: string;
  showAreaLabel?: boolean;
}) {
  const [state, action, pending] = useActionState(changeAreaStatus, initial);
  const [pendingTo, setPendingTo] = useState<string | null>(null);
  const next = allowedNext(area, current);

  if (next.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        {AREA_LABEL[area]} concluída nesta demanda.
      </p>
    );
  }

  if (pendingTo) {
    const irreversible = pendingTo === "concluido";
    return (
      <form action={action} className="flex max-w-sm flex-col gap-2">
        <input type="hidden" name="demandId" value={demandId} />
        <input type="hidden" name="area" value={area} />
        <input type="hidden" name="to" value={pendingTo} />
        <p className="text-sm text-zinc-800">
          {AREA_LABEL[area]}: {statusLabelForArea(area, current)} →{" "}
          {statusLabelForArea(area, pendingTo)}?
        </p>
        {irreversible ? (
          <p className="text-xs text-zinc-600">
            Concluir abre a próxima área (ou Operações e Finanças, se for
            Internalização). Neste piloto a área concluída não volta.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-zinc-900 px-3 py-1 text-sm text-white disabled:opacity-50"
          >
            {pending ? "Salvando…" : "Confirmar"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setPendingTo(null)}
            className="rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-800"
          >
            Cancelar
          </button>
        </div>
        {state.error ? (
          <span className="text-sm text-red-700">{state.error}</span>
        ) : null}
      </form>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {showAreaLabel ? (
        <p className="text-xs font-medium text-zinc-500">{AREA_LABEL[area]}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {next.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setPendingTo(status)}
            className={
              isPrimaryAction(status)
                ? "rounded bg-zinc-900 px-3 py-1 text-sm text-white"
                : "rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-800"
            }
          >
            {actionLabel(area, status)}
          </button>
        ))}
      </div>
      {state.error ? (
        <span className="text-sm text-red-700">{state.error}</span>
      ) : null}
    </div>
  );
}
