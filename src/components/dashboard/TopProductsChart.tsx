"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface TopProductPoint {
  productName: string;
  count: number;
}

export function TopProductsChart({ data }: { data: TopProductPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400">Añade gastos de comida con líneas de producto para ver el ranking.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="productName" tick={{ fontSize: 12 }} width={100} />
        <Tooltip />
        <Bar dataKey="count" name="Veces comprado" fill="#6366f1" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
