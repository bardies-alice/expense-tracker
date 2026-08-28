import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemById } from "@/lib/core/itemService";
import { listTransactions } from "@/lib/core/transactionService";
import { computeComponentStatus } from "@/lib/maintenance/computeStatus";
import { getComponentDefinitions } from "@/lib/maintenance/rules";
import { ItemMaintenancePanel } from "@/components/items/ItemMaintenancePanel";
import { KmUpdateForm } from "@/components/items/KmUpdateForm";
import { VehicleExpensesPanel } from "@/components/items/VehicleExpensesPanel";
import type { CarMetadata } from "@/types";
import type { VisualComponent } from "@/components/items/visual-card/VisualCard";

export default async function ItemDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const item = await getItemById(itemId);
  if (!item) notFound();

  const metadata = (item.metadata as CarMetadata | null) ?? undefined;
  const currentKm = metadata?.currentKm;

  const visualComponents: VisualComponent[] = item.components.map((c) => {
    const lastEvent = c.events[0];
    const status = computeComponentStatus({
      ruleType: c.ruleType,
      intervalKm: c.intervalKm,
      intervalDays: c.intervalDays,
      warningKm: c.warningKm,
      warningDays: c.warningDays,
      lastEventDate: lastEvent?.date,
      lastEventKm: lastEvent?.mileageKm,
      currentKm,
    });
    return {
      id: c.id,
      componentType: c.componentType,
      zoneKey: c.zoneKey,
      label: c.label,
      status,
      lastEventDate: lastEvent?.date ?? null,
      lastEventKm: lastEvent?.mileageKm ?? null,
      ruleType: c.ruleType,
      intervalKm: c.intervalKm,
      intervalDays: c.intervalDays,
      warningKm: c.warningKm,
      warningDays: c.warningDays,
    };
  });

  const catalog = getComponentDefinitions(item.type);
  const transactions = await listTransactions({ itemId: item.id });

  return (
    <div>
      <Link href={`/categorias/${item.categoryId}`} className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        {item.category.name}
      </Link>

      <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="m-0 text-2xl font-bold tracking-tight text-gray-900">{item.name}</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {item.category.name}
            {metadata?.plate ? ` · ${metadata.plate}` : ""}
          </p>
        </div>
        {item.type === "CAR" && <KmUpdateForm itemId={item.id} categoryId={item.categoryId} currentKm={currentKm ?? 0} />}
      </div>

      <div className={item.type === "CAR" ? "grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(360px,460px)_1fr]" : ""}>
        <div>
          <ItemMaintenancePanel
            itemId={item.id}
            itemType={item.type}
            components={visualComponents}
            currentKm={currentKm}
            catalog={catalog}
          />
        </div>

        {item.type === "CAR" && (
          <VehicleExpensesPanel
            categoryId={item.categoryId}
            subcategories={item.category.subcategories}
            transactions={transactions.map((t) => ({
              id: t.id,
              date: t.date,
              notes: t.notes,
              amount: t.amount,
              type: t.type,
              subcategoryId: t.subcategoryId,
              categoryLabel: t.subcategory?.name ?? t.category.name,
            }))}
          />
        )}
      </div>
    </div>
  );
}
