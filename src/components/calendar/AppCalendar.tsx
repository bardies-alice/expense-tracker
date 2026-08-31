"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarEvent } from "@/lib/calendar/buildCalendarEvents";
import { formatEUR } from "@/lib/format";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

const KIND_DOT: Record<CalendarEvent["kind"], string> = {
  expense: "bg-red-400",
  income: "bg-emerald-500",
  maintenance: "bg-amber-400",
};

const KIND_TEXT_COLOR: Record<CalendarEvent["kind"], string> = {
  expense: "text-gray-700",
  income: "text-emerald-700",
  maintenance: "text-amber-700",
};

function dayKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function dayExpenseTotal(dayEvents: CalendarEvent[]) {
  let total = 0;
  for (const e of dayEvents) {
    if (e.kind !== "expense") continue;
    const match = e.title.match(/^-([\d.,]+)€/);
    if (match) total += parseFloat(match[1].replace(",", "."));
  }
  return total;
}

function dayNetTotal(dayEvents: CalendarEvent[]) {
  let total = 0;
  for (const e of dayEvents) {
    const match = e.title.match(/^([+-])([\d.,]+)€/);
    if (!match) continue;
    const amount = parseFloat(match[2].replace(",", "."));
    total += match[1] === "-" ? -amount : amount;
  }
  return total;
}

function heatBg(ratio: number) {
  if (ratio <= 0) return undefined;
  const steps = [
    { max: 0.15, bg: "#fef2f2" },
    { max: 0.35, bg: "#fecaca" },
    { max: 0.6, bg: "#fca5a5" },
    { max: 0.85, bg: "#f87171" },
    { max: 1.01, bg: "#ef4444" },
  ];
  return steps.find((s) => ratio <= s.max)!.bg;
}

export function AppCalendar({ events }: { events: CalendarEvent[] }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const key = dayKey(e.start);
      const list = map.get(key);
      if (list) list.push(e);
      else map.set(key, [e]);
    }
    return map;
  }, [events]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { locale: es });
    const end = endOfWeek(endOfMonth(month), { locale: es });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const maxDayExpense = useMemo(() => {
    let max = 0;
    for (const d of days) {
      const total = dayExpenseTotal(eventsByDay.get(dayKey(d)) ?? []);
      if (total > max) max = total;
    }
    return max;
  }, [days, eventsByDay]);

  const selectedDayEvents = eventsByDay.get(dayKey(selectedDay)) ?? [];
  const selectedDayNet = dayNetTotal(selectedDayEvents);

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold capitalize text-gray-800">{format(month, "MMMM yyyy", { locale: es })}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setMonth((m) => subMonths(m, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-2">
          {WEEKDAYS.map((wd) => (
            <span key={wd} className="text-center text-[11px] font-bold uppercase text-gray-400">
              {wd}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => {
            const key = dayKey(d);
            const dayEvents = eventsByDay.get(key) ?? [];
            const kinds = Array.from(new Set(dayEvents.map((e) => e.kind)));
            const inMonth = isSameMonth(d, month);
            const selected = isSameDay(d, selectedDay);
            const expenseTotal = dayExpenseTotal(dayEvents);
            const ratio = maxDayExpense > 0 ? expenseTotal / maxDayExpense : 0;
            const heat = !selected ? heatBg(ratio) : undefined;
            const darkHeat = ratio > 0.6;
            return (
              <button
                key={key}
                onClick={() => setSelectedDay(d)}
                style={heat ? { backgroundColor: heat } : undefined}
                title={expenseTotal > 0 ? `${expenseTotal.toFixed(2)}€ gastados` : undefined}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-[10px] border p-1 ${
                  selected
                    ? "border-indigo-600 bg-indigo-50"
                    : heat
                      ? "border-red-200"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                } ${!inMonth ? "opacity-40" : ""}`}
              >
                <span
                  className={`text-[13px] ${
                    selected
                      ? "font-bold text-indigo-700"
                      : darkHeat && heat
                        ? "font-bold text-white"
                        : isToday(d)
                          ? "font-bold text-gray-900"
                          : "font-medium text-gray-700"
                  }`}
                >
                  {format(d, "d")}
                </span>
                <span className="flex gap-0.5">
                  {kinds.map((k) => (
                    <span
                      key={k}
                      className={`h-[5px] w-[5px] rounded-full ${darkHeat && heat && k === "expense" ? "bg-white" : KIND_DOT[k]}`}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="m-0 text-[13.5px] font-semibold capitalize text-gray-700">
            {format(selectedDay, "d 'de' MMMM", { locale: es })}
          </h3>
          {selectedDayEvents.length > 0 && (
            <span className={`text-xs font-bold ${selectedDayNet >= 0 ? "text-emerald-700" : "text-red-600"}`}>
              {formatEUR(selectedDayNet)}
            </span>
          )}
        </div>
        {selectedDayEvents.length === 0 ? (
          <p className="m-0 text-xs text-gray-400">Sin movimientos ese día.</p>
        ) : (
          selectedDayEvents.map((e) => (
            <div key={e.id} className="flex items-center gap-2 border-b border-gray-100 py-2 last:border-0">
              <span className={`h-[6px] w-[6px] shrink-0 rounded-full ${KIND_DOT[e.kind]}`} />
              <span className={`text-xs font-medium ${KIND_TEXT_COLOR[e.kind]}`}>{e.title}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
