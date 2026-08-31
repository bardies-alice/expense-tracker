"use client";

import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatEUR, formatMonthShort } from "@/lib/format";
import { chartColors } from "@/components/charts/chartTheme";
import type { MonthlySummaryPoint } from "./IncomeVsExpenseChart";

export function SavingsChart({ data }: { data: MonthlySummaryPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400">Sin datos suficientes todavía.</p>;
  }

  const points = data.map((d) => ({ month: d.month, savings: Math.round((d.income - d.expense) * 100) / 100 }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={points} margin={{ top: 20, bottom: 20 }}>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#a0aec0", fontWeight: 500 }}
          tickFormatter={formatMonthShort}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <ReferenceLine y={0} stroke="#e2e8f0" />
        <Tooltip formatter={(value) => formatEUR(Number(value))} labelFormatter={formatMonthShort} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
        <Bar dataKey="savings" name="Ahorro" radius={[4, 4, 4, 4]}>
          <LabelList
            dataKey="savings"
            content={({ x, y, width, height, index }) => {
              // Recharts gives a negative `height` for below-zero bars, with `y` already at
              // the bar's far (bottom) edge — y + height is the near (top/zero-line) edge.
              const value = points[Number(index)]?.savings ?? 0;
              const negative = value < 0;
              const cx = Number(x) + Number(width) / 2;
              const cy = negative ? Number(y) + Number(height) - 6 : Number(y) - 6;
              return (
                <text x={cx} y={cy} textAnchor="middle" fontSize={11} fill="#718096">
                  {formatEUR(value)}
                </text>
              );
            }}
          />
          {points.map((p) => (
            <Cell key={p.month} fill={p.savings >= 0 ? chartColors.income : chartColors.expense} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
