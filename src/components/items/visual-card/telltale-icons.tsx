import type { JSX, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
type GlyphProps = SVGProps<SVGGElement>;

// Trazos compartidos: se usan tanto sueltos (badges flotantes del SVG del coche)
// como envueltos en <svg> (grid de testigos), para no duplicar el path a mano.
const GLYPHS: Record<string, JSX.Element> = {
  OIL: (
    <>
      <path d="M4 12c0-3 1.5-6 4-8l2 2-2 2 4 4-2 6H6l-2-6Z" />
      <path d="M14 8h4l2-3" />
    </>
  ),
  TIRES: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" />
    </>
  ),
  BRAKES: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 4.5v3M19.5 12h-3M12 19.5v-3M4.5 12h3" strokeWidth="2.4" />
    </>
  ),
  BATTERY: (
    <>
      <rect x="3" y="8" width="16" height="9" rx="1.5" />
      <path d="M19 11h2v3h-2" />
      <path d="M8 12h2M9 10.5v3" />
    </>
  ),
  ITV: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M8.5 11.5l2.2 2.2L16 9" />
    </>
  ),
  INSURANCE: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />,
  BOILER: <path d="M12 3c1 3-3 4-3 7a3 3 0 0 0 6 0c0-1-1-2-1-3 2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 3-5 5-9Z" />,
  ROOF: (
    <>
      <path d="M4 12 12 5l8 7" />
      <path d="M6 11v8h12v-8" />
    </>
  ),
  ALARM: (
    <>
      <path d="M12 3a5 5 0 0 0-5 5v3l-2 4h14l-2-4V8a5 5 0 0 0-5-5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  HOME_INSURANCE: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />,
  WATER_HEATER: <path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z" />,
  SMOKE_DETECTOR: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </>
  ),
};

/** Trazos sueltos, para incrustar dentro de un <g transform=...> con su propio stroke/color. */
export function TelltaleGlyph({ componentType, ...props }: { componentType: string } & GlyphProps) {
  const glyph = GLYPHS[componentType] ?? GLYPHS.TIRES;
  return (
    <g fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {glyph}
    </g>
  );
}

/** Icono completo con su propio <svg>, para el grid de testigos. */
export function TelltaleIcon({ componentType, ...props }: { componentType: string } & IconProps) {
  const glyph = GLYPHS[componentType] ?? GLYPHS.TIRES;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {glyph}
    </svg>
  );
}
