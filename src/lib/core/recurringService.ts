import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { recurringRuleSchema } from "@/lib/validation/schemas";

const MAX_CATCHUP_RUNS = 60;

function advance(date: Date, frequency: "WEEKLY" | "MONTHLY" | "YEARLY") {
  const next = new Date(date);
  if (frequency === "WEEKLY") next.setDate(next.getDate() + 7);
  else if (frequency === "MONTHLY") next.setMonth(next.getMonth() + 1);
  else next.setFullYear(next.getFullYear() + 1);
  return next;
}

export function listRecurringRules(categoryId?: string) {
  return prisma.recurringRule.findMany({
    where: { categoryId },
    orderBy: { nextRunDate: "asc" },
  });
}

export function createRecurringRule(input: z.infer<typeof recurringRuleSchema>) {
  return prisma.recurringRule.create({
    data: { ...input, nextRunDate: input.startDate },
  });
}

export function deleteRecurringRule(id: string) {
  return prisma.recurringRule.delete({ where: { id } });
}

export function setRecurringRuleActive(id: string, active: boolean) {
  return prisma.recurringRule.update({ where: { id }, data: { active } });
}

export async function runDueRecurringRules(now = new Date()) {
  const dueRules = await prisma.recurringRule.findMany({
    where: { active: true, nextRunDate: { lte: now } },
  });

  for (const rule of dueRules) {
    let runDate = rule.nextRunDate;
    let runs = 0;
    while (runDate <= now && runs < MAX_CATCHUP_RUNS) {
      await prisma.transaction.create({
        data: {
          type: rule.type,
          amount: rule.amount,
          date: runDate,
          notes: rule.notes,
          categoryId: rule.categoryId,
          subcategoryId: rule.subcategoryId,
          itemId: rule.itemId,
          recurringRuleId: rule.id,
        },
      });
      runDate = advance(runDate, rule.frequency);
      runs++;
    }
    await prisma.recurringRule.update({ where: { id: rule.id }, data: { nextRunDate: runDate } });
  }
}
