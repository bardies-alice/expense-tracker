import Link from "next/link";
import type { Category, ExpenseLine, Item, Subcategory, Transaction } from "@prisma/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatEUR } from "@/lib/format";
import { DeleteTransactionButton } from "./DeleteTransactionButton";

type TransactionRow = Transaction & {
  category: Category;
  subcategory: Subcategory | null;
  item: Item | null;
  lines: ExpenseLine[];
};

export function TransactionTable({ transactions }: { transactions: TransactionRow[] }) {
  if (transactions.length === 0) {
    return <EmptyState title="Sin transacciones" description="Registra tu primer gasto o ingreso." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Fecha</th>
            <th className="px-4 py-2">Categoría</th>
            <th className="px-4 py-2">Item</th>
            <th className="px-4 py-2">Notas</th>
            <th className="px-4 py-2 text-right">Importe</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((t) => (
            <tr key={t.id}>
              <td className="px-4 py-2 whitespace-nowrap text-gray-500">{formatDate(t.date)}</td>
              <td className="px-4 py-2">{t.category.name}{t.subcategory ? ` · ${t.subcategory.name}` : ""}</td>
              <td className="px-4 py-2 text-gray-500">{t.item?.name ?? "—"}</td>
              <td className="px-4 py-2 text-gray-500">{t.notes ?? (t.lines.length ? `${t.lines.length} productos` : "—")}</td>
              <td className={`px-4 py-2 text-right font-medium ${t.type === "INCOME" ? "text-emerald-600" : "text-gray-900"}`}>
                {t.type === "INCOME" ? "+" : "-"}{formatEUR(t.amount)}
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`/gastos/${t.id}/editar`} className="text-xs text-indigo-600 hover:text-indigo-800">
                    Editar
                  </Link>
                  <DeleteTransactionButton id={t.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
