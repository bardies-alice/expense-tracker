import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

// Iconos tipo testigo de salpicadero: trazo simple, pensados para leerse pequeños e iluminarse en color.
export function OilCanIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12c0-3 1.5-6 4-8l2 2-2 2 4 4-2 6H6l-2-6Z" />
      <path d="M14 8h4l2-3" />
    </svg>
  );
}

export function TireIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" />
    </svg>
  );
}

export function BrakeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 4.5v3M19.5 12h-3M12 19.5v-3M4.5 12h3" strokeWidth="2.4" />
    </svg>
  );
}

export function BatteryIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="8" width="16" height="9" rx="1.5" />
      <path d="M19 11h2v3h-2" />
      <path d="M8 12h2M9 10.5v3" />
    </svg>
  );
}

export function ItvIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M8.5 11.5l2.2 2.2L16 9" />
    </svg>
  );
}

export function InsuranceIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    </svg>
  );
}

const ICONS: Record<string, (props: IconProps) => React.ReactElement> = {
  OIL: OilCanIcon,
  TIRES: TireIcon,
  BRAKES: BrakeIcon,
  BATTERY: BatteryIcon,
  ITV: ItvIcon,
  INSURANCE: InsuranceIcon,
  BOILER: OilCanIcon,
  ROOF: ItvIcon,
};

export function TelltaleIcon({ componentType, ...props }: { componentType: string } & IconProps) {
  const Icon = ICONS[componentType] ?? TireIcon;
  return <Icon {...props} />;
}
