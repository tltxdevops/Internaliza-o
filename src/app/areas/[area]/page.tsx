import { notFound, redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AreaStatusKanban } from "@/components/area-status-kanban";
import {
  AreaBoardDashboard,
  HubBoardDashboard,
} from "@/components/board-dashboard";
import { CentralDemandCard } from "@/components/central-demand-card";
import { CreateDemandPanel } from "@/components/create-demand-panel";
import { DemandDetailPanel } from "@/components/demand-detail-panel";
import { AreaDemandList } from "@/components/demand-list";
import { FinTrackTabs } from "@/components/fin-track-tabs";
import { KanbanBoard, KanbanColumn, KanbanEmpty } from "@/components/kanban";
import { OpsTrackTabs } from "@/components/ops-track-tabs";
import { PageHeader } from "@/components/page-header";
import {
  AREA_LABEL,
  AREAS,
  FIN_TRACKS,
  FIN_VIEW_SLUG,
  OPS_TRACKS,
  OPS_VIEW_SLUG,
  isArea,
  isAreaRoute,
  isOpsTrack,
  parseFinFrente,
  parseOpsFrente,
  statusesForArea,
  type Area,
  type FinTrack,
  type OpsTrack,
} from "@/domain/status-machine";
import {
  cardsInArea,
  finFrentePath,
  hydrateRetrabalhoFlags,
  opsFrentePath,
  toDemandCard,
} from "@/lib/demand-board";
import { listDemandComments } from "@/lib/demand-comments";
import { listFormLookups, type FormLookups } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { readViewer } from "@/lib/read-viewer";
import {
  memberHomePath,
  memberMaySeeAreaRoute,
  parseBoardView,
  type BoardView,
} from "@/lib/viewer";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [
    ...AREAS.map((area) => ({ area })),
    { area: OPS_VIEW_SLUG },
  ];
}

export default async function AreaPage({
  params,
  searchParams,
}: {
  params: Promise<{ area: string }>;
  searchParams: Promise<{ view?: string; demanda?: string; frente?: string }>;
}) {
  const { area: areaParam } = await params;
  const {
    view: viewParam,
    demanda: demandaParam,
    frente: frenteParam,
  } = await searchParams;
  if (!isAreaRoute(areaParam)) {
    notFound();
  }

  const viewer = await readViewer();
  if (
    viewer.role === "member" &&
    !memberMaySeeAreaRoute(viewer.area, areaParam, frenteParam)
  ) {
    redirect(memberHomePath(viewer.area, viewParam));
  }

  /** URLs antigas /areas/pmo|soc|transicao → hub de Operações. */
  if (isOpsTrack(areaParam)) {
    redirect(
      opsFrentePath(areaParam, {
        view: viewParam,
        demanda: demandaParam,
      }),
    );
  }

  /** /areas/supply → hub Finanças. */
  if (areaParam === "supply") {
    redirect(
      finFrentePath("supply", {
        view: viewParam,
        demanda: demandaParam,
      }),
    );
  }

  const view = parseBoardView(viewParam);
  const rows = await prisma.demand.findMany({
    orderBy: { createdAt: "desc" },
    include: { areaWorks: true },
  });
  const demands = rows.map(toDemandCard);
  await hydrateRetrabalhoFlags(demands);
  const lookups = await listFormLookups();

  if (areaParam === OPS_VIEW_SLUG) {
    const frente = parseOpsFrente(frenteParam);
    if (frente) {
      return (
        <HubTrackBoard
          hub="operacoes"
          track={frente}
          view={view}
          demands={demands}
          demandaParam={demandaParam}
          lookups={lookups}
          showTabs={viewer.role === "admin"}
        />
      );
    }

    return (
      <HubOverview
        title="Operações"
        tracks={[...OPS_TRACKS]}
        tabs={<OpsTrackTabs active="todas" />}
        view={view}
        demands={demands}
      />
    );
  }

  if (areaParam === FIN_VIEW_SLUG) {
    const frente = parseFinFrente(frenteParam);
    if (frente) {
      return (
        <HubTrackBoard
          hub="financas"
          track={frente}
          view={view}
          demands={demands}
          demandaParam={demandaParam}
          lookups={lookups}
          showTabs={viewer.role === "admin"}
        />
      );
    }

    return (
      <HubOverview
        title="Finanças"
        tracks={[...FIN_TRACKS]}
        tabs={<FinTrackTabs active="todas" />}
        view={view}
        demands={demands}
      />
    );
  }

  if (!isArea(areaParam)) {
    notFound();
  }
  const area: Area = areaParam;
  const isComercial = area === "comercial";
  const inArea = cardsInArea(demands, area);
  const columns = statusesForArea(area);
  const items = inArea.map(({ demand, status }) => ({ demand, status }));
  const openDemand =
    demands.find((demand) => demand.id === demandaParam) ?? null;
  const comments = openDemand
    ? await listDemandComments(openDemand.id)
    : [];

  return (
    <div className={boardFrame(view)}>
      <PageHeader
        title={AREA_LABEL[area]}
        view={view}
        actions={
          isComercial ? (
            <Suspense>
              <CreateDemandPanel lookups={lookups} />
            </Suspense>
          ) : null
        }
      />

      {view === "dashboard" ? (
        <AreaBoardDashboard area={area} items={items} />
      ) : view === "lista" ? (
        <AreaDemandList area={area} items={items} />
      ) : (
        <AreaStatusKanban area={area} columns={columns} items={items} />
      )}

      <Suspense>
        <DemandDetailPanel
          demand={openDemand}
          area={area}
          comments={comments}
          lookups={lookups}
        />
      </Suspense>
    </div>
  );
}

