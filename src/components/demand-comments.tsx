"use client";

import { useActionState, useEffect } from "react";
import { addDemandComment, type ActionState } from "@/app/actions";
import { demandInputClass } from "@/components/demand-form-fields";
import { AREA_LABEL, type Area } from "@/domain/status-machine";
import type { DemandCommentModel } from "@/lib/demand-comments";

const initial: ActionState = {};

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function DemandComments({
  demandId,
  area,
  comments,
  onPosted,
  compact = false,
}: {
  demandId: string;
  area: Area;
  comments: DemandCommentModel[];
  onPosted: () => void;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(addDemandComment, initial);

  useEffect(() => {
    if (state.ok) {
      onPosted();
    }
  }, [state.ok, onPosted]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={compact ? "mb-2" : "mb-3"}>
        <h3 className="text-sm font-semibold">Comentários</h3>
        {!compact ? (
          <p className="mt-0.5 text-xs text-zinc-500">
            Visíveis em todas as áreas. Autor entra quando houver login.
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-200 px-2 py-4 text-center text-xs text-zinc-400 dark:border-zinc-800">
            Nenhum comentário.
          </p>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-md border border-zinc-200 px-2 py-1.5 text-xs dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-1 text-[10px] text-zinc-500">
                <p>
                  {AREA_LABEL[comment.area as Area] ?? comment.area}
                  {comment.author ? ` · ${comment.author}` : ""}
                </p>
                <p>{formatWhen(comment.createdAt)}</p>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                {comment.body}
              </p>
            </article>
          ))
        )}
      </div>

      <form
        action={action}
        className="mt-2 flex flex-col gap-1.5 border-t border-zinc-200 pt-2 dark:border-zinc-800"
      >
        <input type="hidden" name="demandId" value={demandId} />
        <input type="hidden" name="area" value={area} />
        <textarea
          name="body"
          required
          rows={compact ? 2 : 3}
          placeholder="Comentar…"
          className={`${demandInputClass} h-auto min-h-[2.5rem] py-1.5`}
          aria-label="Comentário"
        />
        {state.error ? (
          <p className="text-xs text-red-700">{state.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "…" : "Publicar"}
        </button>
      </form>
    </div>
  );
}
