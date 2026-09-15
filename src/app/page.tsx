import Link from "next/link";
import { getCategoryMonthComparison, getMonthlySummary, getTopProducts, listTransactions } from "@/lib/core/transactionService";
import { budgetMonthKey } from "@/lib/core/salary";
import { listAllComponentsWithLatestEvent } from "@/lib/core/maintenanceService";
import { listCategoriesWithItems } from "@/lib/core/categoryService";
import { ensureMonthlySnapshots, getCurrentBalance, getMonthlyBalances } from "@/lib/core/balanceService";
import { computeComponentStatus } from "@/lib/maintenance/computeStatus";
import { BalanceHero } from "@/components/dashboard/BalanceHero";
import { IncomeVsExpenseChart } from "@/components/dashboard/IncomeVsExpenseChart";
import { BalanceTrendChart } from "@/components/dashboard/BalanceTrendChart";
import { MonthlyBalanceChart } from "@/components/dashboard/MonthlyBalanceChart";
import { SavingsChart } from "@/components/dashboard/SavingsChart";
import { CategoryComparisonList } from "@/components/dashboard/CategoryComparisonList";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { StatusBadge } from "@/components/ui/Badge";
import type { CarMetadata } from "@/types";

const MONTH_LABEL = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;

  const now = new Date();
  const reference =
    month && /^\d{4}-\d{2}$/.test(month) ? new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1) : now;
  const isFiltered = month && /^\d{4}-\d{2}$/.test(month);

  const monthStart = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const monthEnd = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59);

  await ensureMonthlySnapshots();

  // Widened a month back so late-month salary (attributed to the following budget month)
  // is captured even though its real transaction date falls in the prior calendar month.
  const salaryLookbackStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1);

  const [monthTransactions, monthlySummary, categoryComparison, topProducts, components, balance, monthlyBalances, categories] =
    await Promise.all([
      listTransactions({ from: salaryLookbackStart, to: monthEnd }),
      getMonthlySummary(6),
      getCategoryMonthComparison(reference),
      getTopProducts(8, "comida"),
      listAllComponentsWithLatestEvent(),
      getCurrentBalance(),
      getMonthlyBalances(),
      listCategoriesWithItems(),
    ]);

  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlyBalanceData = [
    ...monthlyBalances.map((m) => ({ month: m.month, balance: m.balance })),
    ...(balance ? [{ month: currentMonthKey, balance: balance.amount }] : []),
  ];

  const targetMonthKey = `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, "0")}`;

  // Salary is attributed to the month it's meant to cover, not the real day it lands (see
  // budgetMonthKey) — a payday on Aug 31 counts as September's income, not August's.
  const income = monthTransactions
    .filter((t) => t.type === "INCOME" && t.category.slug === "salario" && budgetMonthKey(t.date, t.category.slug) === targetMonthKey)
    .reduce((sum, t) => sum + t.amount, 0);
  // Card refunds land as type INCOME in the purchase's own category (e.g. Amazon -> Ocio), not
  // as real income — netting them out of "Gastos" and excluding them from "Ingresos" keeps both
  // cards showing actual money in/out rather than gross purchase + gross refund.
  const refunds = monthTransactions
    .filter((t) => t.type === "INCOME" && t.category.slug !== "salario" && t.date >= monthStart && t.date <= monthEnd)
    .reduce((sum, t) => sum + t.amount, 0);
  // Investment purchases move money out of checking (so they still count against saldo actual)
  // but they're not consumption — netting them out of "Gastos" keeps that card about spending.
  const expense = monthTransactions
    .filter((t) => t.type === "EXPENSE" && t.category.slug !== "inversiones" && t.date >= monthStart && t.date <= monthEnd)
    .reduce((sum, t) => sum + t.amount, 0) - refunds;

  const attentionNeeded = components
    .map((c) => {
      const lastEvent = c.events[0];
      const currentKm = (c.item.metadata as CarMetadata | null)?.currentKm;
      const status = computeComponentStatus({
        ruleType: c.ruleType,
        intervalKm: c.intervalKm,
        intervalDays: c.intervalDays,
        warningKm: c.warningKm,
        warningDays: c.warningDays,
        lastEventDate: lastEvent?.date,
        lastEventKm: lastEvent?.mileageKm,
        currentKm,
      });
      return { ...c, status };
    })
    .filter((c) => c.status === "warning" || c.status === "overdue")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <BalanceHero balance={balance} income={income} expense={expense} trend={monthlyBalanceData} />

      {attentionNeeded.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted">Necesitan atención</h2>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {attentionNeeded.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 px-4 py-2 text-sm">
                <Link href={`/items/${c.item.slug}`} className="min-w-0 truncate text-ink hover:text-accent">
                  {c.label} · {c.item.name}
                </Link>
                <StatusBadge status={c.status} className="shrink-0" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {isFiltered ? (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-display text-base font-semibold text-ink">
              {MONTH_LABEL.format(reference).replace(/^./, (c) => c.toUpperCase())}
            </span>
            <Link href={`/gastos?month=${month}`} className="inline-block py-2 text-accent hover:opacity-80">
              Ver transacciones →
            </Link>
            <Link href="/" className="inline-block py-2 text-muted hover:text-ink">
              Quitar filtro ✕
            </Link>
          </div>
        ) : (
          <span />
        )}
        <TransactionModal categories={categories} trigger="Nueva transacción" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium text-muted">Ingresos vs gastos (6 meses)</h2>
          <IncomeVsExpenseChart data={monthlySummary} />
        </section>
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium text-muted">Balance acumulado (6 meses)</h2>
          <BalanceTrendChart data={monthlySummary} />
        </section>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-muted">Ahorro por mes (6 meses)</h2>
        <SavingsChart data={monthlySummary} />
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-muted">Saldo por mes</h2>
        <MonthlyBalanceChart data={monthlyBalanceData} />
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-4 text-sm font-medium text-muted">Gasto por categoría vs mes anterior</h2>
        <CategoryComparisonList rows={categoryComparison} />
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium text-muted">Productos más comprados (comida)</h2>
        <TopProductsChart data={topProducts} />
      </section>
    </div>
  );
}
