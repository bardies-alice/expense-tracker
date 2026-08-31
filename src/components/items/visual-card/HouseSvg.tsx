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
  { key: "roof", cx: 340, cy: 96, r: 19, componentType: "ROOF", leader: [340, 115, 340, 150] },
  { key: "smoke-detector", cx: 258, cy: 52, r: 17, componentType: "SMOKE_DETECTOR", leader: [258, 69, 275, 122] },
  { key: "home-insurance", cx: 452, cy: 195, r: 18, componentType: "HOME_INSURANCE", leader: [452, 213, 398, 250] },
  { key: "alarm", cx: 412, cy: 300, r: 17, componentType: "ALARM", leader: [412, 300, 380, 300] },
  { key: "boiler", cx: 176, cy: 262, r: 18, componentType: "BOILER", leader: [176, 280, 245, 280] },
  { key: "water-heater", cx: 176, cy: 335, r: 17, componentType: "WATER_HEATER", leader: [176, 352, 245, 322] },
];

export function HouseSvg({ zoneStatuses, onZoneClick, hoveredZone, onZoneHover }: HouseSvgProps) {
  const zone = (key: string) => zoneStatuses[key] ?? ("unknown" as ComponentStatus);
  const dimOpacity = (key: string) => (hoveredZone && hoveredZone !== key ? 0.6 : 1);

  return (
    <svg viewBox="0 0 640 400" className="block h-auto w-full" role="img" aria-label="Estado de la casa">
      <ellipse cx="320" cy="378" rx="240" ry="12" fill="#e2e8f0" />
      <line x1="60" y1="378" x2="580" y2="378" stroke="#e2e8f0" strokeWidth="2" />

      <g transform="translate(183.6,87.2) scale(0.55)" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="3.5" strokeLinejoin="round">
        <path d="M496,272v-24L462.416,96H160V48h16V0H64v48h16v48H33.584L0.192,246.264L0,272h32v176H16v48h464v-48h-16V272H496z M80,16
          h80v16H80V16z M144,48v48H96V48H144z M144,480H32v-16h112V480z M48,448V272h113.528c-0.96,5.2-1.528,10.528-1.528,16v160H48z
          M336,480H160v-16h176V480z M192,328v120h-16V288c0-39.704,32.304-72,72-72s72,32.296,72,72v160h-16V328H192z M288,344v104h-80
          V344H288z M334.472,272H448v176H336V288C336,282.528,335.432,277.2,334.472,272z M464,480H352v-16h112V480z M329.888,256
          c-12.84-32.728-44.664-56-81.888-56s-69.048,23.272-81.888,56H16v-7.128L46.416,112h403.168L480,248.872V256H329.888z" />
        <path
          fill="#bcd4e6"
          stroke="#64748b"
          strokeWidth="2"
          d="M64,392h80v-96H64V392z M112,312h16v24h-16V312z M112,352h16v24h-16V352z M80,312h16v24H80V312z M80,352h16v24H80V352z"
        />
        <path
          fill="#bcd4e6"
          stroke="#64748b"
          strokeWidth="2"
          d="M432,296h-80v96h80V296z M384,376h-16v-24h16V376z M384,336h-16v-24h16V336z M416,376h-16v-24h16V376z M416,336h-16v-24
          h16V336z"
        />
      </g>

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
