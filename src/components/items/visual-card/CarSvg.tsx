"use client";

import type { ComponentStatus } from "@/types";
import { statusColor, statusGlow, isActive } from "./zoneStatusColors";
import { TelltaleGlyph } from "./telltale-icons";

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

interface BadgeSpec {
  key: string;
  cx: number;
  cy: number;
  r: number;
  componentType: string;
  leader: [number, number, number, number];
}

const BADGES: BadgeSpec[] = [
  { key: "itv-sticker", cx: 468, cy: 92, r: 18, componentType: "ITV", leader: [468, 110, 452, 158] },
  { key: "insurance-doc", cx: 188, cy: 88, r: 18, componentType: "INSURANCE", leader: [188, 106, 195, 162] },
  { key: "engine", cx: 615, cy: 168, r: 20, componentType: "OIL", leader: [615, 188, 588, 238] },
  { key: "battery", cx: 615, cy: 250, r: 18, componentType: "BATTERY", leader: [615, 266, 588, 292] },
];

export function CarSvg({ zoneStatuses, onZoneClick, hoveredZone, onZoneHover }: CarSvgProps) {
  const zone = (key: string, ...fallbacks: string[]) => zoneStatus(zoneStatuses, key, ...fallbacks);

  const dimOpacity = (key: string) => (hoveredZone && hoveredZone !== key ? 0.6 : 1);

  const wheel = (cx: number, ringKey: string, brakeKey: string) => {
    const ringStatus = zone(ringKey, "tires");
    const brakeStatus = zone(brakeKey);
    const ringActive = isActive(ringStatus);
    const brakeActive = isActive(brakeStatus);
    return (
      <g key={cx}>
        <circle cx={cx} cy="372" r="48" fill="#1a202c" />
        <circle
          cx={cx}
          cy="372"
          r="48"
          fill="none"
          stroke={statusColor(ringStatus)}
          strokeWidth="6"
          opacity={dimOpacity(ringKey)}
          style={{ filter: `drop-shadow(0 0 ${ringActive ? 5 : 0}px ${statusGlow(ringStatus)})`, cursor: onZoneClick ? "pointer" : "default", transition: "filter 200ms ease" }}
          onClick={() => onZoneClick?.(ringKey)}
          onMouseEnter={() => onZoneHover?.(ringKey)}
          onMouseLeave={() => onZoneHover?.(null)}
        />
        <circle cx={cx} cy="372" r="29" fill="#3b4250" />
        <circle
          cx={cx}
          cy="372"
          r="13"
          fill={statusColor(brakeStatus)}
          stroke="#0d0f12"
          strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 0 ${brakeActive ? 5 : 0}px ${statusGlow(brakeStatus)})`, cursor: onZoneClick ? "pointer" : "default", transition: "filter 200ms ease", opacity: dimOpacity(brakeKey) }}
          onClick={() => onZoneClick?.(brakeKey)}
          onMouseEnter={() => onZoneHover?.(brakeKey)}
          onMouseLeave={() => onZoneHover?.(null)}
        />
      </g>
    );
  };

  return (
    <svg viewBox="0 0 640 400" className="block h-auto w-full" role="img" aria-label="Estado del vehículo">
      <ellipse cx="320" cy="378" rx="290" ry="12" fill="#e2e8f0" />
      <line x1="20" y1="378" x2="620" y2="378" stroke="#e2e8f0" strokeWidth="2" />

      {/* silueta: capó y voladizos cortos, cabina alta */}
      <path
        d="M70,372 L70,320 Q70,290 100,280 L140,266 Q165,198 226,174 L360,160 Q412,160 442,196 L480,240 Q490,256 502,270 L562,286 Q587,291 587,320 L587,372 Z"
        fill="#dbe2ea"
        stroke="#a7b2c0"
        strokeWidth="2"
      />

      {/* ventanas */}
      <path d="M153,254 L180,188 L284,177 L282,254 Z" fill="#aebccf" opacity="0.85" pointerEvents="none" />
      <path d="M294,177 L418,182 L456,232 L294,254 Z" fill="#aebccf" opacity="0.85" pointerEvents="none" />
      <line x1="288" y1="177" x2="288" y2="254" stroke="#a7b2c0" strokeWidth="2" pointerEvents="none" />

      {/* tirador puerta */}
      <rect x="330" y="240" width="26" height="5" rx="2.5" fill="#a7b2c0" pointerEvents="none" />

      {wheel(150, "tires-rl", "brakes-rear")}
      {wheel(480, "tires-fr", "brakes-front")}

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
                transform={`translate(${b.cx},${b.cy}) scale(${b.r >= 20 ? 0.78 : 0.7}) translate(-12,-12)`}
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
