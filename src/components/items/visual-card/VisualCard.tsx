"use client";

import { useState } from "react";
import clsx from "clsx";
import type { ComponentStatus } from "@/types";
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

  return (
    <div
      className={clsx(
        chakraPetch.variable,
        "overflow-hidden rounded-xl border",
        isCar ? "border-[#0d0f12] bg-[#16181c]" : "border-gray-200 bg-white"
      )}
      style={isCar ? { fontFamily: "var(--font-chakra)" } : undefined}
    >
      {isCar && (
        <div className="flex items-center justify-between border-b border-[#2c3037] bg-[#1c1f24] px-5 py-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#7d8590]">Cuadro de mando</span>
          <div className="flex items-baseline gap-1.5 rounded-md bg-[#0d0f12] px-3 py-1">
            <span className="text-lg font-semibold tabular-nums text-[#e8eaed]">
              {currentKm != null ? currentKm.toLocaleString("es-ES") : "—"}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-[#7d8590]">km</span>
          </div>
        </div>
      )}

      <div className={clsx("flex items-center justify-center p-6", isCar && "bg-[#16181c]")}>
        {itemType === "CAR" && (
          <CarSvg zoneStatuses={zoneStatuses} hoveredZone={hoveredZone} onZoneHover={setHoveredZone} onZoneClick={handleZoneClick} />
        )}
        {itemType === "HOUSE" && (
          <HouseSvg zoneStatuses={zoneStatuses} hoveredZone={hoveredZone} onZoneHover={setHoveredZone} onZoneClick={handleZoneClick} />
        )}
        {itemType === "GENERIC" && <p className="text-sm text-gray-400">Sin representación visual para este tipo de item.</p>}
      </div>

      {isCar ? (
        <div className="border-t border-[#2c3037] bg-[#1c1f24] px-5 py-4">
          <div className="min-h-[1.25rem]">
            <ZoneTooltip info={hoveredInfo ? toTooltipInfo(hoveredInfo) : null} dark />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-[#2c3037] sm:grid-cols-6">
            {components.map((c) => {
              const active = isActive(c.status);
              const color = statusColor(c.status);
              return (
                <button
                  key={c.id}
                  onClick={() => onZoneClick?.(c.id)}
                  onMouseEnter={() => setHoveredZone(c.zoneKey)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className="flex flex-col items-center gap-1.5 bg-[#16181c] px-2 py-3 transition-colors hover:bg-[#1c1f24]"
                >
                  <TelltaleIcon
                    componentType={c.componentType}
                    className={active ? "telltale-pulse" : undefined}
                    style={{ width: 22, height: 22, color, filter: active ? `drop-shadow(0 0 4px ${statusGlow(c.status)})` : undefined }}
                  />
                  <span className="text-center text-[9px] uppercase leading-tight tracking-wide text-[#7d8590]">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 border-t border-gray-200">
          {components.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-2 text-sm">
              <button onClick={() => onZoneClick?.(c.id)} className="text-left font-medium text-gray-800 hover:text-indigo-600">
                {c.label}
              </button>
              <span className="text-xs" style={{ color: statusColor(c.status) }}>
                {c.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function toTooltipInfo(c: VisualComponent) {
  return { label: c.label, status: c.status, lastEventDate: c.lastEventDate, lastEventKm: c.lastEventKm };
}
