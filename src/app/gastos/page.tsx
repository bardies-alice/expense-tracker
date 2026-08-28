import { listCategoriesWithItems } from "@/lib/core/categoryService";
import { listTransactions } from "@/lib/core/transactionService";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionModal } from "@/components/transactions/TransactionModal";

export default async function GastosPage() {
  const [transactions, categories] = await Promise.all([listTransactions(), listCategoriesWithItems()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Gastos e ingresos</h1>
        <TransactionModal categories={categories} trigger="Nuevo" />
      </div>
      <TransactionTable transactions={transactions} categories={categories} />
    </div>
  );
}
