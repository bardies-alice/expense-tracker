"use server";

import { revalidatePath } from "next/cache";
import * as recurringService from "@/lib/core/recurringService";
import { getCategorySlug } from "@/lib/core/categoryService";
import { recurringRuleSchema } from "@/lib/validation/schemas";

export async function createRecurringRuleAction(formData: FormData) {
  const input = recurringRuleSchema.parse({
    type: formData.get("type"),
    amount: Number(formData.get("amount")),
    notes: formData.get("notes") || undefined,
    categoryId: formData.get("categoryId"),
    subcategoryId: formData.get("subcategoryId") || undefined,
    itemId: formData.get("itemId") || undefined,
    frequency: formData.get("frequency"),
    startDate: formData.get("startDate"),
  });
  const rule = await recurringService.createRecurringRule(input);
  await recurringService.runDueRecurringRules();
  const slug = await getCategorySlug(input.categoryId);
  if (slug) revalidatePath(`/categorias/${slug}`);
  return rule;
}

export async function deleteRecurringRuleAction(id: string, categoryId: string) {
  await recurringService.deleteRecurringRule(id);
  const slug = await getCategorySlug(categoryId);
  if (slug) revalidatePath(`/categorias/${slug}`);
}

export async function setRecurringRuleActiveAction(id: string, categoryId: string, active: boolean) {
  await recurringService.setRecurringRuleActive(id, active);
  const slug = await getCategorySlug(categoryId);
  if (slug) revalidatePath(`/categorias/${slug}`);
}
