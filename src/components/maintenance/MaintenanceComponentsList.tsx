"use client";

import { useState } from "react";
import type { ComponentTypeDefinition } from "@/lib/constants/componentTypes";
import { MaintenanceComponentForm } from "./MaintenanceComponentForm";
import { MaintenanceComponentEditForm } from "./MaintenanceComponentEditForm";
import { ZONE_STATUS_BADGE_BG, ZONE_STATUS_BADGE_TEXT, ZONE_STATUS_LABEL } from "@/components/items/visual-card/zoneStatusColors";
import type { VisualComponent } from "@/components/items/visual-card/VisualCard";
import { formatDate } from "@/lib/format";

function ruleSummary(c: VisualComponent) {
  const parts: string[] = [];
  if (c.intervalKm) parts.push(`cada ${c.intervalKm.toLocaleString("es-ES")} km`);
  if (c.intervalDays) parts.push(`cada ${c.intervalDays} días`);
  return parts.length ? parts.join(" · ") : "Sin límite configurado";
}

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = components.find((c) => c.id === editingId) ?? null;

  return (
    <div className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="text-[13px] font-semibold text-gray-800">Componentes de mantenimiento</h2>
        <MaintenanceComponentForm itemId={itemId} catalog={catalog} />
      </div>
      <div>
        {components.map((c) => (
          <div key={c.id} className="flex items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
            <button onClick={() => onSelect?.(c.id)} className="flex flex-1 items-center justify-between px-5 py-3 text-left">
              <span>
                <span className="block text-[13px] text-gray-800">{c.label}</span>
                <span className="block text-[11px] text-gray-400">{ruleSummary(c)}</span>
              </span>
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
            <button
              onClick={() => setEditingId(c.id)}
              aria-label={`Editar vida útil de ${c.label}`}
              className="px-3 py-3 text-gray-400 hover:text-indigo-600"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <MaintenanceComponentEditForm itemId={itemId} component={editing} onClose={() => setEditingId(null)} />
    </div>
  );
}
