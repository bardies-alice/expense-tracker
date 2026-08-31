"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatEUR } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";

export interface CategoryBreakdownSlice {
  name: string;
  color: string;
  total: number;
}

export function CategoryPieChart({ data }: { data: CategoryBreakdownSlice[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400">Sin gastos suficientes todavía.</p>;
  }

  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto]">
      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              cornerRadius={4}
              label={({ percent }) => ((percent ?? 0) >= 0.08 ? `${((percent ?? 0) * 100).toFixed(0)}%` : "")}
              labelLine={false}
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} stroke="#fcfcfb" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-400">Total</span>
          <span className="tabular-nums text-lg font-semibold text-gray-900">{formatEUR(total)}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {data.map((slice) => (
          <li key={slice.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
            <span className="text-gray-600">{slice.name}</span>
            <span className="ml-auto tabular-nums font-medium text-gray-900">{formatEUR(slice.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
