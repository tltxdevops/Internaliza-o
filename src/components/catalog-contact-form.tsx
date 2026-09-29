"use client";

import { useActionState } from "react";
import {
  addCatalogContactAction,
  type ActionState,
} from "@/app/actions";
import { demandInputClass } from "@/components/demand-form-fields";

const initial: ActionState = {};

export function CatalogContactForm({ itemId }: { itemId: string }) {
  const [state, action, pending] = useActionState(
    addCatalogContactAction,
    initial,
  );

  return (
    <form action={action} className="mt-auto flex flex-col gap-2 pt-3">
      <input type="hidden" name="itemId" value={itemId} />
      <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
        E-mail
        <input
          name="email"
          type="email"
          required
          placeholder="nome@teletex.com"
          className={demandInputClass}
        />
      </label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
          Nome
          <input
            name="displayName"
            type="text"
            placeholder="opcional"
            className={demandInputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
          Papel
          <input
            name="role"
            type="text"
            placeholder="coordenador, operacional…"
            className={demandInputClass}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Salvando…" : "Adicionar"}
      </button>
      {state.error ? (
        <p className="text-sm text-red-700">{state.error}</p>
      ) : null}
    </form>
  );
}
