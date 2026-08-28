import { formatEUR } from "@/lib/format";

export function SummaryCards({ income, expense }: { income: number; expense: number }) {
  const balance = income - expense;
  const cards = [
    { label: "Ingresos (mes)", value: income, className: "text-emerald-600" },
    { label: "Gastos (mes)", value: expense, className: "text-red-600" },
    { label: "Balance", value: balance, className: balance >= 0 ? "text-emerald-600" : "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">{c.label}</p>
          <p className={`mt-1 text-2xl font-semibold ${c.className}`}>{formatEUR(c.value)}</p>
        </div>
      ))}
    </div>
  );
}
