import { formatEUR } from "@/lib/format";

export function ChartTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{ value?: number | string; name?: string; color?: string }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-black/10 bg-white px-3 py-2 shadow-md">
      {label && <p className="mb-1 text-xs font-medium text-gray-900">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="tabular-nums font-medium text-gray-900">{formatEUR(Number(entry.value))}</span>
          {entry.name && <span>{entry.name}</span>}
        </div>
      ))}
    </div>
  );
}
