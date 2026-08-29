"use client";

import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatEUR } from "@/lib/format";

export interface MonthlySummaryPoint {
  month: string;
  income: number;
  expense: number;
}

export function IncomeVsExpenseChart({ data }: { data: MonthlySummaryPoint[] }) {
  const router = useRouter();

  if (data.length === 0) {
    return <p className="text-sm text-gray-400">Sin datos suficientes todavía.</p>;
  }

  function goToMonth(item: { payload?: MonthlySummaryPoint }) {
    if (item.payload?.month) router.push(`/?month=${item.payload.month}`);
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => formatEUR(Number(value))} />
        <Legend />
        <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} cursor="pointer" onClick={goToMonth} />
        <Bar dataKey="expense" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} cursor="pointer" onClick={goToMonth} />
      </BarChart>
    </ResponsiveContainer>
  );
}
