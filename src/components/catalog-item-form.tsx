"use client";

import { useActionState } from "react";
import { addCatalogItemAction, type ActionState } from "@/app/actions";
import { demandInputClass } from "@/components/demand-form-fields";
import type { CatalogKind } from "@/domain/notify-recipients";

const initial: ActionState = {};

export function CatalogItemForm({ kind }: { kind: CatalogKind }) {
  const [state, action, pending] = useActionState(addCatalogItemAction, initial);
  const person = kind === "sa_se";

  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="kind" value={kind} />
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
        {person ? "Nome do colaborador" : "Novo item"}
        <input
          name="label"
          required
          placeholder={person ? "Nome e sobrenome" : "Nome que aparece no campo"}
          className={demandInputClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Salvando…" : person ? "Incluir colaborador" : "Incluir"}
      </button>
      {state.error ? (
        <p className="text-sm text-red-700 sm:basis-full">{state.error}</p>
      ) : null}
    </form>
  );
}
