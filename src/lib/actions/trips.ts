"use server";

import { revalidatePath } from "next/cache";
import * as tripService from "@/lib/core/tripService";
import { getCategorySlug } from "@/lib/core/categoryService";
import { tripSchema } from "@/lib/validation/schemas";

export async function createTripAction(formData: FormData, categoryId: string) {
  const input = tripSchema.parse({
    countryCode: formData.get("countryCode"),
    countryName: formData.get("countryName"),
    subdivisionCode: formData.get("subdivisionCode") || undefined,
    subdivisionName: formData.get("subdivisionName") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    notes: formData.get("notes") || undefined,
  });
  const trip = await tripService.createTrip(input);
  const slug = await getCategorySlug(categoryId);
  if (slug) revalidatePath(`/categorias/${slug}`);
  return trip;
}

export async function deleteTripAction(id: string, categoryId: string) {
  await tripService.deleteTrip(id);
  const slug = await getCategorySlug(categoryId);
  if (slug) revalidatePath(`/categorias/${slug}`);
}
