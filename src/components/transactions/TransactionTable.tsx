import type { Category, ExpenseLine, Item, Subcategory, Transaction } from "@prisma/client";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatEUR } from "@/lib/format";
import { DeleteTransactionButton } from "./DeleteTransactionButton";
import { TransactionModal } from "./TransactionModal";

type CategoryWithRelations = Category & { subcategories: Subcategory[]; items: Item[] };

type TransactionRow = Transaction & {
  category: Category;
  subcategory: Subcategory | null;
  item: Item | null;
  lines: ExpenseLine[];
};

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function TransactionTable({
  transactions,
  categories,
}: {
  transactions: TransactionRow[];
  categories: CategoryWithRelations[];
}) {
  if (transactions.length === 0) {
    return <EmptyState title="Sin transacciones" description="Registra tu primer gasto o ingreso." />;
  }

  const groups: { key: string; date: Date; items: TransactionRow[] }[] = [];
  for (const t of transactions) {
    const key = dayKey(t.date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(t);
    } else {
      groups.push({ key, date: t.date, items: [t] });
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Categoría</th>
            <th className="px-4 py-2">Item</th>
            <th className="px-4 py-2">Notas</th>
            <th className="px-4 py-2 text-right">Importe</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.key} className="divide-y divide-gray-100">
            <tr className="bg-gray-50">
              <th colSpan={5} className="px-4 py-1.5 text-left text-xs font-semibold text-gray-500">
                {formatDate(group.date)}
              </th>
            </tr>
            {group.items.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-2">{t.category.name}{t.subcategory ? ` · ${t.subcategory.name}` : ""}</td>
                <td className="px-4 py-2 text-gray-500">{t.item?.name ?? "—"}</td>
                <td className="px-4 py-2 text-gray-500">
                  {t.notes ? (
                    <Link href={`/comercios/${encodeURIComponent(t.notes)}`} className="hover:text-indigo-600 hover:underline">
                      {t.notes}
                    </Link>
                  ) : (
                    t.lines.length ? `${t.lines.length} productos` : "—"
                  )}
                </td>
                <td className={`px-4 py-2 text-right font-medium ${t.type === "INCOME" ? "text-emerald-600" : "text-gray-900"}`}>
                  {t.type === "INCOME" ? "+" : "-"}{formatEUR(t.amount)}
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-3">
                    <TransactionModal
                      categories={categories}
                      trigger="Editar"
                      variant="secondary"
                      initial={{
                        id: t.id,
                        type: t.type,
                        amount: t.amount,
                        date: t.date.toISOString(),
                        notes: t.notes,
                        categoryId: t.categoryId,
                        subcategoryId: t.subcategoryId,
                        itemId: t.itemId,
                        lines: t.lines.map((l) => ({ productName: l.productName, quantity: l.quantity, totalPrice: l.totalPrice })),
                      }}
                    />
                    <DeleteTransactionButton id={t.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
