"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { upsertImportMerchantRule } from "@/lib/core/importRuleService";

const importRowSchema = z.object({
  externalRef: z.string().min(1),
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z.number().positive(),
  date: z.coerce.date(),
  notes: z.string().optional(),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional(),
  rememberMatchText: z.string().optional(),
});

export async function importTransactionsAction(rows: z.infer<typeof importRowSchema>[]) {
  const parsed = rows.map((r) => importRowSchema.parse(r));

  const existing = await prisma.transaction.findMany({
    where: { externalRef: { in: parsed.map((r) => r.externalRef) } },
    select: { externalRef: true },
  });
  const existingRefs = new Set(existing.map((e) => e.externalRef));
  const toInsert = parsed.filter((r) => !existingRefs.has(r.externalRef));

  if (toInsert.length > 0) {
    await prisma.transaction.createMany({
      data: toInsert.map((r) => ({
        externalRef: r.externalRef,
        type: r.type,
        amount: r.amount,
        date: r.date,
        notes: r.notes,
        categoryId: r.categoryId,
        subcategoryId: r.subcategoryId,
        source: "IMPORT" as const,
      })),
    });
  }

  const toRemember = parsed.filter((r) => r.rememberMatchText);
  for (const r of toRemember) {
    await upsertImportMerchantRule(r.rememberMatchText!, r.categoryId, r.subcategoryId);
  }

  revalidatePath("/gastos");
  revalidatePath("/");

  return { imported: toInsert.length, skipped: parsed.length - toInsert.length, remembered: toRemember.length };
}
