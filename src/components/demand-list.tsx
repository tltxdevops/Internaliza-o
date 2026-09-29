import Link from "next/link";
import type { ReactNode, SVGProps } from "react";
import {
  AREA_LABEL,
  AREAS,
  STATUS_LABEL,
  adjustmentRequestsForViewer,
  aggregateStatus,
  boardAreaLabel,
  openWorks,
  statusLabelForArea,
  type Area,
} from "@/domain/status-machine";
import {
  prioridadeLabel,
  statusInternalizacaoLabel,
  tipoDemandaLabel,
} from "@/domain/demand-fields";
import { StatusBadge } from "@/components/status-badge";
import {
  demandDetailPath,
  type AreaBoardItem,
  type DemandCardModel,
} from "@/lib/demand-board";

function formatOpenedAt(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function OpenDemandButton({
  demand,
  area,
}: {
  demand: DemandCardModel;
  area: Area;
}) {
  return (
    <Link
      href={demandDetailPath(area, demand.id)}
      title={`Abrir ${demand.intCode}`}
      aria-label={`Abrir detalhe de ${demand.intCode}`}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      <EyeIcon className="h-4 w-4" />
    </Link>
  );
}

function intCode(demand: DemandCardModel) {
  return (
    <span className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
      {demand.intCode}
    </span>
  );
}

function AreaStatusChips({ demand }: { demand: DemandCardModel }) {
  if (demand.works.length === 0) {
    return <span className="text-zinc-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {[...demand.works]
        .sort((a, b) => AREAS.indexOf(a.area) - AREAS.indexOf(b.area))
        .map((work) => (
        <span key={work.area} className="inline-flex items-center gap-1">
          <span className="text-[11px] text-zinc-500">{AREA_LABEL[work.area]}</span>
          <StatusBadge
            status={work.status}
            label={statusLabelForArea(work.area, work.status)}
          />
        </span>
      ))}
    </div>
  );
}

function ListShell({
  children,
  empty,
}: {
  children: ReactNode;
  empty: boolean;
}) {
  if (empty) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200 px-4 py-10 text-center text-sm text-zinc-400 dark:border-zinc-800">
        Nenhuma demanda nesta visão.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-b border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`border-b border-zinc-100 px-3 py-2.5 align-middle dark:border-zinc-800 ${className}`}
    >
      {children}
    </td>
  );
}

export function CentralDemandList({ demands }: { demands: DemandCardModel[] }) {
  return (
    <ListShell empty={demands.length === 0}>
      <thead>
        <tr>
          <Th className="w-10 px-2" />
          <Th>INT</Th>
          <Th>Cliente</Th>
          <Th>Tipo de demanda</Th>
          <Th>Nome da oportunidade</Th>
          <Th>Protheus</Th>
          <Th>Prioridade</Th>
          <Th>Justificativa</Th>
          <Th>Andamento</Th>
          <Th>Status (mais atrasado)</Th>
          <Th>Por área</Th>
          <Th>Internalizado</Th>
          <Th>Aberta em</Th>
        </tr>
      </thead>
      <tbody>
        {demands.map((demand) => {
          const openArea =
            openWorks(demand.works)[0]?.area ??
            demand.works[0]?.area ??
            "comercial";
          return (
            <tr key={demand.id} className="bg-white dark:bg-zinc-950">
              <Td className="w-10 px-2">
                <OpenDemandButton demand={demand} area={openArea} />
              </Td>
              <Td>{intCode(demand)}</Td>
              <Td>
                <p className="max-w-md whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                  {demand.cliente || demand.title || "—"}
                </p>
              </Td>
              <Td>{tipoDemandaLabel(demand.tipoDemanda)}</Td>
              <Td>{demand.nomeOportunidade || "—"}</Td>
              <Td>{demand.codigoProtheus || "—"}</Td>
              <Td>{prioridadeLabel(demand.prioridade)}</Td>
              <Td>
                <p className="max-w-sm whitespace-pre-wrap">
                  {demand.prioridadeJustificativa || "—"}
                </p>
              </Td>
              <Td>{boardAreaLabel(demand.works)}</Td>
              <Td>
                <StatusBadge
                  status={aggregateStatus(demand.works)}
                  label={
                    STATUS_LABEL[aggregateStatus(demand.works)] ??
                    aggregateStatus(demand.works)
                  }
                />
              </Td>
              <Td>
                <AreaStatusChips demand={demand} />
              </Td>
              <Td>
                {statusInternalizacaoLabel(
                  demand.statusInternalizacao,
                  demand.internalizado,
                )}
              </Td>
              <Td>
                <span className="whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                  {formatOpenedAt(demand.createdAt)}
                </span>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </ListShell>
  );
}

export function AreaDemandList({
  area,
  items,
}: {
  area: Area;
  items: AreaBoardItem[];
}) {
  const mixedFrentes = items.some((item) => item.area && item.area !== area);

  return (
    <ListShell empty={items.length === 0}>
      <thead>
        <tr>
          <Th className="w-10 px-2" />
          <Th>INT</Th>
          {mixedFrentes ? <Th>Frente</Th> : null}
          <Th>Cliente</Th>
          <Th>{mixedFrentes ? "Status" : `Status em ${AREA_LABEL[area]}`}</Th>
          <Th>Pedido de ajustes</Th>
          <Th>Internalizado</Th>
          <Th>Aberta em</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const rowArea = item.area ?? area;
          const pedidos = adjustmentRequestsForViewer(
            item.demand.works,
            rowArea,
          );
          const pedidoTexto =
            pedidos.length > 0
              ? pedidos
                  .map(
                    (pedido) =>
                      `${AREA_LABEL[pedido.from]}: ${pedido.justificativa || "—"}`,
                  )
                  .join(" · ")
              : item.demand.retrabalhoMarcado && item.demand.descricaoAjuste
                ? item.demand.descricaoAjuste
                : "";

          return (
            <tr
              key={`${item.demand.id}-${rowArea}`}
              className="bg-white dark:bg-zinc-950"
            >
              <Td className="w-10 px-2">
                <OpenDemandButton demand={item.demand} area={rowArea} />
              </Td>
              <Td>{intCode(item.demand)}</Td>
              {mixedFrentes ? <Td>{AREA_LABEL[rowArea]}</Td> : null}
              <Td>
                <p className="max-w-xl whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                  {item.demand.cliente || item.demand.title || "—"}
                </p>
              </Td>
              <Td>
                <StatusBadge
                  status={item.status}
                  label={statusLabelForArea(rowArea, item.status)}
                />
              </Td>
              <Td>
                {pedidoTexto ? (
                  <p className="max-w-sm whitespace-pre-wrap text-[#d92d20]">
                    {pedidoTexto}
                  </p>
                ) : (
                  <span className="text-zinc-400">—</span>
                )}
              </Td>
              <Td>
                {statusInternalizacaoLabel(
                  item.demand.statusInternalizacao,
                  item.demand.internalizado,
                )}
              </Td>
              <Td>
                <span className="whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                  {formatOpenedAt(item.demand.createdAt)}
                </span>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </ListShell>
  );
}
