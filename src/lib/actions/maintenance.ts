"use server";

import { revalidatePath } from "next/cache";
import * as maintenanceService from "@/lib/core/maintenanceService";
import { maintenanceComponentSchema, maintenanceComponentUpdateSchema, maintenanceEventSchema } from "@/lib/validation/schemas";

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
  revalidatePath(`/items/${input.itemId}`);
  return component;
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
  revalidatePath(`/items/${itemId}`);
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
  revalidatePath(`/items/${itemId}`);
  return event;
}

function numOrUndef(v: FormDataEntryValue | null) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}
