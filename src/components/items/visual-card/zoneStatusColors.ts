import type { ComponentStatus } from "@/types";

// Testigos de salpicadero: apagado (unknown), verde fijo (ok), ámbar/rojo con resplandor (warning/overdue).
export const ZONE_STATUS_COLOR: Record<ComponentStatus, string> = {
  ok: "#35d48a",
  warning: "#ffb545",
  overdue: "#ff5a5a",
  unknown: "#454b54",
};

export const ZONE_STATUS_GLOW: Record<ComponentStatus, string> = {
  ok: "rgba(53, 212, 138, 0.55)",
  warning: "rgba(255, 181, 69, 0.65)",
  overdue: "rgba(255, 90, 90, 0.7)",
  unknown: "transparent",
};

export const ZONE_STATUS_LABEL: Record<ComponentStatus, string> = {
  ok: "Al día",
  warning: "Próximo",
  overdue: "Atrasado",
  unknown: "Sin datos",
};

export const ZONE_STATUS_BADGE_BG: Record<ComponentStatus, string> = {
  ok: "#c6f6d5",
  warning: "#feebc8",
  overdue: "#fed7d7",
  unknown: "#edf2f7",
};

export const ZONE_STATUS_BADGE_TEXT: Record<ComponentStatus, string> = {
  ok: "#22543d",
  warning: "#744210",
  overdue: "#742a2a",
  unknown: "#718096",
};

export function statusColor(status: ComponentStatus | undefined) {
  return ZONE_STATUS_COLOR[status ?? "unknown"];
}

export function statusGlow(status: ComponentStatus | undefined) {
  return ZONE_STATUS_GLOW[status ?? "unknown"];
}

export function isActive(status: ComponentStatus | undefined) {
  return status === "warning" || status === "overdue";
}
