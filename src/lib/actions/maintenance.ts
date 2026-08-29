"use server";

import { revalidatePath } from "next/cache";
import * as maintenanceService from "@/lib/core/maintenanceService";
import { getItemSlug } from "@/lib/core/itemService";
import { maintenanceComponentSchema, maintenanceComponentUpdateSchema, maintenanceEventSchema } from "@/lib/validation/schemas";

async function revalidateItem(itemId: string) {
  const slug = await getItemSlug(itemId);
  if (slug) revalidatePath(`/items/${slug}`);
}

export async function createMaintenanceComponentAction(formData: FormData) {
  const input = maintenanceComponentSchema.parse({
    itemId: formData.get("itemId"),
    componentType: formData.get("componentType"),
    zoneKey: formData.get("zoneKey"),
    label: formData.get("label"),
    ruleType: formData.get("ruleType"),
    intervalKm: numOrUndef(formData.get("intervalKm")),
    intervalDays: numOrUndef(formData.get("intervalDays")),
    warningKm: numOrUndef(formData.get("warningKm")),
    warningDays: numOrUndef(formData.get("warningDays")),
  });
  const component = await maintenanceService.createMaintenanceComponent(input);
  await revalidateItem(input.itemId);
  return component;
}

export async function deleteMaintenanceComponentAction(componentId: string, itemId: string) {
  await maintenanceService.deleteMaintenanceComponent(componentId);
  await revalidateItem(itemId);
}

export async function updateMaintenanceComponentAction(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const componentId = formData.get("componentId") as string;
  const input = maintenanceComponentUpdateSchema.parse({
    label: formData.get("label"),
    ruleType: formData.get("ruleType"),
    intervalKm: numOrUndef(formData.get("intervalKm")),
    intervalDays: numOrUndef(formData.get("intervalDays")),
    warningKm: numOrUndef(formData.get("warningKm")),
    warningDays: numOrUndef(formData.get("warningDays")),
  });
  const component = await maintenanceService.updateMaintenanceComponent(componentId, input);
  await revalidateItem(itemId);
  return component;
}

export async function createMaintenanceEventAction(formData: FormData) {
  const itemId = formData.get("itemId") as string;
  const input = maintenanceEventSchema.parse({
    componentId: formData.get("componentId"),
    date: formData.get("date"),
    mileageKm: numOrUndef(formData.get("mileageKm")),
    notes: formData.get("notes") || undefined,
    cost: numOrUndef(formData.get("cost")),
  });
  const event = await maintenanceService.createMaintenanceEvent(input);
  await revalidateItem(itemId);
  return event;
}

function numOrUndef(v: FormDataEntryValue | null) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}
