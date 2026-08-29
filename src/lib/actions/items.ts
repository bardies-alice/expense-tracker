"use server";

import { revalidatePath } from "next/cache";
import * as itemService from "@/lib/core/itemService";
import { getCategorySlug } from "@/lib/core/categoryService";
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
  const slug = await getCategorySlug(input.categoryId);
  if (slug) revalidatePath(`/categorias/${slug}`);
  return item;
}

export async function updateItemKmAction(itemId: string, categoryId: string, currentKm: number) {
  const item = await itemService.getItemById(itemId);
  const metadata = { ...(item?.metadata as Record<string, unknown> | undefined), currentKm };
  await itemService.updateItemMetadata(itemId, metadata);
  const itemSlug = await itemService.getItemSlug(itemId);
  if (itemSlug) revalidatePath(`/items/${itemSlug}`);
  const slug = await getCategorySlug(categoryId);
  if (slug) revalidatePath(`/categorias/${slug}`);
}

export async function deleteItemAction(id: string, categoryId: string) {
  await itemService.deleteItem(id);
  const slug = await getCategorySlug(categoryId);
  if (slug) revalidatePath(`/categorias/${slug}`);
}
