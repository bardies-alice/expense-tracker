"use client";

import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatEUR } from "@/lib/format";
import { ChartTooltip } from "./ChartTooltip";
import { chartColors, chartTickStyle } from "./chartTheme";

export interface MerchantPoint {
  merchant: string;
  total: number;
  count: number;
}

export function MerchantRankingChart({ data }: { data: MerchantPoint[] }) {
  const router = useRouter();

  if (data.length === 0) {
    return <p className="text-sm text-gray-400">Sin comercios registrados todavía.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 24, right: 56 }}>
        <CartesianGrid strokeDasharray="0" horizontal={false} stroke={chartColors.gridline} />
        <XAxis type="number" tick={chartTickStyle} axisLine={{ stroke: chartColors.axis }} tickLine={false} />
        <YAxis
          type="category"
          dataKey="merchant"
          tick={chartTickStyle}
          axisLine={{ stroke: chartColors.axis }}
          tickLine={false}
          width={110}
          tickFormatter={(v: string) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(42,120,214,0.06)" }} />
        <Bar
          dataKey="total"
          name="Gastado"
          fill={chartColors.expense}
          barSize={18}
          radius={[0, 4, 4, 0]}
          cursor="pointer"
          onClick={(item) => {
            const merchant = item?.payload?.merchant;
            if (merchant) router.push(`/comercios/${encodeURIComponent(merchant)}`);
          }}
        >
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
