"use client";

import type { ComponentStatus } from "@/types";
import { statusColor, statusGlow, isActive } from "./zoneStatusColors";

export interface CarSvgProps {
  zoneStatuses: Record<string, ComponentStatus>;
  onZoneClick?: (zoneKey: string) => void;
  hoveredZone?: string | null;
  onZoneHover?: (zoneKey: string | null) => void;
}

function zoneStatus(zoneStatuses: Record<string, ComponentStatus>, ...keys: string[]) {
  for (const key of keys) {
    if (zoneStatuses[key]) return zoneStatuses[key];
  }
  return "unknown" as ComponentStatus;
}

export function CarSvg({ zoneStatuses, onZoneClick, hoveredZone, onZoneHover }: CarSvgProps) {
  const zone = (key: string, ...fallbacks: string[]) => zoneStatus(zoneStatuses, key, ...fallbacks);

  const zoneProps = (key: string, ...fallbacks: string[]) => {
    const status = zone(key, ...fallbacks);
    const active = isActive(status);
    return {
      "data-zone": key,
      onClick: () => onZoneClick?.(key),
      onMouseEnter: () => onZoneHover?.(key),
      onMouseLeave: () => onZoneHover?.(null),
      style: {
        cursor: onZoneClick ? "pointer" : "default",
        opacity: hoveredZone && hoveredZone !== key ? 0.6 : 1,
        filter: `drop-shadow(0 0 ${active ? 5 : 0}px ${statusGlow(status)})`,
        transition: "filter 200ms ease, opacity 150ms ease",
      },
      fill: statusColor(status),
      className: active ? "telltale-pulse" : undefined,
    };
  };

  const ringProps = (key: string, ...fallbacks: string[]) => {
    const props = zoneProps(key, ...fallbacks);
    return { ...props, fill: "none", stroke: props.fill };
  };

  return (
    <svg viewBox="0 0 400 190" className="w-full max-w-xl" role="img" aria-label="Estado del vehículo">
      <line x1="10" y1="164" x2="390" y2="164" stroke="#2c3037" strokeWidth="1" />

      {/* chassis */}
      <path
        d="M35,150 L35,118 Q40,96 68,90 L102,90 Q118,64 155,62 L248,62 Q276,64 292,90 L328,96 Q356,101 361,120 L361,150 Z"
        fill="#20242a"
        stroke="#3a4048"
        strokeWidth="1.5"
      />
      {/* windows */}
      <path d="M112,88 Q126,68 155,68 L198,68 L198,88 Z" fill="#2b3039" />
      <path d="M203,68 L246,68 Q267,68 282,88 L203,88 Z" fill="#2b3039" />
      {/* door seam */}
      <line x1="200" y1="90" x2="200" y2="148" stroke="#3a4048" strokeWidth="1" />

      {/* engine / oil zone (under the hood, front-left) */}
      <rect x="42" y="112" width="56" height="30" rx="4" {...zoneProps("engine")} stroke="#0d0f12" strokeWidth="1" />

      {/* battery */}
      <rect x="106" y="116" width="24" height="18" rx="2" {...zoneProps("battery")} stroke="#0d0f12" strokeWidth="1" />

      {/* itv sticker on windshield */}
      <rect x="176" y="72" width="14" height="9" rx="1" {...zoneProps("itv-sticker")} stroke="#0d0f12" strokeWidth="1" />

      {/* rear wheel + brake */}
      <circle cx="98" cy="150" r="22" fill="#14161a" stroke="#3a4048" strokeWidth="2" />
      <circle cx="98" cy="150" r="9" {...zoneProps("brakes-rear")} stroke="#0d0f12" strokeWidth="1" />

      {/* front wheel + brake */}
      <circle cx="298" cy="150" r="22" fill="#14161a" stroke="#3a4048" strokeWidth="2" />
      <circle cx="298" cy="150" r="9" {...zoneProps("brakes-front")} stroke="#0d0f12" strokeWidth="1" />

      {/* tires (rim highlight ring, driven by shared tires status) */}
      <circle cx="98" cy="150" r="21" {...ringProps("tires-rl", "tires")} strokeWidth="3" />
      <circle cx="298" cy="150" r="21" {...ringProps("tires-fr", "tires")} strokeWidth="3" />

      {/* insurance document, off to the side */}
      <rect x="366" y="52" width="22" height="28" rx="2" {...zoneProps("insurance-doc")} stroke="#0d0f12" strokeWidth="1" />
    </svg>
  );
}
