import { notFound } from "next/navigation";
import { listCategoriesWithItems } from "@/lib/core/categoryService";
import { getTransactionById } from "@/lib/core/transactionService";
import { TransactionForm } from "@/components/transactions/TransactionForm";

export default async function EditarGastoPage({ params }: { params: Promise<{ transactionId: string }> }) {
  const { transactionId } = await params;
  const [categories, transaction] = await Promise.all([
    listCategoriesWithItems(),
    getTransactionById(transactionId),
  ]);
  if (!transaction) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Editar transacción</h1>
      <TransactionForm
        categories={categories}
        initial={{
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          date: transaction.date.toISOString(),
          notes: transaction.notes,
          categoryId: transaction.categoryId,
          subcategoryId: transaction.subcategoryId,
          itemId: transaction.itemId,
          lines: transaction.lines.map((l) => ({ productName: l.productName, quantity: l.quantity, totalPrice: l.totalPrice })),
        }}
      />
    </div>
  );
}
