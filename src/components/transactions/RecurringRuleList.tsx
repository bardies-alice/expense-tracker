"use client";

import { useRouter } from "next/navigation";
import type { RecurringRule } from "@prisma/client";
import { deleteRecurringRuleAction, setRecurringRuleActiveAction } from "@/lib/actions/recurring";
import { formatDate, formatEUR } from "@/lib/format";

const FREQUENCY_LABEL: Record<string, string> = { WEEKLY: "Semanal", MONTHLY: "Mensual", YEARLY: "Anual" };

export function RecurringRuleList({ rules, categoryId }: { rules: RecurringRule[]; categoryId: string }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    await deleteRecurringRuleAction(id, categoryId);
    router.refresh();
  }

  async function handleToggle(id: string, active: boolean) {
    await setRecurringRuleActiveAction(id, categoryId, !active);
    router.refresh();
  }

  if (rules.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-gray-500">Recurrentes</h2>
      <ul className="space-y-2">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm"
          >
            <div>
              <span className={rule.active ? "text-gray-900" : "text-gray-400 line-through"}>
                {rule.type === "INCOME" ? "+" : "-"}
                {formatEUR(rule.amount)} · {FREQUENCY_LABEL[rule.frequency]}
              </span>
              <span className="ml-2 text-xs text-gray-400">Próxima: {formatDate(rule.nextRunDate)}</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleToggle(rule.id, rule.active)} className="text-xs text-indigo-600 hover:text-indigo-800">
                {rule.active ? "Pausar" : "Reanudar"}
              </button>
              <button onClick={() => handleDelete(rule.id)} className="text-gray-300 hover:text-gray-500" aria-label="Eliminar regla">
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
