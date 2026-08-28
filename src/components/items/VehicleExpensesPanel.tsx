"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Subcategory, Transaction } from "@prisma/client";
import { formatDate, formatEUR } from "@/lib/format";

export interface VehicleTransaction extends Pick<Transaction, "id" | "date" | "notes" | "amount" | "type"> {
  subcategoryId: string | null;
  categoryLabel: string;
}

export function VehicleExpensesPanel({
  categoryId,
  subcategories,
  transactions,
}: {
  categoryId: string;
  subcategories: Subcategory[];
  transactions: VehicleTransaction[];
}) {
  const [activeTab, setActiveTab] = useState<string>("todos");

  const tabs = useMemo(() => [{ id: "todos", label: "Todos" }, ...subcategories.map((s) => ({ id: s.id, label: s.name }))], [subcategories]);

  const visible = activeTab === "todos" ? transactions : transactions.filter((t) => t.subcategoryId === activeTab);
  const total = visible.reduce((sum, t) => sum + (t.type === "INCOME" ? t.amount : -t.amount), 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-[18px]">
        <div>
          <h2 className="m-0 text-sm font-semibold text-gray-800">Gastos relacionados</h2>
          <p className="mt-1 text-xs text-gray-400">{visible.length} movimientos</p>
        </div>
        <div className="text-right">
          <p className="m-0 text-[11px] uppercase tracking-wide text-gray-400">Total</p>
          <p className="mt-0.5 text-lg font-bold text-gray-900">{formatEUR(Math.abs(total))}</p>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 px-5 pt-3">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap border-b-2 px-3 pb-3 pt-2 text-[13px] font-medium"
              style={{ color: active ? "#4c51bf" : "#718096", borderColor: active ? "#667eea" : "transparent" }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-400">Sin movimientos en esta categoría todavía.</p>
      ) : (
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-2.5 text-[11px] font-medium uppercase text-gray-500">Fecha</th>
              <th className="px-3 py-2.5 text-[11px] font-medium uppercase text-gray-500">Notas</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-medium uppercase text-gray-500">Importe</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <tr key={t.id} className="h-11 border-t border-gray-100">
                <td className="whitespace-nowrap px-5 text-gray-500">{formatDate(t.date)}</td>
                <td className="px-3 text-gray-700">{t.notes ?? t.categoryLabel}</td>
                <td className="whitespace-nowrap px-5 text-right font-medium text-gray-800">
                  {t.type === "INCOME" ? "+" : "-"}
                  {formatEUR(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="border-t border-gray-200 px-5 py-3.5">
        <Link href={`/categorias/${categoryId}`} className="text-[13px] font-medium text-indigo-600 hover:text-indigo-800">
          Ver todos los gastos del vehículo →
        </Link>
      </div>
    </div>
  );
}
