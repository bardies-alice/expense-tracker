"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Category, Item, Subcategory, Transaction } from "@prisma/client";
import { formatDate, formatEUR } from "@/lib/format";
import { Modal } from "@/components/ui/Modal";
import { TransactionForm } from "@/components/transactions/TransactionForm";

export interface ItemExpenseTransaction extends Pick<Transaction, "id" | "date" | "notes" | "amount" | "type"> {
  subcategoryId: string | null;
  categoryLabel: string;
}

export function ItemExpensesPanel({
  category,
  item,
  subcategories,
  transactions,
}: {
  category: Category;
  item: Item;
  subcategories: Subcategory[];
  transactions: ItemExpenseTransaction[];
}) {
  const router = useRouter();
  const categoryId = category.id;
  const itemId = item.id;
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [addOpen, setAddOpen] = useState(false);
  const formCategories = useMemo(() => [{ ...category, subcategories, items: [item] }], [category, subcategories, item]);

  const tabs = useMemo(() => [{ id: "todos", label: "Todos" }, ...subcategories.map((s) => ({ id: s.id, label: s.name }))], [subcategories]);

  const visible = activeTab === "todos" ? transactions : transactions.filter((t) => t.subcategoryId === activeTab);
  const total = visible.reduce((sum, t) => sum + (t.type === "INCOME" ? t.amount : -t.amount), 0);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-[18px] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="m-0 text-sm font-semibold text-ink">Gastos relacionados</h2>
          <p className="mt-1 text-xs text-muted">{visible.length} movimientos</p>
        </div>
        <div className="flex items-start gap-4">
          <div className="text-right">
            <p className="m-0 text-[11px] uppercase tracking-wide text-muted">Total</p>
            <p className="mt-0.5 text-lg font-bold text-ink">{formatEUR(Math.abs(total))}</p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="whitespace-nowrap rounded-lg bg-ink px-3 py-2 text-[13px] font-medium text-white hover:opacity-90"
          >
            + Añadir gasto
          </button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border px-5 pt-3">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-3 pb-3 pt-2 text-[13px] font-medium ${
                active ? "border-ink text-ink" : "border-transparent text-muted"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted">Sin movimientos en esta categoría todavía.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-surface text-left">
                <th className="px-5 py-2.5 text-[11px] font-medium uppercase text-muted">Fecha</th>
                <th className="px-3 py-2.5 text-[11px] font-medium uppercase text-muted">Notas</th>
                <th className="px-5 py-2.5 text-right text-[11px] font-medium uppercase text-muted">Importe</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id} className="h-11 border-t border-border">
                  <td className="whitespace-nowrap px-5 text-muted">{formatDate(t.date)}</td>
                  <td className="max-w-[180px] break-words px-3 text-ink">{t.notes ?? t.categoryLabel}</td>
                  <td className="whitespace-nowrap px-5 text-right font-medium text-ink">
                    {t.type === "INCOME" ? "+" : "-"}
                    {formatEUR(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-border px-5 py-3.5">
        <Link href={`/categorias/${category.slug}`} className="text-[13px] font-medium text-accent hover:opacity-80">
          Ver todos los gastos de {item.name} →
        </Link>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={`Nuevo gasto de ${item.name}`}>
        <TransactionForm
          categories={formCategories}
          defaultCategoryId={categoryId}
          defaultItemId={itemId}
          onSuccess={() => {
            setAddOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </div>
  );
}
