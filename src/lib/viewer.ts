import {
  AREAS,
  FIN_VIEW_SLUG,
  OPS_VIEW_SLUG,
  isArea,
  isFinTrack,
  isOpsTrack,
  type Area,
} from "@/domain/status-machine";

export const ROLE_COOKIE = "internalizacao-papel";
export const AREA_COOKIE = "internalizacao-area";

export type ViewerRole = "admin" | "member";

export type Viewer = {
  role: ViewerRole;
  area: Area;
  name: string;
  email: string;
};

export type BoardView = "dashboard" | "kanban" | "lista";

export function parseBoardView(value: string | undefined | null): BoardView {
  if (value === "dashboard" || value === "kanban") {
    return value;
  }
  return "lista";
}

export function parseViewerRole(value: string | undefined | null): ViewerRole {
  return value === "member" ? "member" : "admin";
}

export function parseViewerArea(value: string | undefined | null): Area {
  return isArea(value ?? "") ? (value as Area) : "comercial";
}

export function memberHomePath(area: Area, view?: string | null) {
  const params = new URLSearchParams();
  if (isOpsTrack(area) || isFinTrack(area)) {
    params.set("frente", area);
  }
  if (view === "dashboard" || view === "kanban") {
    params.set("view", view);
  }
  const qs = params.toString();
  const base = isOpsTrack(area)
    ? `/areas/${OPS_VIEW_SLUG}`
    : isFinTrack(area)
      ? `/areas/${FIN_VIEW_SLUG}`
      : `/areas/${area}`;
  return qs ? `${base}?${qs}` : base;
}

/** Member só abre o quadro da área escolhida, nunca a visão geral do hub. */
export function memberMaySeeAreaRoute(
  area: Area,
  route: string,
  frente?: string | null,
) {
  if (isOpsTrack(area)) {
    return route === OPS_VIEW_SLUG && frente === area;
  }
  if (isFinTrack(area)) {
    return route === FIN_VIEW_SLUG && frente === area;
  }
  return route === area && AREAS.includes(area);
}
