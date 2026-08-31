"use client";

import { useRouter } from "next/navigation";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatEUR, formatMonthShort } from "@/lib/format";

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
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barGap={3} margin={{ top: 8 }}>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#a0aec0", fontWeight: 500 }}
          tickFormatter={formatMonthShort}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip formatter={(value) => formatEUR(Number(value))} labelFormatter={formatMonthShort} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
        <Legend
          iconType="square"
          iconSize={8}
          wrapperStyle={{ fontSize: 11.5, color: "#718096" }}
        />
        <Bar dataKey="income" name="Ingresos" fill="#34d399" radius={[4, 4, 0, 0]} cursor="pointer" onClick={goToMonth} />
        <Bar dataKey="expense" name="Gastos" fill="#f87171" radius={[4, 4, 0, 0]} cursor="pointer" onClick={goToMonth} />
      </BarChart>
    </ResponsiveContainer>
  );
}
