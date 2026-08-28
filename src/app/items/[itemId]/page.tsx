import { notFound } from "next/navigation";
import { getItemById } from "@/lib/core/itemService";
import { computeComponentStatus } from "@/lib/maintenance/computeStatus";
import { getComponentDefinitions } from "@/lib/maintenance/rules";
import { ItemMaintenancePanel } from "@/components/items/ItemMaintenancePanel";
import { KmUpdateForm } from "@/components/items/KmUpdateForm";
import { MaintenanceComponentForm } from "@/components/maintenance/MaintenanceComponentForm";
import { MaintenanceHistoryTable } from "@/components/maintenance/MaintenanceHistoryTable";
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
    };
  });

  const catalog = getComponentDefinitions(item.type);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{item.name}</h1>
          <p className="text-sm text-gray-500">{item.category.name}</p>
        </div>
        {item.type === "CAR" && (
          <KmUpdateForm itemId={item.id} categoryId={item.categoryId} currentKm={currentKm ?? 0} />
        )}
      </div>

      <ItemMaintenancePanel itemId={item.id} itemType={item.type} components={visualComponents} currentKm={currentKm} />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-500">Componentes de mantenimiento</h2>
        <MaintenanceComponentForm itemId={item.id} catalog={catalog} />
      </div>

      <div className="space-y-6">
        {item.components.map((c) => (
          <div key={c.id}>
            <h3 className="mb-2 text-sm font-medium text-gray-700">{c.label}</h3>
            <MaintenanceHistoryTable events={c.events} />
          </div>
        ))}
      </div>
    </div>
  );
}
