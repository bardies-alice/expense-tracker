export type ComponentStatus = "ok" | "warning" | "overdue" | "unknown";

export interface CarMetadata {
  brand?: string;
  model?: string;
  year?: number;
  plate?: string;
  currentKm: number;
}

export interface HouseMetadata {
  address?: string;
  builtYear?: number;
}

export type ItemMetadata = CarMetadata | HouseMetadata | Record<string, never>;
