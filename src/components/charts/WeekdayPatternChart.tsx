"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatEUR } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";
import { chartColors, chartTickStyle } from "./chartTheme";

export interface WeekdayPoint {
  weekday: string;
  total: number;
}

export function WeekdayPatternChart({ data }: { data: WeekdayPoint[] }) {
  if (data.every((d) => d.total === 0)) {
    return <p className="text-sm text-gray-400">Sin gastos suficientes todavía.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 24 }}>
        <CartesianGrid strokeDasharray="0" vertical={false} stroke={chartColors.gridline} />
        <XAxis
          dataKey="weekday"
          tick={chartTickStyle}
          axisLine={{ stroke: chartColors.axis }}
          tickLine={false}
          tickFormatter={(v: string) => v.slice(0, 3)}
        />
        <YAxis tick={chartTickStyle} axisLine={false} tickLine={false} width={0} hide />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(42,120,214,0.06)" }} />
        <Bar dataKey="total" name="Gastado" fill={chartColors.series1} barSize={32} radius={[4, 4, 0, 0]}>
          <LabelList
            dataKey="total"
            position="top"
            formatter={(value) => formatEUR(Number(value))}
            style={{ fill: chartColors.mutedText, fontSize: 11 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
