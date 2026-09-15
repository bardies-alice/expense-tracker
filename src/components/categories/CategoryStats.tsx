import { formatEUR } from "@/lib/format";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-[18px] py-4">
      <p className="m-0 text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1.5 text-lg font-bold text-ink sm:text-[22px]">{value}</p>
    </div>
  );
}

export function CategoryStats({
  totalExpense,
  totalIncome,
  count,
}: {
  totalExpense: number;
  totalIncome: number;
  count: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <StatCard label="Total gastado" value={formatEUR(Math.abs(totalExpense))} />
      {totalIncome > 0 && <StatCard label="Total ingresado" value={formatEUR(totalIncome)} />}
      <StatCard label="Transacciones" value={String(count)} />
    </div>
  );
}
