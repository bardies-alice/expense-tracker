"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Trip } from "@prisma/client";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { deleteTripAction } from "@/lib/actions/trips";
import { fetchSubdivisions, fetchWorldCountries, isDrillSupported, subdivisionCode, type GeoLayer } from "@/lib/geo";
import { formatDate } from "@/lib/format";
import { TripForm } from "./TripForm";

const VISITED_COLOR = "#4f46e5";
const SUBDIVISION_VISITED_COLOR = "#4338ca";
const BASE_COLOR = "#e2e8f0";
const HOVER_COLOR = "#c7d2fe";

export function TravelMap({ trips, categoryId }: { trips: Trip[]; categoryId: string }) {
  const router = useRouter();
  const [world, setWorld] = useState<GeoLayer | null>(null);
  const [drill, setDrill] = useState<{ code: string; name: string; layer: GeoLayer } | null>(null);

  useEffect(() => {
    fetchWorldCountries().then(setWorld);
  }, []);

  const visitedCountries = useMemo(() => new Set(trips.map((t) => t.countryCode)), [trips]);
  const visitedSubdivisions = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const t of trips) {
      if (!t.subdivisionCode) continue;
      if (!map.has(t.countryCode)) map.set(t.countryCode, new Set());
      map.get(t.countryCode)!.add(t.subdivisionCode);
    }
    return map;
  }, [trips]);

  async function handleCountryClick(code: string, name: string) {
    if (!isDrillSupported(code)) return;
    const layer = await fetchSubdivisions(code);
    if (!layer) return;
    setDrill({ code, name, layer });
  }

  function handleSaved() {
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteTripAction(id, categoryId);
    router.refresh();
  }

  const activeSubdivisions = drill ? visitedSubdivisions.get(drill.code) : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{drill ? drill.name : "Países visitados"}</h3>
          {drill && (
            <button onClick={() => setDrill(null)} className="text-xs text-indigo-600 hover:text-indigo-800">
              ← Volver al mundo
            </button>
          )}
        </div>
        <TripForm categoryId={categoryId} onSaved={handleSaved} />
      </div>

      {!world ? (
        <div className="flex h-72 items-center justify-center text-sm text-gray-400">Cargando mapa…</div>
      ) : (
        <ComposableMap projection="geoEqualEarth" style={{ width: "100%", height: "auto" }}>
          <Geographies geography={drill ? drill.layer.geography : world.geography}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const code = drill ? subdivisionCode(geo) : String(geo.id);
                const visited = drill ? activeSubdivisions?.has(code) : visitedCountries.has(code);
                const clickable = !drill && isDrillSupported(code);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => !drill && handleCountryClick(code, geo.properties?.name ?? code)}
                    style={{
                      default: {
                        fill: visited ? (drill ? SUBDIVISION_VISITED_COLOR : VISITED_COLOR) : BASE_COLOR,
                        stroke: "#ffffff",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: clickable ? "pointer" : "default",
                      },
                      hover: {
                        fill: clickable ? HOVER_COLOR : visited ? (drill ? SUBDIVISION_VISITED_COLOR : VISITED_COLOR) : BASE_COLOR,
                        stroke: "#ffffff",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: clickable ? "pointer" : "default",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      )}

      {trips.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {trips.map((t) => (
            <li key={t.id} className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
              <span>
                {t.subdivisionName ? `${t.subdivisionName}, ` : ""}
                {t.countryName} · {formatDate(t.startDate)}
              </span>
              <button onClick={() => handleDelete(t.id)} className="text-indigo-400 hover:text-indigo-600" aria-label="Eliminar viaje">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
