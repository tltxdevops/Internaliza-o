"use client";

import { useState } from "react";
import {
  ADJUSTMENT_TARGETS,
  AREA_LABEL,
  type Area,
} from "@/domain/status-machine";

export function AdjustmentRequestDialog({
  intCode,
  onCancel,
  onConfirm,
  pending,
}: {
  intCode: string;
  onCancel: () => void;
  onConfirm: (ajustePara: Area[], justificativa: string) => void;
  pending: boolean;
}) {
  const [ajustePara, setAjustePara] = useState<Area[]>(["comercial"]);
  const [justificativa, setJustificativa] = useState("");

  function toggle(target: Area, checked: boolean) {
    setAjustePara((current) => {
      if (checked) {
        return current.includes(target) ? current : [...current, target];
      }
      return current.filter((item) => item !== target);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/40"
        onClick={pending ? undefined : onCancel}
        aria-label="Fechar"
      />
      <div className="relative w-full max-w-md rounded-lg border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Aguardando ajustes · {intCode}</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Pode enviar para Comercial, Arquitetura ou os dois. Cada um entra em
          Retrabalho.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm">Enviar para</legend>
            <span className="text-xs text-zinc-500">Seleção múltipla</span>
            <div className="flex gap-3">
              {ADJUSTMENT_TARGETS.map((target) => (
                <label
                  key={target}
                  className="flex items-center gap-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={ajustePara.includes(target)}
                    onChange={(event) => toggle(target, event.target.checked)}
                    disabled={pending}
                  />
                  {AREA_LABEL[target]}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex flex-col gap-1 text-sm">
            Justificativa
            <textarea
              required
              rows={4}
              value={justificativa}
              onChange={(event) => setJustificativa(event.target.value)}
              disabled={pending}
              placeholder="O que precisa ser ajustado?"
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={
              pending || !justificativa.trim() || ajustePara.length === 0
            }
            onClick={() => onConfirm(ajustePara, justificativa.trim())}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {pending ? "Enviando…" : "Enviar"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
