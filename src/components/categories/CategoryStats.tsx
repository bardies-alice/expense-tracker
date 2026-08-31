import { formatEUR } from "@/lib/format";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-[18px] py-4">
      <p className="m-0 text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1.5 text-[22px] font-bold text-gray-900">{value}</p>
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
