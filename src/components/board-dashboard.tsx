import { prioridadeNeedsJustification } from "@/domain/demand-fields";
import {
  AREA_LABEL,
  CENTRAL_COLUMNS,
  CENTRAL_COLUMN_LABEL,
  openWorks,
  statusLabelForArea,
  statusesForArea,
  type Area,
} from "@/domain/status-machine";
import {
  cardsInArea,
  cardsOnCentralColumn,
  cardsOnFinCentralColumn,
  cardsOnOpsCentralColumn,
  fullyDoneCards,
  type DemandCardModel,
} from "@/lib/demand-board";

export function CentralBoardDashboard({
  demands,
}: {
  demands: DemandCardModel[];
}) {
  const done = fullyDoneCards(demands);
  const withAdjustment = demands.filter((demand) =>
    demand.works.some(
      (work) =>
        work.status === "aguardando_ajustes" || work.status === "retrabalho",
    ),
  ).length;
  const urgentOpen = demands.filter(
    (demand) =>
      prioridadeNeedsJustification(demand.prioridade) &&
      openWorks(demand.works).length > 0,
  ).length;

  const columns = [
    ...CENTRAL_COLUMNS.map((column) => {
      if (column === "operacoes") {
        return {
          label: CENTRAL_COLUMN_LABEL[column],
          value: cardsOnOpsCentralColumn(demands).length,
        };
      }
      if (column === "financas") {
        return {
          label: CENTRAL_COLUMN_LABEL[column],
          value: cardsOnFinCentralColumn(demands).length,
        };
      }
      return {
        label: CENTRAL_COLUMN_LABEL[column],
        value: cardsOnCentralColumn(demands, column).length,
      };
    }),
    { label: "Concluído", value: done.length },
  ];

  return (
    <div className="flex flex-col gap-4">
      <StatGrid
        items={[
          { label: "Em aberto", value: demands.length - done.length },
          { label: "Concluídos", value: done.length },
          { label: "Com ajuste ou retrabalho", value: withAdjustment },
          { label: "Alta ou crítica em aberto", value: urgentOpen },
        ]}
      />
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
          Por coluna
        </h2>
        <StatGrid items={columns} />
      </section>
    </div>
  );
}

export function AreaBoardDashboard({
  area,
  items,
}: {
  area: Area;
  items: { demand: DemandCardModel; status: string }[];
}) {
  const adjustments = items.filter(
    (item) => item.status === "aguardando_ajustes",
  ).length;
  const rework = items.filter((item) => item.status === "retrabalho").length;
  const urgentOpen = items.filter(
    (item) =>
      item.status !== "concluido" &&
      prioridadeNeedsJustification(item.demand.prioridade),
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <StatGrid
        items={[
          { label: "Na área", value: items.length },
          { label: "Aguardando ajustes", value: adjustments },
          { label: statusLabelForArea(area, "retrabalho"), value: rework },
          { label: "Alta ou crítica em aberto", value: urgentOpen },
        ]}
      />
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
          Por status
        </h2>
        <StatGrid
          items={statusesForArea(area).map((status) => ({
            label: statusLabelForArea(area, status),
            value: items.filter((item) => item.status === status).length,
          }))}
        />
      </section>
    </div>
  );
}

export function HubBoardDashboard({
  tracks,
  demands,
}: {
  tracks: Area[];
  demands: DemandCardModel[];
}) {
  const cards = tracks.flatMap((track) =>
    cardsInArea(demands, track).map((item) => ({ ...item, area: track })),
  );
  const adjustments = cards.filter(
    (item) =>
      item.status === "aguardando_ajustes" || item.status === "retrabalho",
  ).length;
  const urgentOpen = cards.filter(
    (item) =>
      item.status !== "concluido" &&
      prioridadeNeedsJustification(item.demand.prioridade),
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <StatGrid
        items={[
          { label: "Cards nas frentes", value: cards.length },
          { label: "Com ajuste ou retrabalho", value: adjustments },
          { label: "Alta ou crítica em aberto", value: urgentOpen },
        ]}
      />
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
          Por frente
        </h2>
        <StatGrid
          items={tracks.map((track) => ({
            label: AREA_LABEL[track],
            value: cardsInArea(demands, track).length,
          }))}
        />
      </section>
    </div>
  );
}

function StatGrid({ items }: { items: { label: string; value: number }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <p className="text-xs text-zinc-500">{item.label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
