import Link from "next/link";
import { notFound } from "next/navigation";
import { listCategoriesWithItems } from "@/lib/core/categoryService";
import { listTransactions } from "@/lib/core/transactionService";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { formatEUR } from "@/lib/format";

export default async function MerchantPage({ params }: { params: Promise<{ notes: string }> }) {
  const { notes } = await params;
  const merchantName = decodeURIComponent(notes);

  const [transactions, categories] = await Promise.all([
    listTransactions({ notes: merchantName }),
    listCategoriesWithItems(),
  ]);

  if (transactions.length === 0) notFound();

  const totalSpent = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <Link href="/gastos" className="mb-2 inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Gastos e ingresos
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="m-0 text-2xl font-bold tracking-tight text-gray-900">{merchantName}</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {transactions.length} {transactions.length === 1 ? "movimiento" : "movimientos"}
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gray-400">Gastado</p>
            <p className="text-lg font-semibold text-gray-900">{formatEUR(totalSpent)}</p>
          </div>
          {totalIncome > 0 && (
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-400">Recibido</p>
              <p className="text-lg font-semibold text-emerald-600">{formatEUR(totalIncome)}</p>
            </div>
          )}
        </div>
      </div>

      <TransactionTable transactions={transactions} categories={categories} />
    </div>
  );
}
