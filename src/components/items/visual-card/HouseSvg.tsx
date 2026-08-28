"use client";

import type { ComponentStatus } from "@/types";
import { statusColor, statusGlow, isActive } from "./zoneStatusColors";
import { TelltaleGlyph } from "./telltale-icons";

export interface HouseSvgProps {
  zoneStatuses: Record<string, ComponentStatus>;
  onZoneClick?: (zoneKey: string) => void;
  hoveredZone?: string | null;
  onZoneHover?: (zoneKey: string | null) => void;
}

interface BadgeSpec {
  key: string;
  cx: number;
  cy: number;
  r: number;
  componentType: string;
  leader: [number, number, number, number];
}

const BADGES: BadgeSpec[] = [
  { key: "roof", cx: 320, cy: 66, r: 19, componentType: "ROOF", leader: [320, 85, 320, 148] },
  { key: "smoke-detector", cx: 460, cy: 92, r: 17, componentType: "SMOKE_DETECTOR", leader: [460, 109, 392, 178] },
  { key: "home-insurance", cx: 560, cy: 160, r: 18, componentType: "HOME_INSURANCE", leader: [560, 178, 420, 226] },
  { key: "alarm", cx: 500, cy: 300, r: 17, componentType: "ALARM", leader: [500, 300, 420, 300] },
  { key: "boiler", cx: 90, cy: 260, r: 18, componentType: "BOILER", leader: [90, 278, 220, 270] },
  { key: "water-heater", cx: 90, cy: 340, r: 17, componentType: "WATER_HEATER", leader: [90, 357, 220, 330] },
];

export function HouseSvg({ zoneStatuses, onZoneClick, hoveredZone, onZoneHover }: HouseSvgProps) {
  const zone = (key: string) => zoneStatuses[key] ?? ("unknown" as ComponentStatus);
  const dimOpacity = (key: string) => (hoveredZone && hoveredZone !== key ? 0.6 : 1);

  return (
    <svg viewBox="0 0 640 400" className="block h-auto w-full" role="img" aria-label="Estado de la casa">
      <ellipse cx="320" cy="378" rx="240" ry="12" fill="#e2e8f0" />
      <line x1="60" y1="378" x2="580" y2="378" stroke="#e2e8f0" strokeWidth="2" />

      {/* tejado */}
      <polygon points="220,148 320,68 420,148" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
      {/* chimenea */}
      <rect x="368" y="92" width="20" height="46" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />

      {/* fachada */}
      <rect x="220" y="148" width="200" height="212" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />

      {/* ventanas */}
      <rect x="248" y="188" width="42" height="42" fill="#bcd4e6" stroke="#64748b" strokeWidth="1.5" pointerEvents="none" />
      <line x1="269" y1="188" x2="269" y2="230" stroke="#64748b" strokeWidth="1.2" pointerEvents="none" />
      <line x1="248" y1="209" x2="290" y2="209" stroke="#64748b" strokeWidth="1.2" pointerEvents="none" />

      <rect x="350" y="188" width="42" height="42" fill="#bcd4e6" stroke="#64748b" strokeWidth="1.5" pointerEvents="none" />
      <line x1="371" y1="188" x2="371" y2="230" stroke="#64748b" strokeWidth="1.2" pointerEvents="none" />
      <line x1="350" y1="209" x2="392" y2="209" stroke="#64748b" strokeWidth="1.2" pointerEvents="none" />

      {/* puerta */}
      <rect x="300" y="270" width="40" height="90" fill="#8a9bb0" stroke="#475569" strokeWidth="1.5" pointerEvents="none" />
      <circle cx="332" cy="318" r="2.5" fill="#334155" pointerEvents="none" />

      {/* caseta utilidades (caldera / termo), en el lateral de la fachada */}
      <rect x="220" y="255" width="20" height="90" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" pointerEvents="none" />

      {BADGES.map((b) => {
        const status = zone(b.key);
        const active = isActive(status);
        return (
          <g key={b.key}>
            <line x1={b.leader[0]} y1={b.leader[1]} x2={b.leader[2]} y2={b.leader[3]} stroke="#c2cad4" strokeWidth="1.5" />
            <g
              onClick={() => onZoneClick?.(b.key)}
              onMouseEnter={() => onZoneHover?.(b.key)}
              onMouseLeave={() => onZoneHover?.(null)}
              style={{ cursor: onZoneClick ? "pointer" : "default" }}
            >
              <circle
                cx={b.cx}
                cy={b.cy}
                r={b.r}
                fill={statusColor(status)}
                stroke="#ffffff"
                strokeWidth="2.5"
                opacity={dimOpacity(b.key)}
                style={{ filter: `drop-shadow(0 0 ${active ? 5 : 0}px ${statusGlow(status)})`, transition: "filter 200ms ease, opacity 150ms ease" }}
              />
              <TelltaleGlyph
                componentType={b.componentType}
                transform={`translate(${b.cx},${b.cy}) scale(${b.r >= 19 ? 0.82 : 0.74}) translate(-12,-12)`}
                stroke="#1a202c"
                pointerEvents="none"
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
