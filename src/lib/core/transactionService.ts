import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { transactionSchema, transactionUpdateSchema } from "@/lib/validation/schemas";

export interface TransactionFilters {
  categoryId?: string;
  itemId?: string;
  type?: "EXPENSE" | "INCOME";
  notes?: string;
  from?: Date;
  to?: Date;
}

export function listTransactions(filters: TransactionFilters = {}) {
  return prisma.transaction.findMany({
    where: {
      categoryId: filters.categoryId,
      itemId: filters.itemId,
      type: filters.type,
      notes: filters.notes,
      date: {
        gte: filters.from,
        lte: filters.to,
      },
    },
    include: { category: true, subcategory: true, item: true, lines: true },
    orderBy: { date: "desc" },
  });
}

export function getTransactionById(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
    include: { lines: true },
  });
}

export function createTransaction(input: z.infer<typeof transactionSchema>) {
  const { lines, ...data } = input;
  return prisma.transaction.create({
    data: {
      ...data,
      lines: lines?.length ? { create: lines } : undefined,
    },
    include: { lines: true },
  });
}

export function updateTransaction(id: string, input: z.infer<typeof transactionUpdateSchema>) {
  const { lines, ...data } = input;
  return prisma.$transaction(async (tx) => {
    if (lines) {
      await tx.expenseLine.deleteMany({ where: { transactionId: id } });
    }
    return tx.transaction.update({
      where: { id },
      data: {
        ...data,
        lines: lines?.length ? { create: lines } : undefined,
      },
      include: { lines: true },
    });
  });
}

export function deleteTransaction(id: string) {
  return prisma.transaction.delete({ where: { id } });
}

export async function getMonthlySummary(monthsBack = 6) {
  const since = new Date();
  since.setMonth(since.getMonth() - monthsBack);
  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: since } },
    select: { type: true, amount: true, date: true },
  });

  const byMonth = new Map<string, { income: number; expense: number }>();
  for (const t of transactions) {
    const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
    const entry = byMonth.get(key) ?? { income: 0, expense: 0 };
    if (t.type === "INCOME") entry.income += t.amount;
    else entry.expense += t.amount;
    byMonth.set(key, entry);
  }
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, totals]) => ({ month, ...totals }));
}

export async function getCategoryMonthComparison(reference = new Date()) {
  const thisMonthStart = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const lastMonthStart = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
  const nextMonthStart = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);

  // Card refunds land as type INCOME in the purchase's own category (e.g. Amazon -> Ocio),
  // not as a real income like salary. Netting any non-Salario income against that category's
  // expenses is a cheap heuristic that works because no other income source lands in a
  // spend category, without needing an explicit "is this a refund" flag on Transaction.
  const transactions = await prisma.transaction.findMany({
    where: {
      type: { in: ["EXPENSE", "INCOME"] },
      date: { gte: lastMonthStart, lt: nextMonthStart },
      category: { slug: { not: "salario" } },
    },
    select: { amount: true, date: true, notes: true, type: true, categoryId: true, category: { select: { name: true, color: true } } },
    orderBy: { amount: "desc" },
  });

  interface Row {
    name: string;
    color: string;
    thisMonth: number;
    lastMonth: number;
    thisMonthExpenses: { notes: string | null; amount: number; date: Date }[];
    thisMonthRefundAmounts: number[];
  }
  const rows = new Map<string, Row>();
  for (const t of transactions) {
    const entry =
      rows.get(t.categoryId) ??
      { name: t.category.name, color: t.category.color ?? "#6366f1", thisMonth: 0, lastMonth: 0, thisMonthExpenses: [], thisMonthRefundAmounts: [] };
    const signed = t.type === "EXPENSE" ? t.amount : -t.amount;
    if (t.date >= thisMonthStart) {
      entry.thisMonth += signed;
      if (t.type === "EXPENSE") entry.thisMonthExpenses.push({ notes: t.notes, amount: t.amount, date: t.date });
      else entry.thisMonthRefundAmounts.push(t.amount);
    } else {
      entry.lastMonth += signed;
    }
    rows.set(t.categoryId, entry);
  }

  // Drop expenses that were fully refunded (matching amount, same category/month) from the
  // "top expenses" spotlight — the category total above already nets them out.
  for (const entry of rows.values()) {
    const remainingRefunds = [...entry.thisMonthRefundAmounts];
    entry.thisMonthExpenses = entry.thisMonthExpenses.filter((e) => {
      const i = remainingRefunds.indexOf(e.amount);
      if (i === -1) return true;
      remainingRefunds.splice(i, 1);
      return false;
    });
  }

  return Array.from(rows.entries())
    .map(([categoryId, r]) => ({
      categoryId,
      name: r.name,
      color: r.color,
      thisMonth: r.thisMonth,
      lastMonth: r.lastMonth,
      delta: r.thisMonth - r.lastMonth,
      topExpenses: r.thisMonthExpenses.slice(0, 5),
    }))
    .filter((r) => r.thisMonth > 0 || r.lastMonth > 0)
    .sort((a, b) => b.thisMonth - a.thisMonth);
}

export async function getTopProducts(limit = 10, categorySlug?: string) {
  const lines = await prisma.expenseLine.findMany({
    where: categorySlug
      ? { transaction: { category: { slug: categorySlug } } }
      : undefined,
    select: { productName: true, quantity: true, totalPrice: true },
  });

  const byProduct = new Map<string, { count: number; total: number }>();
  for (const l of lines) {
    const entry = byProduct.get(l.productName) ?? { count: 0, total: 0 };
    entry.count += l.quantity;
    entry.total += l.totalPrice;
    byProduct.set(l.productName, entry);
  }
  return Array.from(byProduct.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, limit)
    .map(([productName, stats]) => ({ productName, ...stats }));
}
