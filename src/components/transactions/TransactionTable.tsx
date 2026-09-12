import type { Category, ExpenseLine, Item, Subcategory, Transaction } from "@prisma/client";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {groups.map((group) => (
        <div key={group.key}>
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-wide text-gray-400">
            {formatDate(group.date)}
          </div>
          {group.items.map((t) => {
            const color = t.category.color ?? "#6366f1";
            return (
              <div
                key={t.id}
                className="flex items-center gap-2.5 border-b border-gray-100 px-3.5 py-3.5 last:border-b-0 sm:gap-3.5 sm:px-5"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: `${color}1a`, color }}
                >
                  <CategoryIcon name={t.category.icon} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-gray-800">
                    {t.notes ? (
                      <Link href={`/comercios/${encodeURIComponent(t.notes)}`} className="hover:text-indigo-600 hover:underline">
                        {t.notes}
                      </Link>
                    ) : (
                      t.item?.name ?? (t.lines.length ? `${t.lines.length} productos` : t.category.name)
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {t.category.name}
                    {t.subcategory ? ` · ${t.subcategory.name}` : ""}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${t.type === "INCOME" ? "text-emerald-600" : "text-gray-900"}`}>
                  {t.type === "INCOME" ? "+" : "-"}
                  {formatEUR(t.amount)}
                </span>
                <div className="flex shrink-0 gap-2.5 pl-1">
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
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
