import Link from "next/link";
import { SsoReturn } from "@/components/sso-return";
import { redirect } from "next/navigation";
import { CentralBoardDashboard } from "@/components/board-dashboard";
import { CentralDemandCard } from "@/components/central-demand-card";
import { CentralDemandList } from "@/components/demand-list";
import { KanbanBoard, KanbanColumn, KanbanEmpty } from "@/components/kanban";
import { PageHeader } from "@/components/page-header";
import {
  CENTRAL_COLUMNS,
  CENTRAL_COLUMN_LABEL,
  isArea,
} from "@/domain/status-machine";
import {
  cardsOnCentralColumn,
  cardsOnFinCentralColumn,
  cardsOnOpsCentralColumn,
  fullyDoneCards,
  hydrateRetrabalhoFlags,
  toDemandCard,
} from "@/lib/demand-board";
import { prisma } from "@/lib/prisma";
import { readViewer } from "@/lib/read-viewer";
import { memberHomePath, parseBoardView } from "@/lib/viewer";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; code?: string; state?: string }>;
}) {
  const { view: viewParam, code, state } = await searchParams;
  if (code && state) {
    return <SsoReturn code={code} state={state} />;
  }
  const viewer = await readViewer();
  if (viewer.role === "member") {
    redirect(memberHomePath(viewer.area, viewParam));
  }
  const view = parseBoardView(viewParam);
  const rows = await prisma.demand.findMany({
    orderBy: { createdAt: "desc" },
    include: { areaWorks: true },
  });
  const demands = rows.map(toDemandCard);
  await hydrateRetrabalhoFlags(demands);
  const done = fullyDoneCards(demands);

  return (
    <div className={boardFrame(view)}>
      <SsoReturn />
      <PageHeader
        title="Board central"
        badge="Somente leitura"
        view={view}
        actions={
          <Link
            href="/areas/comercial?nova=1"
            className="inline-flex rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Nova demanda
          </Link>
        }
      />

      {view === "dashboard" ? (
        <CentralBoardDashboard demands={demands} />
      ) : view === "lista" ? (
        <CentralDemandList demands={demands} />
      ) : (
        <KanbanBoard>
          {CENTRAL_COLUMNS.map((column) => {
            if (column === "operacoes") {
              const cards = cardsOnOpsCentralColumn(demands);
              return (
                <KanbanColumn
                  key={column}
                  title={CENTRAL_COLUMN_LABEL.operacoes}
                  count={cards.length}
                  wide
                >
                  {cards.length === 0 ? (
                    <KanbanEmpty />
                  ) : (
                    cards.map(({ demand, status, area }) => (
                      <CentralDemandCard
                        key={`${demand.id}-ops`}
                        demand={demand}
                        area={area}
                        status={status}
                      />
                    ))
                  )}
                </KanbanColumn>
              );
            }
            if (column === "financas") {
              const cards = cardsOnFinCentralColumn(demands);
              return (
                <KanbanColumn
                  key={column}
                  title={CENTRAL_COLUMN_LABEL.financas}
                  count={cards.length}
                  wide
                >
                  {cards.length === 0 ? (
                    <KanbanEmpty />
                  ) : (
                    cards.map(({ demand, status, area }) => (
                      <CentralDemandCard
                        key={`${demand.id}-fin`}
                        demand={demand}
                        area={area}
                        status={status}
                      />
                    ))
                  )}
                </KanbanColumn>
              );
            }
            if (!isArea(column)) {
              return null;
            }
            const cards = cardsOnCentralColumn(demands, column);
            return (
              <KanbanColumn
                key={column}
                title={CENTRAL_COLUMN_LABEL[column]}
                count={cards.length}
                wide
              >
                {cards.length === 0 ? (
                  <KanbanEmpty />
                ) : (
                  cards.map(({ demand, status }) => (
                    <CentralDemandCard
                      key={`${demand.id}-${column}`}
                      demand={demand}
                      area={column}
                      status={status}
                    />
                  ))
                )}
              </KanbanColumn>
            );
          })}
          <KanbanColumn title="Concluído" count={done.length} wide>
            {done.length === 0 ? (
              <KanbanEmpty />
            ) : (
              done.map((demand) => (
                <CentralDemandCard
                  key={demand.id}
                  demand={demand}
                  area={demand.works[0]?.area ?? "comercial"}
                  status="concluido"
                  done
                />
              ))
            )}
          </KanbanColumn>
        </KanbanBoard>
      )}
    </div>
  );
}

function boardFrame(view: "dashboard" | "kanban" | "lista") {
  return `mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-5 px-5 py-5 ${view === "kanban" ? "overflow-hidden" : "overflow-y-auto"}`;
}
