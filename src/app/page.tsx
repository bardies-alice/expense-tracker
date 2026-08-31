import Link from "next/link";
import { getCategoryMonthComparison, getMonthlySummary, getTopProducts, listTransactions } from "@/lib/core/transactionService";
import { listAllComponentsWithLatestEvent } from "@/lib/core/maintenanceService";
import { ensureMonthlySnapshots, getCurrentBalance, getMonthlyBalances } from "@/lib/core/balanceService";
import { computeComponentStatus } from "@/lib/maintenance/computeStatus";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { IncomeVsExpenseChart } from "@/components/dashboard/IncomeVsExpenseChart";
import { BalanceTrendChart } from "@/components/dashboard/BalanceTrendChart";
import { MonthlyBalanceChart } from "@/components/dashboard/MonthlyBalanceChart";
import { CategoryComparisonList } from "@/components/dashboard/CategoryComparisonList";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
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

  const [monthTransactions, monthlySummary, categoryComparison, topProducts, components, balance, monthlyBalances] =
    await Promise.all([
      listTransactions({ from: monthStart, to: monthEnd }),
      getMonthlySummary(6),
      getCategoryMonthComparison(reference),
      getTopProducts(8, "comida"),
      listAllComponentsWithLatestEvent(),
      getCurrentBalance(),
      getMonthlyBalances(),
    ]);

  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlyBalanceData = [
    ...monthlyBalances.map((m) => ({ month: m.month, balance: m.balance })),
    ...(balance ? [{ month: currentMonthKey, balance: balance.amount }] : []),
  ];

  // Card refunds land as type INCOME in the purchase's own category (e.g. Amazon -> Ocio), not
  // as real income — netting them out of "Gastos" and excluding them from "Ingresos" keeps both
  // cards showing actual money in/out rather than gross purchase + gross refund.
  const income = monthTransactions
    .filter((t) => t.type === "INCOME" && t.category.slug === "salario")
    .reduce((sum, t) => sum + t.amount, 0);
  const refunds = monthTransactions
    .filter((t) => t.type === "INCOME" && t.category.slug !== "salario")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = monthTransactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0) - refunds;

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Resumen
          {isFiltered && (
            <span className="ml-2 font-normal text-gray-400">
              — {MONTH_LABEL.format(reference).replace(/^./, (c) => c.toUpperCase())}
            </span>
          )}
        </h1>
        {isFiltered && (
          <div className="flex items-center gap-3 text-sm">
            <Link href={`/gastos?month=${month}`} className="text-indigo-600 hover:text-indigo-800">
              Ver transacciones →
            </Link>
            <Link href="/" className="text-gray-400 hover:text-gray-600">
              Quitar filtro ✕
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BalanceCard balance={balance} />
        <SummaryCards income={income} expense={expense} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-500">Ingresos vs gastos (6 meses)</h2>
          <IncomeVsExpenseChart data={monthlySummary} />
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-500">Balance acumulado (6 meses)</h2>
          <BalanceTrendChart data={monthlySummary} />
        </section>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-medium text-gray-500">Saldo por mes</h2>
        <MonthlyBalanceChart data={monthlyBalanceData} />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-medium text-gray-500">Gasto por categoría vs mes anterior</h2>
        <CategoryComparisonList rows={categoryComparison} />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-medium text-gray-500">Productos más comprados (comida)</h2>
        <TopProductsChart data={topProducts} />
      </section>

      {attentionNeeded.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-gray-500">Necesitan atención</h2>
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
            {attentionNeeded.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <Link href={`/items/${c.item.slug}`} className="text-gray-800 hover:text-indigo-600">
                  {c.label} · {c.item.name}
                </Link>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
