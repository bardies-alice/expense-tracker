import Link from "next/link";
import { listTransactions } from "@/lib/core/transactionService";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Button } from "@/components/ui/Button";

export default async function GastosPage() {
  const transactions = await listTransactions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Gastos e ingresos</h1>
        <Link href="/gastos/nuevo">
          <Button>Nuevo</Button>
        </Link>
      </div>
      <TransactionTable transactions={transactions} />
    </div>
  );
}
