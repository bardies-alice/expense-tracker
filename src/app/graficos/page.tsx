import {
  getCategoryBreakdown,
  getItemSpending,
  getMerchantRanking,
  getWeekdayPattern,
} from "@/lib/core/transactionService";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { MerchantRankingChart } from "@/components/charts/MerchantRankingChart";
import { WeekdayPatternChart } from "@/components/charts/WeekdayPatternChart";
import { ItemSpendingChart } from "@/components/charts/ItemSpendingChart";

export default async function GraficosPage() {
  const [categoryBreakdown, merchantRanking, weekdayPattern, itemSpending] = await Promise.all([
    getCategoryBreakdown(12),
    getMerchantRanking(10, 12),
    getWeekdayPattern(12),
    getItemSpending(10, 12),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-gray-900">Gráficos</h1>
      <p className="-mt-4 text-sm text-gray-400">Últimos 12 meses</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-500">Gasto por categoría</h2>
          <CategoryPieChart data={categoryBreakdown} />
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-500">Top comercios</h2>
          <MerchantRankingChart data={merchantRanking} />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-500">Gasto por día de la semana</h2>
          <WeekdayPatternChart data={weekdayPattern} />
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-500">Gasto por elemento (coche, casa...)</h2>
          <ItemSpendingChart data={itemSpending} />
        </section>
      </div>
    </div>
  );
}
