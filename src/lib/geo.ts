import { feature } from "topojson-client";

export interface GeoOption {
  code: string;
  name: string;
}

export interface GeoLayer {
  geography: Record<string, unknown>;
  options: GeoOption[];
}

interface SubdivisionConfig {
  url: string;
  kind: "topojson" | "geojson";
  object?: string;
}

export const SUPPORTED_SUBDIVISIONS: Record<string, SubdivisionConfig> = {
  "724": { url: "/geo/spain-comunidades.json", kind: "geojson" },
  "840": { url: "/geo/usa-states-10m.json", kind: "topojson", object: "states" },
};

export function isDrillSupported(countryCode: string) {
  return countryCode in SUPPORTED_SUBDIVISIONS;
}

export async function fetchWorldCountries(): Promise<GeoLayer> {
  const topo = await (await fetch("/geo/countries-110m.json")).json();
  const objectName = Object.keys(topo.objects)[0];
  const geo = feature(topo, topo.objects[objectName]) as unknown as {
    features: Array<{ id?: string; properties: { name: string } }>;
  };
  const options = geo.features
    .filter((f) => f.id != null)
    .map((f) => ({ code: String(f.id), name: f.properties.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { geography: geo as unknown as Record<string, unknown>, options };
}

export async function fetchSubdivisions(countryCode: string): Promise<GeoLayer | null> {
  const config = SUPPORTED_SUBDIVISIONS[countryCode];
  if (!config) return null;
  const data = await (await fetch(config.url)).json();

  if (config.kind === "topojson") {
    const geo = feature(data, data.objects[config.object!]) as unknown as {
      features: Array<{ id?: string; properties: { name: string } }>;
    };
    const options = geo.features
      .filter((f) => f.id != null)
      .map((f) => ({ code: String(f.id), name: f.properties.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return { geography: geo as unknown as Record<string, unknown>, options };
  }

  const features = data.features as Array<{ properties: { cod_ccaa: string; name: string } }>;
  const options = features
    .map((f) => ({ code: f.properties.cod_ccaa, name: f.properties.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { geography: data, options };
}

export function subdivisionCode(geo: { id?: string | number; properties?: Record<string, unknown> }): string {
  if (geo.id != null) return String(geo.id);
  return String(geo.properties?.cod_ccaa ?? "");
}
