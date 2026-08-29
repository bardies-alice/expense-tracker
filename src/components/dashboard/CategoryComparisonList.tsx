"use client";

import { useState } from "react";
import { formatDate, formatEUR } from "@/lib/format";

export interface CategoryComparisonRow {
  categoryId: string;
  name: string;
  color: string;
  thisMonth: number;
  lastMonth: number;
  delta: number;
  topExpenses: { notes: string | null; amount: number; date: Date }[];
}

export function CategoryComparisonList({ rows }: { rows: CategoryComparisonRow[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (rows.length === 0) {
    return <p className="text-sm text-gray-400">Sin gastos todavía este mes o el anterior.</p>;
  }

  const max = Math.max(...rows.map((r) => r.thisMonth), 1);

  function toggle(categoryId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  return (
    <div className="space-y-1">
      {rows.map((r) => {
        const isOpen = expanded.has(r.categoryId);
        return (
          <div key={r.categoryId}>
            <button
              onClick={() => toggle(r.categoryId)}
              disabled={r.topExpenses.length === 0}
              className="flex w-full items-center gap-3 rounded-md py-2 text-left hover:bg-gray-50 disabled:hover:bg-transparent"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""} ${r.topExpenses.length === 0 ? "invisible" : ""}`}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
              <span className="w-24 shrink-0 truncate text-sm text-gray-700">{r.name}</span>
              <div className="h-2 flex-1 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${(r.thisMonth / max) * 100}%`, background: r.color }}
                />
              </div>
              <span className="w-20 shrink-0 text-right text-sm font-medium text-gray-900">{formatEUR(r.thisMonth)}</span>
              <span
                className={`w-28 shrink-0 text-right text-xs font-medium ${
                  r.delta > 0 ? "text-red-600" : r.delta < 0 ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {r.delta === 0 ? "sin cambio" : `${r.delta > 0 ? "+" : ""}${formatEUR(r.delta)} vs mes ant.`}
              </span>
            </button>

            {isOpen && (
              <ul className="ml-9 mb-2 space-y-1 border-l border-gray-100 pl-4">
                {r.topExpenses.map((e, i) => (
                  <li key={i} className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {e.notes ?? "(sin notas)"} · {formatDate(e.date)}
                    </span>
                    <span className="font-medium text-gray-700">{formatEUR(e.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
