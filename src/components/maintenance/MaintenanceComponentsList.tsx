"use client";

import { useState } from "react";
import type { ItemType } from "@prisma/client";
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
  itemType,
  components,
  catalog,
  onSelect,
}: {
  itemId: string;
  itemType: ItemType;
  components: VisualComponent[];
  catalog: ComponentTypeDefinition[];
  onSelect?: (componentId: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = components.find((c) => c.id === editingId) ?? null;

  return (
    <div className="mt-5 rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[13px] font-semibold text-ink">Componentes de mantenimiento</h2>
        <MaintenanceComponentForm itemId={itemId} itemType={itemType} catalog={catalog} />
      </div>
      <div>
        {components.map((c) => (
          <div key={c.id} className="flex items-center border-b border-border last:border-b-0 hover:bg-surface">
            <button onClick={() => onSelect?.(c.id)} className="flex flex-1 flex-wrap items-center justify-between gap-2 px-5 py-3 text-left">
              <span className="min-w-0">
                <span className="block truncate text-[13px] text-ink">{c.label}</span>
                <span className="block text-[11px] text-muted">{ruleSummary(c)}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="hidden text-xs text-muted sm:inline">
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
              className="flex h-11 w-11 shrink-0 items-center justify-center text-muted hover:text-accent"
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
