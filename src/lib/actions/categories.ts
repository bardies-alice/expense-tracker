"use server";

import { revalidatePath } from "next/cache";
import * as categoryService from "@/lib/core/categoryService";
import { categorySchema, subcategorySchema } from "@/lib/validation/schemas";

export async function createCategoryAction(formData: FormData) {
  const input = categorySchema.parse({
    name: formData.get("name"),
    icon: formData.get("icon") || undefined,
    color: formData.get("color") || undefined,
  });
  const category = await categoryService.createCategory(input);
  revalidatePath("/categorias");
  return category;
}

export async function deleteCategoryAction(id: string) {
  await categoryService.deleteCategory(id);
  revalidatePath("/categorias");
}

export async function createSubcategoryAction(formData: FormData) {
  const input = subcategorySchema.parse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
  });
  const sub = await categoryService.createSubcategory(input);
  const slug = await categoryService.getCategorySlug(input.categoryId);
  if (slug) revalidatePath(`/categorias/${slug}`);
  return sub;
}
