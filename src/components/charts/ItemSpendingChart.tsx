"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatEUR } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";
import { chartColors, chartTickStyle } from "./chartTheme";

export interface ItemSpendingPoint {
  itemName: string;
  total: number;
}

export function ItemSpendingChart({ data }: { data: ItemSpendingPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400">Sin gastos asociados a items todavía.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 24, right: 56 }}>
        <CartesianGrid strokeDasharray="0" horizontal={false} stroke={chartColors.gridline} />
        <XAxis type="number" tick={chartTickStyle} axisLine={{ stroke: chartColors.axis }} tickLine={false} />
        <YAxis
          type="category"
          dataKey="itemName"
          tick={chartTickStyle}
          axisLine={{ stroke: chartColors.axis }}
          tickLine={false}
          width={100}
          tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 13)}…` : v)}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(27,175,122,0.06)" }} />
        <Bar dataKey="total" name="Gastado" fill={chartColors.expense} barSize={18} radius={[0, 4, 4, 0]}>
          <LabelList
            dataKey="total"
            position="right"
            formatter={(value) => formatEUR(Number(value))}
            style={{ fill: chartColors.primaryText, fontSize: 12, fontWeight: 500 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
