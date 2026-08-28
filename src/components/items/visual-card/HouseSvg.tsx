"use client";

import type { ComponentStatus } from "@/types";
import { statusColor } from "./zoneStatusColors";

export interface HouseSvgProps {
  zoneStatuses: Record<string, ComponentStatus>;
  onZoneClick?: (zoneKey: string) => void;
  hoveredZone?: string | null;
  onZoneHover?: (zoneKey: string | null) => void;
}

export function HouseSvg({ zoneStatuses, onZoneClick, hoveredZone, onZoneHover }: HouseSvgProps) {
  const zoneProps = (key: string) => ({
    "data-zone": key,
    onClick: () => onZoneClick?.(key),
    onMouseEnter: () => onZoneHover?.(key),
    onMouseLeave: () => onZoneHover?.(null),
    style: { cursor: onZoneClick ? "pointer" : "default", opacity: hoveredZone && hoveredZone !== key ? 0.75 : 1 },
    fill: statusColor(zoneStatuses[key] ?? "unknown"),
  });

  return (
    <svg viewBox="0 0 400 200" className="w-full max-w-xl" role="img" aria-label="Estado de la casa">
      {/* roof */}
      <polygon points="200,40 330,120 70,120" {...zoneProps("roof")} stroke="#374151" strokeWidth="1.5" />
      {/* walls */}
      <rect x="90" y="120" width="220" height="70" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.5" />
      {/* door */}
      <rect x="185" y="150" width="30" height="40" fill="#cbd5e1" />
      {/* boiler */}
      <rect x="260" y="135" width="30" height="40" rx="2" {...zoneProps("boiler")} stroke="#374151" strokeWidth="1" />
      <text x="275" y="184" fontSize="8" textAnchor="middle" fill="#1f2937" pointerEvents="none">
        Caldera
      </text>
    </svg>
  );
}
