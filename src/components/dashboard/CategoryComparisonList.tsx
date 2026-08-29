import { formatEUR } from "@/lib/format";

export interface CategoryComparisonRow {
  categoryId: string;
  name: string;
  color: string;
  thisMonth: number;
  lastMonth: number;
  delta: number;
}

export function CategoryComparisonList({ rows }: { rows: CategoryComparisonRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-400">Sin gastos todavía este mes o el anterior.</p>;
  }

  const max = Math.max(...rows.map((r) => r.thisMonth), 1);

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.categoryId} className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
          <span className="w-24 shrink-0 truncate text-sm text-gray-700">{r.name}</span>
          <div className="h-2 flex-1 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full"
              style={{ width: `${(r.thisMonth / max) * 100}%`, background: r.color }}
            />
          </div>
          <span className="w-20 shrink-0 text-right text-sm font-medium text-gray-900">{formatEUR(r.thisMonth)}</span>
          <span
            className={`w-28 shrink-0 text-right text-xs font-medium ${
              r.delta > 0 ? "text-red-600" : r.delta < 0 ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            {r.delta === 0 ? "sin cambio" : `${r.delta > 0 ? "+" : ""}${formatEUR(r.delta)} vs mes ant.`}
          </span>
        </div>
      ))}
    </div>
  );
}
