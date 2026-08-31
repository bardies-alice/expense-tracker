"use client";

import { useState } from "react";
import type { ComponentTypeDefinition } from "@/lib/constants/componentTypes";
import { VisualCard, type VisualComponent } from "./visual-card/VisualCard";
import { MaintenanceEventForm } from "@/components/maintenance/MaintenanceEventForm";
import { MaintenanceComponentsList } from "@/components/maintenance/MaintenanceComponentsList";

export function ItemMaintenancePanel({
  itemId,
  itemType,
  components,
  currentKm,
  catalog,
}: {
  itemId: string;
  itemType: "CAR" | "HOUSE" | "GENERIC";
  components: VisualComponent[];
  currentKm?: number | null;
  catalog?: ComponentTypeDefinition[];
}) {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  const selected = components.find((c) => c.id === selectedComponentId);

  return (
    <>
      <VisualCard itemType={itemType} components={components} currentKm={currentKm} onZoneClick={setSelectedComponentId} />
      {(itemType === "CAR" || itemType === "HOUSE") && catalog && (
        <MaintenanceComponentsList
          itemId={itemId}
          itemType={itemType}
          components={components}
          catalog={catalog}
          onSelect={setSelectedComponentId}
        />
      )}
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
