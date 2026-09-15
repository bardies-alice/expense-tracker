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
      <h2 className="mb-3 text-sm font-medium text-muted">Recurrentes</h2>
      <ul className="space-y-2">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <span className={`truncate ${rule.active ? "text-ink" : "text-muted line-through"}`}>
                {rule.type === "INCOME" ? "+" : "-"}
                {formatEUR(rule.amount)} · {FREQUENCY_LABEL[rule.frequency]}
              </span>
              <span className="ml-2 text-xs text-muted">Próxima: {formatDate(rule.nextRunDate)}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => handleToggle(rule.id, rule.active)}
                className="rounded-md px-2 py-2 text-xs text-accent"
              >
                {rule.active ? "Pausar" : "Reanudar"}
              </button>
              <button
                onClick={() => handleDelete(rule.id)}
                className="flex h-9 w-9 items-center justify-center text-muted hover:text-ink"
                aria-label="Eliminar regla"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
