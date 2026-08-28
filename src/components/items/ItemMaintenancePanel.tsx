"use client";

import { useState } from "react";
import { VisualCard, type VisualComponent } from "./visual-card/VisualCard";
import { MaintenanceEventForm } from "@/components/maintenance/MaintenanceEventForm";

export function ItemMaintenancePanel({
  itemId,
  itemType,
  components,
  currentKm,
}: {
  itemId: string;
  itemType: "CAR" | "HOUSE" | "GENERIC";
  components: VisualComponent[];
  currentKm?: number | null;
}) {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const selected = components.find((c) => c.id === selectedComponentId);

  return (
    <>
      <VisualCard itemType={itemType} components={components} currentKm={currentKm} onZoneClick={setSelectedComponentId} />
      <MaintenanceEventForm
        open={!!selectedComponentId}
        onClose={() => setSelectedComponentId(null)}
        itemId={itemId}
        componentId={selectedComponentId}
        componentLabel={selected?.label}
      />
    </>
  );
}
