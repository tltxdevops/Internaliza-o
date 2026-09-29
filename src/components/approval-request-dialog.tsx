"use client";

import { APPROVAL_MANAGER_PLACEHOLDERS } from "@/domain/status-machine";

export function ApprovalRequestDialog({
  intCode,
  onCancel,
  onConfirm,
  pending,
}: {
  intCode: string;
  onCancel: () => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  const gestores = APPROVAL_MANAGER_PLACEHOLDERS.map(
    (item) => `${item.label} (${item.email})`,
  ).join(", ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/40"
        onClick={pending ? undefined : onCancel}
        aria-label="Fechar"
      />
      <div className="relative w-full max-w-md rounded-lg border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">
          Aguardando aprovação · {intCode}
        </h2>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Enviar aprovação do card <span className="font-medium">{intCode}</span>{" "}
          para gestores: {gestores}.
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Os e-mails oficiais entram depois; por enquanto a lista é placeholder e
          o envio fica registrado em Cadastros → Envios.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {pending ? "Enviando…" : "Enviar aprovação"}
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
