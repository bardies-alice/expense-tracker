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
  { key: "itv-sticker", cx: 360, cy: 56, r: 18, componentType: "ITV", leader: [360, 70, 345, 120] },
  { key: "insurance-doc", cx: 170, cy: 50, r: 18, componentType: "INSURANCE", leader: [170, 65, 170, 105] },
  { key: "engine", cx: 560, cy: 100, r: 20, componentType: "OIL", leader: [560, 120, 530, 190] },
  { key: "battery", cx: 620, cy: 134, r: 18, componentType: "BATTERY", leader: [620, 150, 595, 210] },
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
        <circle cx={cx} cy="384" r="46" fill="#1a202c" />
        <circle
          cx={cx}
          cy="384"
          r="46"
          fill="none"
          stroke={statusColor(ringStatus)}
          strokeWidth="6"
          opacity={dimOpacity(ringKey)}
          style={{ filter: `drop-shadow(0 0 ${ringActive ? 5 : 0}px ${statusGlow(ringStatus)})`, cursor: onZoneClick ? "pointer" : "default", transition: "filter 200ms ease" }}
          onClick={() => onZoneClick?.(ringKey)}
          onMouseEnter={() => onZoneHover?.(ringKey)}
          onMouseLeave={() => onZoneHover?.(null)}
        />
        <circle cx={cx} cy="384" r="28" fill="#3b4250" />
        <circle
          cx={cx}
          cy="384"
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
    <svg viewBox="0 0 640 500" preserveAspectRatio="none" className="block h-full w-full" role="img" aria-label="Estado del vehículo">
      <ellipse cx="320" cy="478" rx="270" ry="14" fill="#e2e8f0" />
      <line x1="30" y1="478" x2="610" y2="478" stroke="#e2e8f0" strokeWidth="2" />

      <path
        d="M640 320V368C640 385.7 625.7 400 608 400H574.7C567.1 445.4 527.6 480 480 480C432.4 480 392.9 445.4 385.3 400H254.7C247.1 445.4 207.6 480 160 480C112.4 480 72.94 445.4 65.33 400H32C14.33 400 0 385.7 0 368V256C0 228.9 16.81 205.8 40.56 196.4L82.2 92.35C96.78 55.9 132.1 32 171.3 32H353.2C382.4 32 409.1 45.26 428.2 68.03L528.2 193C591.2 200.1 640 254.8 640 319.1V320zM171.3 96C158.2 96 146.5 103.1 141.6 116.1L111.3 192H224V96H171.3zM272 192H445.4L378.2 108C372.2 100.4 362.1 96 353.2 96H272V192zM525.3 400C527 394.1 528 389.6 528 384C528 357.5 506.5 336 480 336C453.5 336 432 357.5 432 384C432 389.6 432.1 394.1 434.7 400C441.3 418.6 459.1 432 480 432C500.9 432 518.7 418.6 525.3 400zM205.3 400C207 394.1 208 389.6 208 384C208 357.5 186.5 336 160 336C133.5 336 112 357.5 112 384C112 389.6 112.1 394.1 114.7 400C121.3 418.6 139.1 432 160 432C180.9 432 198.7 418.6 205.3 400z"
        fill="#dbe2ea"
        stroke="#a7b2c0"
        strokeWidth="2"
      />
      <path d="M171.3 96C158.2 96 146.5 103.1 141.6 116.1L111.3 192H224V96H171.3Z" fill="#aebccf" opacity="0.75" pointerEvents="none" />
      <path d="M272 192H445.4L378.2 108C372.2 100.4 362.1 96 353.2 96H272V192Z" fill="#aebccf" opacity="0.75" pointerEvents="none" />

      {wheel(160, "tires-rl", "brakes-rear")}
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
