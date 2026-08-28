import type { Trip } from "@prisma/client";
import { formatEUR } from "@/lib/format";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-[18px] py-4">
      <p className="m-0 text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1.5 text-[22px] font-bold text-gray-900">{value}</p>
    </div>
  );
}

export function TripStats({ trips, totalExpense }: { trips: Trip[]; totalExpense: number }) {
  const visitedCount = new Set(trips.map((t) => t.countryCode)).size;
  const lastTrip = trips.length > 0 ? trips.reduce((a, b) => (a.startDate > b.startDate ? a : b)) : null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="Países visitados" value={String(visitedCount)} />
      <StatCard label="Viajes registrados" value={String(trips.length)} />
      <StatCard label="Gasto en viajes" value={formatEUR(Math.abs(totalExpense))} />
      <StatCard label="Último viaje" value={lastTrip?.countryName ?? "—"} />
    </div>
  );
}
