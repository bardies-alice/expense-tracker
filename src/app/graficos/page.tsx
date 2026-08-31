import Link from "next/link";
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
import { PageHeading } from "@/components/ui/PageHeading";

const RANGE_OPTIONS = [3, 6, 12, 24] as const;
const DEFAULT_MONTHS = 12;

export default async function GraficosPage({
  searchParams,
}: {
  searchParams: Promise<{ months?: string }>;
}) {
  const { months: monthsParam } = await searchParams;
  const parsed = Number(monthsParam);
  const months = RANGE_OPTIONS.includes(parsed as (typeof RANGE_OPTIONS)[number]) ? parsed : DEFAULT_MONTHS;

  const [categoryBreakdown, merchantRanking, weekdayPattern, itemSpending] = await Promise.all([
    getCategoryBreakdown(months),
    getMerchantRanking(10, months),
    getWeekdayPattern(months),
    getItemSpending(10, months),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeading title="Gráficos" subtitle={`Últimos ${months} meses`} />
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {RANGE_OPTIONS.map((m) => (
            <Link
              key={m}
              href={`/graficos?months=${m}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                m === months ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {m}m
            </Link>
          ))}
        </div>
      </div>

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
