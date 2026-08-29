"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatEUR } from "@/lib/format";

export function MonthlyBalanceChart({ data }: { data: { month: string; balance: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400">Configura tu saldo actual para ver esta gráfica.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: 4, right: 12 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatEUR(v)} width={80} />
        <Tooltip formatter={(value) => formatEUR(Number(value))} />
        <Bar dataKey="balance" name="Saldo" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
