"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatEUR, formatMonthShort } from "@/lib/format";
import type { MonthlySummaryPoint } from "./IncomeVsExpenseChart";

export function BalanceTrendChart({ data }: { data: MonthlySummaryPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400">Sin datos suficientes todavía.</p>;
  }

  const points = data.reduce<{ month: string; balance: number }[]>((acc, d) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    const balance = Math.round((prev + d.income - d.expense) * 100) / 100;
    acc.push({ month: d.month, balance });
    return acc;
  }, []);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={points} margin={{ left: 4, right: 12 }}>
        <defs>
          <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} tickFormatter={formatMonthShort} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatEUR(v)} width={80} />
        <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="4 4" />
        <Tooltip formatter={(value) => formatEUR(Number(value))} labelFormatter={formatMonthShort} />
        <Area type="monotone" dataKey="balance" name="Balance acumulado" stroke="#4f46e5" strokeWidth={2} fill="url(#balanceFill)" dot={{ r: 3, fill: "#4f46e5" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
