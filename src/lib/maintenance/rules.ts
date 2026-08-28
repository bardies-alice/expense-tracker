import { COMPONENT_CATALOG, type ComponentTypeDefinition } from "@/lib/constants/componentTypes";
import type { ItemType } from "@prisma/client";

export function getComponentDefinitions(itemType: ItemType): ComponentTypeDefinition[] {
  return COMPONENT_CATALOG[itemType] ?? [];
}

export function findComponentDefinition(itemType: ItemType, componentType: string): ComponentTypeDefinition | undefined {
  return getComponentDefinitions(itemType).find((c) => c.componentType === componentType);
}
