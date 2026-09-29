"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { moveDemandStatus } from "@/app/actions";
import { AdjustmentRequestDialog } from "@/components/adjustment-request-dialog";
import { ApprovalRequestDialog } from "@/components/approval-request-dialog";
import { BoardDemandCard } from "@/components/central-demand-card";
import { KanbanBoard, KanbanColumn, KanbanEmpty } from "@/components/kanban";
import { statusDotClass } from "@/components/status-badge";
import {
  AREA_LABEL,
  canTransition,
  statusLabelForArea,
  type Area,
} from "@/domain/status-machine";
import type { AreaBoardItem } from "@/lib/demand-board";

export function AreaStatusKanban({
  area,
  columns,
  items,
}: {
  area: Area;
  columns: string[];
  items: AreaBoardItem[];
}) {
  const router = useRouter();
  const [cards, setCards] = useState(items);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [adjustRequest, setAdjustRequest] = useState<{
    demandId: string;
    intCode: string;
  } | null>(null);
  const [approvalRequest, setApprovalRequest] = useState<{
    demandId: string;
    intCode: string;
  } | null>(null);

  const [dndReady, setDndReady] = useState(false);

  useEffect(() => {
    setCards(items);
  }, [items]);

  useEffect(() => {
    setDndReady(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const activeCard = cards.find((item) => item.demand.id === activeId);

  const grouped = useMemo(() => {
    const map = new Map<string, AreaBoardItem[]>();
    for (const status of columns) {
      map.set(status, []);
    }
    for (const item of cards) {
      const list = map.get(item.status);
      if (list) {
        list.push(item);
      }
    }
    return map;
  }, [cards, columns]);

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function onDragEnd(event: DragEndEvent) {
    const demandId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    setActiveId(null);

    if (!overId || pending) {
      return;
    }

    const item = cards.find((card) => card.demand.id === demandId);
    if (!item || item.status === "concluido") {
      return;
    }

    const to = overId;
    if (!columns.includes(to) || item.status === to) {
      return;
    }

    if (!canTransition(area, item.status, to)) {
      return;
    }

    if (to === "aguardando_ajustes") {
      setAdjustRequest({ demandId, intCode: item.demand.intCode });
      return;
    }

    if (to === "aguardando_aprovacao" && area === "internalizacao") {
      setApprovalRequest({ demandId, intCode: item.demand.intCode });
      return;
    }

    if (to === "concluido") {
      const ok = window.confirm(
        `Concluir ${item.demand.intCode} em ${AREA_LABEL[area]}? A próxima área pode ser destravada.`,
      );
      if (!ok) {
        return;
      }
    }

    const previous = cards;
    setCards((current) =>
      current.map((card) =>
        card.demand.id === demandId ? { ...card, status: to } : card,
      ),
    );
    setPending(true);
    const result = await moveDemandStatus(demandId, area, to);
    setPending(false);

    if (result.error) {
      setCards(previous);
      window.alert(result.error);
      return;
    }

    router.refresh();
  }

  async function confirmAdjustment(ajustePara: Area[], justificativa: string) {
    if (!adjustRequest) {
      return;
    }
    const demandId = adjustRequest.demandId;
    const previous = cards;
    setCards((current) =>
      current.map((card) =>
        card.demand.id === demandId
          ? { ...card, status: "aguardando_ajustes" }
          : card,
      ),
    );
    setPending(true);
    const result = await moveDemandStatus(demandId, area, "aguardando_ajustes", {
      ajustePara,
      justificativa,
    });
    setPending(false);
    setAdjustRequest(null);

    if (result.error) {
      setCards(previous);
      window.alert(result.error);
      return;
    }

    router.refresh();
  }

  async function confirmApproval() {
    if (!approvalRequest) {
      return;
    }
    const demandId = approvalRequest.demandId;
    const previous = cards;
    setCards((current) =>
      current.map((card) =>
        card.demand.id === demandId
          ? { ...card, status: "aguardando_aprovacao" }
          : card,
      ),
    );
    setPending(true);
    const result = await moveDemandStatus(
      demandId,
      area,
      "aguardando_aprovacao",
    );
    setPending(false);
    setApprovalRequest(null);

    if (result.error) {
      setCards(previous);
      window.alert(result.error);
      return;
    }

    router.refresh();
  }

  function renderBoard(interactive: boolean) {
    return (
      <KanbanBoard>
        {columns.map((status) => {
          const columnCards = grouped.get(status) ?? [];
          const body =
            columnCards.length === 0 ? (
              <KanbanEmpty />
            ) : (
              columnCards.map((item) =>
                interactive ? (
                  <DraggableCard
                    key={item.demand.id}
                    item={item}
                    area={area}
                    disabled={pending || item.status === "concluido"}
                  />
                ) : (
                  <BoardDemandCard
                    key={item.demand.id}
                    demand={item.demand}
                    area={area}
                    status={item.status}
                    className={
                      item.status === "concluido"
                        ? "cursor-default opacity-90"
                        : "cursor-grab"
                    }
                  />
                ),
              )
            );

          if (!interactive) {
            return (
              <KanbanColumn
                key={status}
                title={statusLabelForArea(area, status)}
                count={columnCards.length}
                dotClass={statusDotClass(status)}
              >
                {body}
              </KanbanColumn>
            );
          }

          return (
            <DropColumn
              key={status}
              status={status}
              title={statusLabelForArea(area, status)}
              count={columnCards.length}
              fromStatus={activeCard?.status}
              area={area}
            >
              {body}
            </DropColumn>
          );
        })}
      </KanbanBoard>
    );
  }

  return (
    <>
      {dndReady ? (
        <DndContext
          id={`area-kanban-${area}`}
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          {renderBoard(true)}
          <DragOverlay>
            {activeCard ? (
              <BoardDemandCard
                demand={activeCard.demand}
                area={area}
                status={activeCard.status}
                className="rotate-1 shadow-lg"
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        renderBoard(false)
      )}
      {adjustRequest ? (
        <AdjustmentRequestDialog
          intCode={adjustRequest.intCode}
          pending={pending}
          onCancel={() => setAdjustRequest(null)}
          onConfirm={confirmAdjustment}
        />
      ) : null}
      {approvalRequest ? (
        <ApprovalRequestDialog
          intCode={approvalRequest.intCode}
          pending={pending}
          onCancel={() => setApprovalRequest(null)}
          onConfirm={confirmApproval}
        />
      ) : null}
    </>
  );
}

function DropColumn({
  status,
  title,
  count,
  children,
  fromStatus,
  area,
}: {
  status: string;
  title: string;
  count: number;
  children: ReactNode;
  fromStatus?: string;
  area: Area;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const valid =
    fromStatus != null &&
    (fromStatus === status || canTransition(area, fromStatus, status));
  const highlight =
    isOver && fromStatus
      ? valid
        ? "border-emerald-400 dark:border-emerald-600"
        : "border-rose-300 dark:border-rose-800"
      : "border-zinc-200 dark:border-zinc-800";

  return (
    <KanbanColumn
      innerRef={setNodeRef}
      title={title}
      count={count}
      dotClass={statusDotClass(status)}
      className={highlight}
    >
      {children}
    </KanbanColumn>
  );
}

function DraggableCard({
  item,
  area,
  disabled,
}: {
  item: AreaBoardItem;
  area: Area;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.demand.id,
    disabled,
  });

  return (
    <BoardDemandCard
      demand={item.demand}
      area={area}
      status={item.status}
      className={`${disabled ? "cursor-default opacity-90" : "cursor-grab active:cursor-grabbing"} ${isDragging ? "opacity-40" : ""}`}
      dragHandle={{
        ref: setNodeRef,
        ...listeners,
        ...attributes,
      }}
    />
  );
}
