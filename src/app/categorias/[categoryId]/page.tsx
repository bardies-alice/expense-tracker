import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryById } from "@/lib/core/categoryService";
import { listTransactions } from "@/lib/core/transactionService";
import { ItemList } from "@/components/items/ItemList";
import { ItemForm } from "@/components/items/ItemForm";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Button } from "@/components/ui/Button";

const DEFAULT_ITEM_TYPE: Record<string, "CAR" | "HOUSE" | "GENERIC"> = {
  coche: "CAR",
  casa: "HOUSE",
};

export default async function CategoriaDetailPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const category = await getCategoryById(categoryId);
  if (!category) notFound();

  const transactions = await listTransactions({ categoryId });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{category.name}</h1>
        <div className="flex gap-2">
          <ItemForm categoryId={category.id} defaultType={DEFAULT_ITEM_TYPE[category.slug] ?? "GENERIC"} />
          <Link href={`/gastos/nuevo?categoryId=${category.id}`}>
            <Button>Nuevo gasto</Button>
          </Link>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-500">Items</h2>
        <ItemList items={category.items} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-500">Transacciones</h2>
        <TransactionTable transactions={transactions} />
      </section>
    </div>
  );
}
