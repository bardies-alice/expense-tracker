import Link from "next/link";
import { getCategoryMonthComparison, getMonthlySummary, getTopProducts, listTransactions } from "@/lib/core/transactionService";
import { listAllComponentsWithLatestEvent } from "@/lib/core/maintenanceService";
import { computeComponentStatus } from "@/lib/maintenance/computeStatus";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { IncomeVsExpenseChart } from "@/components/dashboard/IncomeVsExpenseChart";
import { BalanceTrendChart } from "@/components/dashboard/BalanceTrendChart";
import { CategoryComparisonList } from "@/components/dashboard/CategoryComparisonList";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { StatusBadge } from "@/components/ui/Badge";
import type { CarMetadata } from "@/types";

export default async function DashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthTransactions, monthlySummary, categoryComparison, topProducts, components] = await Promise.all([
    listTransactions({ from: monthStart }),
    getMonthlySummary(6),
    getCategoryMonthComparison(),
    getTopProducts(8, "comida"),
    listAllComponentsWithLatestEvent(),
  ]);

  const income = monthTransactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
  const expense = monthTransactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);

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
      <h1 className="text-xl font-semibold text-gray-900">Resumen</h1>

      <SummaryCards income={income} expense={expense} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-500">Ingresos vs gastos (6 meses)</h2>
          <IncomeVsExpenseChart data={monthlySummary} />
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-500">Balance acumulado (6 meses)</h2>
          <BalanceTrendChart data={monthlySummary} />
        </section>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-medium text-gray-500">Gasto por categoría vs mes anterior</h2>
        <CategoryComparisonList rows={categoryComparison} />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-medium text-gray-500">Productos más comprados (comida)</h2>
        <TopProductsChart data={topProducts} />
      </section>

      {attentionNeeded.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-gray-500">Necesitan atención</h2>
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
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
