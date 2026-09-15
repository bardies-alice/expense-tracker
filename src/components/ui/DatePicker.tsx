"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

function parseValue(value: string) {
  if (!value) return undefined;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function DatePicker({
  name,
  value,
  defaultValue,
  onChange,
  required,
  className,
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(value ?? defaultValue ?? "");
  const selected = value !== undefined ? value : internal;
  const selectedDate = useMemo(() => parseValue(selected), [selected]);
  const [month, setMonth] = useState(() => selectedDate ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) setInternal(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { locale: es });
    const end = endOfWeek(endOfMonth(month), { locale: es });
    return eachDayOfInterval({ start, end });
  }, [month]);

  function selectDay(d: Date) {
    const iso = format(d, "yyyy-MM-dd");
    setInternal(iso);
    setOpen(false);
    onChange?.(iso);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setMonth(selectedDate ?? new Date());
          setOpen((o) => !o);
        }}
        className={clsx(
          "flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
          className
        )}
      >
        <span className={selectedDate ? "text-ink" : "text-muted"}>
          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Seleccionar fecha"}
        </span>
        <CalendarIcon size={16} className="shrink-0 text-muted" />
      </button>

      {name && <input type="hidden" name={name} value={selected} required={required} />}

      {open && (
        <div className="absolute z-20 mt-1.5 w-[280px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold capitalize text-ink">{format(month, "MMMM yyyy", { locale: es })}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setMonth((m) => subMonths(m, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:bg-surface"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                onClick={() => setMonth((m) => addMonths(m, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:bg-surface"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((wd) => (
              <span key={wd} className="text-center text-[10px] font-bold uppercase text-muted">
                {wd}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const inMonth = isSameMonth(d, month);
              const active = selectedDate ? isSameDay(d, selectedDate) : false;
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => selectDay(d)}
                  className={clsx(
                    "flex h-9 w-9 items-center justify-center rounded-md text-xs",
                    active ? "bg-ink font-semibold text-white" : isToday(d) ? "font-semibold text-accent" : "text-ink hover:bg-surface",
                    !inMonth && !active && "text-muted/60"
                  )}
                >
                  {format(d, "d")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
