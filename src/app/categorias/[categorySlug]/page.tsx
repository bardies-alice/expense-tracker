import { notFound } from "next/navigation";
import { getCategoryBySlug, listCategoriesWithItems } from "@/lib/core/categoryService";
import { listTransactions } from "@/lib/core/transactionService";
import { listTrips } from "@/lib/core/tripService";
import { ItemList } from "@/components/items/ItemList";
import { ItemForm } from "@/components/items/ItemForm";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { TravelMap } from "@/components/trips/TravelMap";

const DEFAULT_ITEM_TYPE: Record<string, "CAR" | "HOUSE"> = {
  coche: "CAR",
  casa: "HOUSE",
};

export default async function CategoriaDetailPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  const [category, categories] = await Promise.all([getCategoryBySlug(categorySlug), listCategoriesWithItems()]);
  if (!category) notFound();

  const transactions = await listTransactions({ categoryId: category.id });
  const itemsEnabled = category.slug in DEFAULT_ITEM_TYPE;
  const isTravel = category.slug === "viajes";
  const trips = isTravel ? await listTrips() : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{category.name}</h1>
        <div className="flex gap-2">
          {itemsEnabled && <ItemForm categoryId={category.id} defaultType={DEFAULT_ITEM_TYPE[category.slug]} />}
          <TransactionModal categories={categories} defaultCategoryId={category.id} />
        </div>
      </div>

      {isTravel && (
        <section>
          <TravelMap trips={trips} categoryId={category.id} />
        </section>
      )}

      {itemsEnabled && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-gray-500">Items</h2>
          <ItemList items={category.items} />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-500">Transacciones</h2>
        <TransactionTable transactions={transactions} categories={categories} />
      </section>
    </div>
  );
}
