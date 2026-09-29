import type { CSSProperties, HTMLAttributes, Ref } from "react";
import { DemandIntLink } from "@/components/demand-int-link";
import { prioridadeLabel, showRetrabalhoBadge, tipoDemandaLabel } from "@/domain/demand-fields";
import {
  AREA_LABEL,
  isFinTrack,
  isOpsTrack,
  stripeForBoard,
  type Area,
} from "@/domain/status-machine";
import { demandDetailPath, type DemandCardModel } from "@/lib/demand-board";

function display(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : "—";
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-0.5 text-[12px] text-[#57606a] dark:text-zinc-400">
        {label}
      </div>
      <div className="text-[14px] font-semibold break-words text-[#24292f] dark:text-zinc-200">
        {display(value)}
      </div>
    </div>
  );
}

export function BoardDemandCard({
  demand,
  area,
  status,
  done,
  className = "",
  style,
  dragHandle,
}: {
  demand: DemandCardModel;
  area: Area;
  status: string;
  done?: boolean;
  className?: string;
  style?: CSSProperties;
  dragHandle?: HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> };
}) {
  const showRetrabalhoFlag = showRetrabalhoBadge(demand.retrabalhoMarcado);
  const stripe = stripeForBoard(done ? "concluido" : area, status);
  const frenteLabel =
    !done && (isOpsTrack(area) || isFinTrack(area)) ? AREA_LABEL[area] : null;

  return (
    <article
      className={`w-full shrink-0 overflow-hidden rounded-xl border border-[#d0d7de] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-[0_1px_3px_rgba(0,0,0,0.45)] ${className}`}
      style={style}
      {...dragHandle}
    >
      <div className="h-2" style={{ backgroundColor: stripe }} />
      <div className="p-[14px]">
        <div className="mb-3 flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <h3 className="font-mono text-[16px] font-bold break-words text-[#1f2328] dark:text-zinc-50">
              <DemandIntLink href={demandDetailPath(area, demand.id)}>
                {demand.intCode}
              </DemandIntLink>
              {frenteLabel ? (
                <span className="ml-2 font-sans text-[13px] font-semibold text-[#57606a] dark:text-zinc-400">
                  · {frenteLabel}
                </span>
              ) : null}
            </h3>
            <p className="mt-1 text-[14px] font-semibold break-words text-[#57606a] dark:text-zinc-400">
              {tipoDemandaLabel(demand.tipoDemanda)}
            </p>
          </div>
          {showRetrabalhoFlag ? (
            <span className="shrink-0 rounded-full bg-[#d92d20] px-2.5 py-1 text-[12px] font-bold text-white">
              RETRABALHO
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          <Field label="Cliente" value={demand.cliente || demand.title} />
          <Field
            label="Nome da oportunidade"
            value={demand.nomeOportunidade}
          />
          <Field
            label="Código do Projeto - Protheus"
            value={demand.codigoProtheus}
          />
          <Field label="Prioridade" value={prioridadeLabel(demand.prioridade)} />
          {demand.prioridadeJustificativa ? (
            <Field
              label="Justificativa da prioridade"
              value={demand.prioridadeJustificativa}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

export { BoardDemandCard as CentralDemandCard };
