"use client";

import { useActionState, useEffect } from "react";
import { updateDemand, type ActionState } from "@/app/actions";
import { DemandFormFields } from "@/components/demand-form-fields";
import { statusBadgeClass } from "@/components/status-badge";
import { AREA_LABEL, statusLabelForArea, type Area } from "@/domain/status-machine";
import type { DemandCardModel } from "@/lib/demand-board";
import type { FormLookups } from "@/lib/catalog";

const initial: ActionState = {};

export function EditDemandForm({
  demand,
  area,
  lookups,
  onCancel,
  onSaved,
}: {
  demand: DemandCardModel;
  area: Area;
  lookups: FormLookups;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, action, pending] = useActionState(updateDemand, initial);

  useEffect(() => {
    if (state.ok) {
      onSaved();
    }
  }, [state.ok, onSaved]);

  return (
    <form action={action} className="flex h-full min-h-0 flex-col gap-5">
      <input type="hidden" name="demandId" value={demand.id} />

      <div className="flex flex-wrap items-center gap-2">
        {demand.works.map((work) => (
          <span
            key={work.area}
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(work.status)}`}
          >
            {AREA_LABEL[work.area]} · {statusLabelForArea(work.area, work.status)}
          </span>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        <DemandFormFields demand={demand} area={area} lookups={lookups} />
      </div>

      {state.error ? (
        <p className="text-sm text-red-700">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-emerald-700">{state.ok}</p>
      ) : null}

      <div className="flex shrink-0 gap-2 border-t border-zinc-200 pt-2.5 dark:border-zinc-800">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
        >
          Fechar
        </button>
      </div>
    </form>
  );
}
