"use client";

import { useActionState, useEffect } from "react";
import { createDemand, type ActionState } from "@/app/actions";
import { DemandFormFields } from "@/components/demand-form-fields";
import type { FormLookups } from "@/lib/catalog";

const initial: ActionState = {};

export function CreateForm({
  lookups,
  onCancel,
  onCreated,
}: {
  lookups: FormLookups;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [state, action, pending] = useActionState(createDemand, initial);

  useEffect(() => {
    if (state.ok) {
      onCreated();
    }
  }, [state.ok, onCreated]);

  return (
    <form action={action} className="flex flex-1 flex-col gap-4">
      <DemandFormFields area="comercial" lookups={lookups} />

      {state.error ? (
        <p className="text-sm text-red-700">{state.error}</p>
      ) : null}

      <div className="mt-auto flex gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