function HubOverview({
  title,
  tracks,
  tabs,
  view,
  demands,
}: {
  title: string;
  tracks: Area[];
  tabs: ReactNode;
  view: BoardView;
  demands: ReturnType<typeof toDemandCard>[];
}) {
  return (
    <div className={boardFrame(view)}>
      <PageHeader title={title} badge="Visão geral" view={view} />
      <Suspense>{tabs}</Suspense>
      {view === "dashboard" ? (
        <HubBoardDashboard tracks={tracks} demands={demands} />
      ) : view === "lista" ? (
        <AreaDemandList
          area={tracks[0]}
          items={demands.flatMap((demand) => {
            const openTracks = demand.works.filter((work) =>
              tracks.includes(work.area),
            );
            if (openTracks.length === 0) {
              return [];
            }
            return openTracks.map((track) => ({
              demand,
              status: track.status,
              area: track.area,
            }));
          })}
        />
      ) : (
        <KanbanBoard>
          {tracks.map((track) => {
            const cards = cardsInArea(demands, track);
            return (
              <KanbanColumn
                key={track}
                title={AREA_LABEL[track]}
                count={cards.length}
                wide
              >
                {cards.length === 0 ? (
                  <KanbanEmpty />
                ) : (
                  cards.map(({ demand, status }) => (
                    <CentralDemandCard
                      key={`${demand.id}-${track}`}
                      demand={demand}
                      area={track}
                      status={status}
                    />
                  ))
                )}
              </KanbanColumn>
            );
          })}
        </KanbanBoard>
      )}
    </div>
  );
}

async function HubTrackBoard({
  hub,
  track,
  view,
  demands,
  demandaParam,
  lookups,
  showTabs,
}: {
  hub: "operacoes" | "financas";
  track: OpsTrack | FinTrack;
  view: BoardView;
  demands: ReturnType<typeof toDemandCard>[];
  demandaParam?: string;
  lookups: FormLookups;
  showTabs: boolean;
}) {
  const inArea = cardsInArea(demands, track);
  const columns = statusesForArea(track);
  const items = inArea.map(({ demand, status }) => ({ demand, status }));
  const openDemand =
    demands.find((demand) => demand.id === demandaParam) ?? null;
  const comments = openDemand
    ? await listDemandComments(openDemand.id)
    : [];
  const hubLabel = hub === "operacoes" ? "Operações" : "Finanças";

  return (
    <div className={boardFrame(view)}>
      <PageHeader
        title={showTabs ? `${hubLabel} · ${AREA_LABEL[track]}` : AREA_LABEL[track]}
        view={view}
      />
      {showTabs ? (
        <Suspense>
          {hub === "operacoes" ? (
            <OpsTrackTabs active={track as OpsTrack} />
          ) : (
            <FinTrackTabs active={track as FinTrack} />
          )}
        </Suspense>
      ) : null}
      {view === "dashboard" ? (
        <AreaBoardDashboard area={track} items={items} />
      ) : view === "lista" ? (
        <AreaDemandList area={track} items={items} />
      ) : (
        <AreaStatusKanban area={track} columns={columns} items={items} />
      )}
      <Suspense>
        <DemandDetailPanel
          demand={openDemand}
          area={track}
          comments={comments}
          lookups={lookups}
        />
      </Suspense>
    </div>
  );
}

function boardFrame(view: BoardView) {
  return `mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-5 px-5 py-5 ${view === "kanban" ? "overflow-hidden" : "overflow-y-auto"}`;
}
