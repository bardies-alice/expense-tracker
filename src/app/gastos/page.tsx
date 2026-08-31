import Link from "next/link";
import { listCategoriesWithItems } from "@/lib/core/categoryService";
import { listTransactions } from "@/lib/core/transactionService";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { PageHeading } from "@/components/ui/PageHeading";

const MONTH_LABEL = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;

  let from: Date | undefined;
  let to: Date | undefined;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, monthNum] = month.split("-").map(Number);
    from = new Date(year, monthNum - 1, 1);
    to = new Date(year, monthNum, 0, 23, 59, 59);
  }

  const [transactions, categories] = await Promise.all([
    listTransactions({ from, to }),
    listCategoriesWithItems(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeading title="Gastos" subtitle="Todas tus transacciones registradas" />
        <TransactionModal categories={categories} trigger="Nuevo" />
      </div>

      {from && (
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-indigo-50 px-3 py-1.5 font-medium text-indigo-700 capitalize">
            {MONTH_LABEL.format(from)}
          </span>
          <Link href="/gastos" className="text-gray-400 hover:text-gray-600">
            Quitar filtro ✕
          </Link>
        </div>
      )}

      <TransactionTable transactions={transactions} categories={categories} />
    </div>
  );
}
