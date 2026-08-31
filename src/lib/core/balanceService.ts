import { prisma } from "@/lib/prisma";

export async function getBalanceAnchor() {
  return prisma.balanceAnchor.findUnique({ where: { id: "singleton" } });
}

export async function setBalanceAnchor(amount: number, asOfDate: Date) {
  return prisma.balanceAnchor.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", amount, asOfDate },
    update: { amount, asOfDate },
  });
}

// Walks the anchor forward (targetDate after the anchor) or backward (targetDate before
// it, e.g. reconstructing a past month) by applying transactions between the two dates.
async function getBalanceAt(targetDate: Date) {
  const anchor = await getBalanceAnchor();
  if (!anchor) return null;

  if (targetDate >= anchor.asOfDate) {
    const movements = await prisma.transaction.findMany({
      where: { date: { gte: anchor.asOfDate, lte: targetDate } },
      select: { type: true, amount: true },
    });
    const delta = movements.reduce((sum, t) => sum + (t.type === "INCOME" ? t.amount : -t.amount), 0);
    return anchor.amount + delta;
  }

  const movements = await prisma.transaction.findMany({
    where: { date: { gt: targetDate, lte: anchor.asOfDate } },
    select: { type: true, amount: true },
  });
  const delta = movements.reduce((sum, t) => sum + (t.type === "INCOME" ? t.amount : -t.amount), 0);
  return anchor.amount - delta;
}

export async function getCurrentBalance() {
  const anchor = await getBalanceAnchor();
  if (!anchor) return null;

  const amount = await getBalanceAt(new Date());
  return { amount: amount!, asOfDate: anchor.asOfDate };
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const SNAPSHOT_LOOKBACK_MONTHS = 12;

// Called opportunistically on dashboard load (no cron in this app) — backfills a snapshot
// for every fully-completed month in the lookback window. getBalanceAt can walk the anchor
// both forward and backward in time, so months before the anchor's own date get reconstructed
// from transaction history too, not just months after it was set.
export async function ensureMonthlySnapshots() {
  const anchor = await getBalanceAnchor();
  if (!anchor) return;

  const existing = await prisma.monthlyBalance.findMany({ select: { month: true } });
  const done = new Set(existing.map((e) => e.month));

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lookbackStart = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - SNAPSHOT_LOOKBACK_MONTHS, 1);
  const anchorMonthStart = new Date(anchor.asOfDate.getFullYear(), anchor.asOfDate.getMonth(), 1);
  const cursor = new Date(Math.min(lookbackStart.getTime(), anchorMonthStart.getTime()));

  while (cursor < currentMonthStart) {
    const key = monthKey(cursor);
    if (!done.has(key)) {
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);
      const balance = await getBalanceAt(monthEnd);
      if (balance !== null) {
        await prisma.monthlyBalance.upsert({
          where: { month: key },
          create: { month: key, balance },
          update: { balance },
        });
      }
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }
}

export async function getMonthlyBalances() {
  return prisma.monthlyBalance.findMany({ orderBy: { month: "asc" } });
}
