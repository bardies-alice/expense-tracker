"use client";

import { useState } from "react";
import clsx from "clsx";
import type { ComponentStatus } from "@/types";
import type { MaintenanceRuleType } from "@prisma/client";
import { chakraPetch } from "@/lib/fonts";
import { CarSvg } from "./CarSvg";
import { HouseSvg } from "./HouseSvg";
import { ZoneTooltip } from "./ZoneTooltip";
import { TelltaleIcon } from "./telltale-icons";
import { statusColor, statusGlow, isActive } from "./zoneStatusColors";

export interface VisualComponent {
  id: string;
  componentType: string;
  zoneKey: string;
  label: string;
  status: ComponentStatus;
  lastEventDate: Date | null;
  lastEventKm: number | null;
  ruleType: MaintenanceRuleType;
  intervalKm: number | null;
  intervalDays: number | null;
  warningKm: number | null;
  warningDays: number | null;
}

export function VisualCard({
  itemType,
  components,
  currentKm,
  onZoneClick,
}: {
  itemType: "CAR" | "HOUSE" | "GENERIC";
  components: VisualComponent[];
  currentKm?: number | null;
  onZoneClick?: (componentId: string) => void;
}) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const zoneStatuses: Record<string, ComponentStatus> = {};
  const byZone = new Map<string, VisualComponent>();
  for (const c of components) {
    zoneStatuses[c.zoneKey] = c.status;
    byZone.set(c.zoneKey, c);
  }

  const hoveredInfo = hoveredZone ? byZone.get(hoveredZone) : undefined;

  function handleZoneClick(zoneKey: string) {
    const component = byZone.get(zoneKey);
    if (component) onZoneClick?.(component.id);
  }

  const isCar = itemType === "CAR";
  const hasZones = itemType === "CAR" || itemType === "HOUSE";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
          {isCar ? "Cuadro de mando" : "Estado"}
        </span>
        {isCar && (
          <div className={clsx(chakraPetch.variable, "flex items-baseline gap-1.5 rounded-md bg-gray-900 px-3 py-1.5")}>
            <span className="text-[19px] font-semibold text-gray-50" style={{ fontFamily: "var(--font-chakra)" }}>
              {currentKm != null ? currentKm.toLocaleString("es-ES") : "—"}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-gray-400">km</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center bg-white px-5 pb-2.5 pt-7">
        {itemType === "CAR" && (
          <CarSvg zoneStatuses={zoneStatuses} hoveredZone={hoveredZone} onZoneHover={setHoveredZone} onZoneClick={handleZoneClick} />
        )}
        {itemType === "HOUSE" && (
          <HouseSvg zoneStatuses={zoneStatuses} hoveredZone={hoveredZone} onZoneHover={setHoveredZone} onZoneClick={handleZoneClick} />
        )}
        {itemType === "GENERIC" && <p className="text-sm text-gray-400">Sin representación visual para este tipo de item.</p>}
      </div>

      {hasZones && (
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
          <div className="min-h-[20px]">
            <ZoneTooltip info={hoveredInfo ? toTooltipInfo(hoveredInfo) : null} />
          </div>

          <div className="mt-3.5 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-gray-200 sm:grid-cols-6">
            {components.map((c) => {
              const active = isActive(c.status);
              const color = statusColor(c.status);
              return (
                <button
                  key={c.id}
                  onClick={() => onZoneClick?.(c.id)}
                  onMouseEnter={() => setHoveredZone(c.zoneKey)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className="flex flex-col items-center gap-1.5 bg-white px-1.5 py-3 transition-colors hover:bg-gray-50"
                >
                  <TelltaleIcon
                    componentType={c.componentType}
                    style={{ width: 22, height: 22, color, filter: active ? `drop-shadow(0 0 4px ${statusGlow(c.status)})` : undefined }}
                  />
                  <span className="text-center text-[9px] uppercase leading-tight tracking-wide text-gray-500">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function toTooltipInfo(c: VisualComponent) {
  return { label: c.label, status: c.status, lastEventDate: c.lastEventDate, lastEventKm: c.lastEventKm };
}
