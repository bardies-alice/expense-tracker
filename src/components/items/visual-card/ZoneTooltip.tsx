import clsx from "clsx";
import type { ComponentStatus } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import { statusColor } from "./zoneStatusColors";

export interface ZoneTooltipInfo {
  label: string;
  status: ComponentStatus;
  lastEventDate?: Date | null;
  lastEventKm?: number | null;
}

const STATUS_TEXT: Record<ComponentStatus, string> = {
  ok: "Al día",
  warning: "Próximo",
  overdue: "Atrasado",
  unknown: "Sin datos",
};

export function ZoneTooltip({ info, dark = false }: { info: ZoneTooltipInfo | null; dark?: boolean }) {
  if (!info) {
    return (
      <p className={clsx("text-xs", dark ? "text-[#5b6270]" : "text-gray-400")}>
        {dark ? "Selecciona un testigo para ver su estado." : "Pasa el ratón sobre una zona del vehículo para ver su estado."}
      </p>
    );
  }

  if (dark) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[#e8eaed]">{info.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7d8590]">
            {info.lastEventDate
              ? `${formatDate(info.lastEventDate)}${info.lastEventKm ? ` · ${info.lastEventKm.toLocaleString("es-ES")} km` : ""}`
              : "Sin registros"}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: statusColor(info.status) }}>
            {STATUS_TEXT[info.status]}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
      <div>
        <p className="font-medium text-gray-900">{info.label}</p>
        <p className="text-xs text-gray-500">
          {info.lastEventDate
            ? `Último: ${formatDate(info.lastEventDate)}${info.lastEventKm ? ` · ${info.lastEventKm} km` : ""}`
            : "Sin registros todavía"}
        </p>
      </div>
      <StatusBadge status={info.status} />
    </div>
  );
}
