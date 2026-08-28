"use server";

import { revalidatePath } from "next/cache";
import * as transactionService from "@/lib/core/transactionService";
import { transactionSchema, transactionUpdateSchema } from "@/lib/validation/schemas";

function parseLines(formData: FormData) {
  const raw = formData.get("lines");
  if (!raw) return undefined;
  try {
    return JSON.parse(raw as string);
  } catch {
    return undefined;
  }
}

export async function createTransactionAction(formData: FormData) {
  const input = transactionSchema.parse({
    type: formData.get("type"),
    amount: Number(formData.get("amount")),
    date: formData.get("date"),
    notes: formData.get("notes") || undefined,
    categoryId: formData.get("categoryId"),
    subcategoryId: formData.get("subcategoryId") || undefined,
    itemId: formData.get("itemId") || undefined,
    lines: parseLines(formData),
  });
  const transaction = await transactionService.createTransaction(input);
  revalidatePath("/gastos");
  revalidatePath("/");
  revalidatePath("/calendario");
  return transaction;
}

export async function updateTransactionAction(id: string, formData: FormData) {
  const input = transactionUpdateSchema.parse({
    type: formData.get("type") || undefined,
    amount: formData.get("amount") ? Number(formData.get("amount")) : undefined,
    date: formData.get("date") || undefined,
    notes: formData.get("notes") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    subcategoryId: formData.get("subcategoryId") || undefined,
    itemId: formData.get("itemId") || undefined,
    lines: parseLines(formData),
  });
  const transaction = await transactionService.updateTransaction(id, input);
  revalidatePath("/gastos");
  revalidatePath("/");
  revalidatePath("/calendario");
  return transaction;
}

export async function deleteTransactionAction(id: string) {
  await transactionService.deleteTransaction(id);
  revalidatePath("/gastos");
  revalidatePath("/");
  revalidatePath("/calendario");
}
