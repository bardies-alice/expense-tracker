"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Trip } from "@prisma/client";
import { geoMercator } from "d3-geo";
import { ComposableMap, Geographies, Geography, type ProjectionFunction } from "react-simple-maps";
import { deleteTripAction } from "@/lib/actions/trips";
import { fetchSubdivisions, fetchWorldCountries, isDrillSupported, subdivisionCode, type GeoLayer } from "@/lib/geo";
import { formatDate } from "@/lib/format";

const VISITED_COLOR = "#6366f1";
const SUBDIVISION_VISITED_COLOR = "#4338ca";
const BASE_COLOR = "#e2e8f0";
const HOVER_COLOR = "#c7d2fe";
const MAP_WIDTH = 860;
const MAP_HEIGHT = 420;

function tripTitle(trip: Trip) {
  return trip.subdivisionName ? `${trip.subdivisionName}, ${trip.countryName}` : trip.countryName;
}

function tripDateRange(trip: Trip) {
  return trip.endDate ? `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}` : formatDate(trip.startDate);
}

export function TravelMap({ trips, categoryId }: { trips: Trip[]; categoryId: string }) {
  const router = useRouter();
  const [world, setWorld] = useState<GeoLayer | null>(null);
  const [drill, setDrill] = useState<{ code: string; name: string; layer: GeoLayer } | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

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

  async function handleCountryClick(code: string) {
    if (!visitedCountries.has(code)) return;
    setSelectedCode(code);
  }

  async function handleDrillIn(code: string, name: string) {
    const layer = await fetchSubdivisions(code);
    if (!layer) return;
    setDrill({ code, name, layer });
  }

  async function handleDelete(id: string) {
    await deleteTripAction(id, categoryId);
    router.refresh();
  }

  const activeSubdivisions = drill ? visitedSubdivisions.get(drill.code) : null;
  const selectedTrip = selectedCode ? trips.find((t) => t.countryCode === selectedCode) : null;

  const drillProjection = useMemo(() => {
    if (!drill) return undefined;
    const featureCollection = drill.layer.geography as unknown as GeoJSON.FeatureCollection;
    const projection = geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], featureCollection);
    // react-simple-maps treats a function `projection` prop as an already-built d3 projection
    // instance (it does not call it), despite its types describing a (w, h, config) => GeoProjection factory.
    return projection as unknown as ProjectionFunction;
  }, [drill]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">{drill ? drill.name : "Países visitados"}</h2>
        {drill ? (
          <button onClick={() => setDrill(null)} className="text-xs text-indigo-600 hover:text-indigo-800">
            ← Volver al mundo
          </button>
        ) : (
          <div className="flex items-center gap-3.5 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: VISITED_COLOR }} />
              Visitado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: BASE_COLOR }} />
              Sin visitar
            </span>
          </div>
        )}
      </div>

      {!world ? (
        <div className="flex h-72 items-center justify-center text-sm text-gray-400">Cargando mapa…</div>
      ) : (
        <ComposableMap
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          projection={drillProjection ?? "geoEqualEarth"}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={drill ? drill.layer.geography : world.geography}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const code = drill ? subdivisionCode(geo) : String(geo.id);
                const visited = drill ? activeSubdivisions?.has(code) : visitedCountries.has(code);
                const clickable = drill ? false : visited;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => !drill && handleCountryClick(code)}
                    style={{
                      default: {
                        fill: visited ? (drill ? SUBDIVISION_VISITED_COLOR : VISITED_COLOR) : BASE_COLOR,
                        stroke: "#ffffff",
                        strokeWidth: 0.6,
                        outline: "none",
                        cursor: clickable ? "pointer" : "default",
                      },
                      hover: {
                        fill: clickable ? HOVER_COLOR : visited ? (drill ? SUBDIVISION_VISITED_COLOR : VISITED_COLOR) : BASE_COLOR,
                        stroke: "#ffffff",
                        strokeWidth: 0.6,
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

      <div className="mt-2.5 min-h-[20px]">
        {selectedTrip ? (
          <p className="m-0 flex items-center gap-2 text-[13px] font-medium text-indigo-700">
            {tripTitle(selectedTrip)} · {formatDate(selectedTrip.startDate)}
            {!drill && isDrillSupported(selectedTrip.countryCode) && (
              <button
                onClick={() => handleDrillIn(selectedTrip.countryCode, selectedTrip.countryName)}
                className="text-xs font-normal text-indigo-500 underline hover:text-indigo-700"
              >
                Ver por región
              </button>
            )}
          </p>
        ) : (
          <p className="m-0 text-xs text-gray-400">Toca un país visitado para ver el detalle del viaje.</p>
        )}
      </div>

      {trips.length > 0 && (
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {trips.map((trip) => (
            <div key={trip.id} className="flex flex-col gap-1.5 rounded-[10px] border border-gray-200 p-3.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21c-4-4-7-8-7-11a7 7 0 1 1 14 0c0 3-3 7-7 11Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-semibold text-gray-900">{tripTitle(trip)}</span>
                </div>
                <button onClick={() => handleDelete(trip.id)} className="text-[13px] text-gray-300 hover:text-gray-500" aria-label="Eliminar viaje">
                  ✕
                </button>
              </div>
              <p className="m-0 text-xs text-gray-400">{tripDateRange(trip)}</p>
              {trip.notes && <p className="m-0 mt-0.5 text-xs text-gray-500">{trip.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
