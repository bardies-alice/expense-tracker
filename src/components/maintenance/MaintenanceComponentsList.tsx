"use client";

import type { ComponentTypeDefinition } from "@/lib/constants/componentTypes";
import { MaintenanceComponentForm } from "./MaintenanceComponentForm";
import { ZONE_STATUS_BADGE_BG, ZONE_STATUS_BADGE_TEXT, ZONE_STATUS_LABEL } from "@/components/items/visual-card/zoneStatusColors";
import type { VisualComponent } from "@/components/items/visual-card/VisualCard";
import { formatDate } from "@/lib/format";

export function MaintenanceComponentsList({
  itemId,
  components,
  catalog,
  onSelect,
}: {
  itemId: string;
  components: VisualComponent[];
  catalog: ComponentTypeDefinition[];
  onSelect?: (componentId: string) => void;
}) {
  return (
    <div className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="text-[13px] font-semibold text-gray-800">Componentes de mantenimiento</h2>
        <MaintenanceComponentForm itemId={itemId} catalog={catalog} />
      </div>
      <div>
        {components.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect?.(c.id)}
            className="flex w-full items-center justify-between border-b border-gray-100 px-5 py-3 text-left last:border-b-0 hover:bg-gray-50"
          >
            <span className="text-[13px] text-gray-800">{c.label}</span>
            <span className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {c.lastEventDate
                  ? `${formatDate(c.lastEventDate)}${c.lastEventKm ? ` · ${c.lastEventKm.toLocaleString("es-ES")} km` : ""}`
                  : "Sin registros"}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                style={{ background: ZONE_STATUS_BADGE_BG[c.status], color: ZONE_STATUS_BADGE_TEXT[c.status] }}
              >
                {ZONE_STATUS_LABEL[c.status]}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
