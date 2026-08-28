"use server";

import { revalidatePath } from "next/cache";
import * as itemService from "@/lib/core/itemService";
import { itemSchema } from "@/lib/validation/schemas";

export async function createItemAction(formData: FormData) {
  const rawKm = formData.get("currentKm");
  const input = itemSchema.parse({
    categoryId: formData.get("categoryId"),
    type: formData.get("type"),
    name: formData.get("name"),
    metadata: {
      brand: formData.get("brand") || undefined,
      model: formData.get("model") || undefined,
      currentKm: rawKm ? Number(rawKm) : undefined,
      address: formData.get("address") || undefined,
    },
  });
  const item = await itemService.createItem(input);
  revalidatePath(`/categorias/${input.categoryId}`);
  return item;
}

export async function updateItemKmAction(itemId: string, categoryId: string, currentKm: number) {
  const item = await itemService.getItemById(itemId);
  const metadata = { ...(item?.metadata as Record<string, unknown> | undefined), currentKm };
  await itemService.updateItemMetadata(itemId, metadata);
  revalidatePath(`/items/${itemId}`);
  revalidatePath(`/categorias/${categoryId}`);
}

export async function deleteItemAction(id: string, categoryId: string) {
  await itemService.deleteItem(id);
  revalidatePath(`/categorias/${categoryId}`);
}
