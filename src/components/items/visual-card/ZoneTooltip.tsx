import type { ComponentStatus } from "@/types";
import { formatDate } from "@/lib/format";
import { statusColor, ZONE_STATUS_LABEL } from "./zoneStatusColors";

export interface ZoneTooltipInfo {
  label: string;
  status: ComponentStatus;
  lastEventDate?: Date | null;
  lastEventKm?: number | null;
}

export function ZoneTooltip({ info }: { info: ZoneTooltipInfo | null }) {
  if (!info) {
    return <p className="m-0 text-xs text-gray-400">Pasa el ratón o toca una zona para ver su estado.</p>;
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium text-gray-800">{info.label}</span>
      <div className="flex items-center gap-2.5">
        <span className="text-xs text-gray-400">
          {info.lastEventDate
            ? `${formatDate(info.lastEventDate)}${info.lastEventKm ? ` · ${info.lastEventKm.toLocaleString("es-ES")} km` : ""}`
            : "Sin registros"}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: statusColor(info.status) }}>
          {ZONE_STATUS_LABEL[info.status]}
        </span>
      </div>
    </div>
  );
}
