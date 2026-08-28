import { listCategoriesWithItems } from "@/lib/core/categoryService";
import { TransactionForm } from "@/components/transactions/TransactionForm";

export default async function NuevoGastoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { categoryId } = await searchParams;
  const categories = await listCategoriesWithItems();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Nuevo gasto / ingreso</h1>
      <TransactionForm categories={categories} defaultCategoryId={categoryId} />
    </div>
  );
}
