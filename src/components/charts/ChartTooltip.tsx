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
    <div className="max-w-[220px] rounded-md border border-black/10 bg-white px-3 py-2 shadow-md">
      {label && <p className="mb-1 break-words text-xs font-medium text-gray-900">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="shrink-0 tabular-nums font-medium text-gray-900">{formatEUR(Number(entry.value))}</span>
          {entry.name && <span className="min-w-0 truncate">{entry.name}</span>}
        </div>
      ))}
    </div>
  );
}
