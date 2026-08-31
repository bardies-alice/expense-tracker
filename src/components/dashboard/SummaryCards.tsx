import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { formatEUR } from "@/lib/format";

export function SummaryCards({ income, expense }: { income: number; expense: number }) {
  const balance = income - expense;
  const cards = [
    { label: "Ingresos (mes)", value: income, className: "text-emerald-700", icon: ArrowDownLeft, iconClass: "text-emerald-600" },
    { label: "Gastos (mes)", value: expense, className: "text-red-700", icon: ArrowUpRight, iconClass: "text-red-600" },
    {
      label: "Ahorro neto",
      value: balance,
      className: balance >= 0 ? "text-gray-900" : "text-red-700",
      icon: Wallet,
      iconClass: "text-indigo-600",
    },
  ];

  return (
    <>
      {cards.map((c) => (
        <div key={c.label} className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <c.icon size={14} className={c.iconClass} />
            {c.label}
          </span>
          <p className={`text-xl font-bold ${c.className}`}>{formatEUR(c.value)}</p>
        </div>
      ))}
    </>
  );
}
