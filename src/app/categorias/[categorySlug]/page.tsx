import { notFound } from "next/navigation";
import { getCategoryBySlug, listCategoriesWithItems } from "@/lib/core/categoryService";
import { listTransactions } from "@/lib/core/transactionService";
import { listTrips } from "@/lib/core/tripService";
import { listRecurringRules } from "@/lib/core/recurringService";
import { ItemList } from "@/components/items/ItemList";
import { ItemForm } from "@/components/items/ItemForm";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { RecurringRuleList } from "@/components/transactions/RecurringRuleList";
import { TravelMap } from "@/components/trips/TravelMap";
import { TripStats } from "@/components/trips/TripStats";
import { TripForm } from "@/components/trips/TripForm";
import { CategoryStats } from "@/components/categories/CategoryStats";

const DEFAULT_ITEM_TYPE: Record<string, "CAR" | "HOUSE"> = {
  coche: "CAR",
  casa: "HOUSE",
};

export default async function CategoriaDetailPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  const [category, categories] = await Promise.all([getCategoryBySlug(categorySlug), listCategoriesWithItems()]);
  if (!category) notFound();

  const transactions = await listTransactions({ categoryId: category.id });
  const recurringRules = await listRecurringRules(category.id);
  const itemsEnabled = category.slug in DEFAULT_ITEM_TYPE;
  const isTravel = category.slug === "viajes";
  const trips = isTravel ? await listTrips() : [];
  const totalExpense = transactions.reduce((sum, t) => sum + (t.type === "EXPENSE" ? t.amount : 0), 0);
  const totalIncome = transactions.reduce((sum, t) => sum + (t.type === "INCOME" ? t.amount : 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        {isTravel ? (
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.3l-1.6-8.7 4-2.3c1-.6 1-2 0-2.6l-.8-.5c-.5-.3-1.1-.3-1.6 0L14 7.4 6.3 4.9c-.5-.2-1 0-1.3.4l-.5.7c-.3.4-.2 1 .2 1.3L10 10l-3 2.2-2.6-.6c-.4-.1-.8 0-1 .4l-.3.5c-.3.4-.1 1 .3 1.2l3.1 1.6.9 3.3c.1.4.5.7 1 .6l.5-.1c.4-.1.7-.5.6-1l-.7-2.7 3-2.2 3.3 6.7c.2.5.8.7 1.2.4l.5-.3c.3-.2.4-.6.3-1z" />
              </svg>
            </div>
            <div>
              <h1 className="m-0 text-[26px] font-bold tracking-tight text-gray-900">{category.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {new Set(trips.map((t) => t.countryCode)).size} países visitados · {trips.length} viajes registrados
              </p>
            </div>
          </div>
        ) : (
          <h1 className="text-xl font-semibold text-gray-900">{category.name}</h1>
        )}
        <div className="flex flex-wrap gap-2">
          {itemsEnabled && <ItemForm categoryId={category.id} defaultType={DEFAULT_ITEM_TYPE[category.slug]} />}
          {isTravel && <TripForm categoryId={category.id} />}
          <TransactionModal
            categories={categories}
            defaultCategoryId={category.id}
            trigger={category.slug === "salario" ? "Nuevo ingreso" : "Nuevo gasto"}
          />
        </div>
      </div>

      {isTravel ? (
        <>
          <TripStats trips={trips} totalExpense={totalExpense} />
          <section>
            <TravelMap trips={trips} categoryId={category.id} />
          </section>
        </>
      ) : (
        <CategoryStats totalExpense={totalExpense} totalIncome={totalIncome} count={transactions.length} />
      )}

      {itemsEnabled && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-gray-500">Items</h2>
          <ItemList items={category.items} />
        </section>
      )}

      <RecurringRuleList rules={recurringRules} categoryId={category.id} />

      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-500">Transacciones</h2>
        <TransactionTable transactions={transactions} categories={categories} />
      </section>
    </div>
  );
}
