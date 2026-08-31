import type { ItemType, MaintenanceRuleType } from "@prisma/client";

export interface ComponentTypeDefinition {
  componentType: string;
  zoneKey: string;
  label: string;
  ruleType: MaintenanceRuleType;
  intervalKm?: number;
  intervalDays?: number;
  warningKm?: number;
  warningDays?: number;
}

export interface SvgZoneDefinition {
  zoneKey: string;
  label: string;
}

// Debe coincidir con las claves de BADGES/wheel() en CarSvg.tsx y HouseSvg.tsx.
// Un componente cuya zoneKey no esté en esta lista no tendrá marcador en el dibujo
// (solo aparecerá en la lista de componentes de abajo).
export const SVG_ZONES: Record<ItemType, SvgZoneDefinition[]> = {
  CAR: [
    { zoneKey: "engine", label: "Motor" },
    { zoneKey: "battery", label: "Batería" },
    { zoneKey: "itv-sticker", label: "Pegatina ITV (parabrisas)" },
    { zoneKey: "insurance-doc", label: "Seguro (parabrisas)" },
    { zoneKey: "tires-fr", label: "Rueda delantera" },
    { zoneKey: "tires-rl", label: "Rueda trasera" },
    { zoneKey: "brakes-front", label: "Frenos delanteros" },
    { zoneKey: "brakes-rear", label: "Frenos traseros" },
  ],
  HOUSE: [
    { zoneKey: "roof", label: "Tejado" },
    { zoneKey: "smoke-detector", label: "Detector de humo" },
    { zoneKey: "home-insurance", label: "Seguro hogar" },
    { zoneKey: "alarm", label: "Alarma" },
    { zoneKey: "boiler", label: "Caldera" },
    { zoneKey: "water-heater", label: "Termo de agua" },
  ],
  GENERIC: [],
};

export const COMPONENT_CATALOG: Record<ItemType, ComponentTypeDefinition[]> = {
  CAR: [
    { componentType: "OIL", zoneKey: "engine", label: "Aceite de motor", ruleType: "DISTANCE_OR_TIME", intervalKm: 10000, intervalDays: 365, warningKm: 1000, warningDays: 30 },
    { componentType: "TIRES", zoneKey: "tires", label: "Ruedas", ruleType: "DISTANCE", intervalKm: 40000, warningKm: 5000 },
    { componentType: "BRAKES", zoneKey: "brakes-front", label: "Frenos delanteros", ruleType: "DISTANCE", intervalKm: 30000, warningKm: 4000 },
    { componentType: "BATTERY", zoneKey: "battery", label: "Batería", ruleType: "TIME", intervalDays: 1460, warningDays: 90 },
    { componentType: "ITV", zoneKey: "itv-sticker", label: "ITV", ruleType: "TIME", intervalDays: 730, warningDays: 30 },
    { componentType: "INSURANCE", zoneKey: "insurance-doc", label: "Seguro", ruleType: "TIME", intervalDays: 365, warningDays: 15 },
  ],
  HOUSE: [
    { componentType: "BOILER", zoneKey: "boiler", label: "Caldera", ruleType: "TIME", intervalDays: 365, warningDays: 30 },
    { componentType: "ROOF", zoneKey: "roof", label: "Tejado", ruleType: "TIME", intervalDays: 3650, warningDays: 180 },
    { componentType: "ALARM", zoneKey: "alarm", label: "Alarma", ruleType: "TIME", intervalDays: 365, warningDays: 30 },
    { componentType: "HOME_INSURANCE", zoneKey: "home-insurance", label: "Seguro hogar", ruleType: "TIME", intervalDays: 365, warningDays: 15 },
    { componentType: "WATER_HEATER", zoneKey: "water-heater", label: "Termo agua", ruleType: "TIME", intervalDays: 1825, warningDays: 90 },
    { componentType: "SMOKE_DETECTOR", zoneKey: "smoke-detector", label: "Detector de humo", ruleType: "TIME", intervalDays: 365, warningDays: 30 },
  ],
  GENERIC: [],
};
