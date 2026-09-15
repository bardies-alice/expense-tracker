"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { setBalanceAnchorAction } from "@/lib/actions/balance";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { formatDate, formatEUR } from "@/lib/format";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export interface BalanceHeroProps {
  balance: { amount: number; asOfDate: Date } | null;
  income: number;
  expense: number;
  trend: { month: string; balance: number }[];
}

export function BalanceHero({ balance, income, expense, trend }: BalanceHeroProps) {
  const [current, setCurrent] = useState(balance);
  const [editing, setEditing] = useState(!balance);
  const [amount, setAmount] = useState(balance?.amount ?? 0);
  const [date, setDate] = useState(balance ? balance.asOfDate.toISOString().slice(0, 10) : todayInputValue());
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setCurrent(balance);
  }, [balance]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("amount", String(amount));
      formData.set("asOfDate", date);
      await setBalanceAnchorAction(formData);
      setCurrent({ amount, asOfDate: new Date(date) });
      setEditing(false);
    } finally {
      setPending(false);
    }
  }

  const net = income - expense;
  const previous = trend.length > 1 ? trend[trend.length - 2].balance : null;
  const delta = current && previous !== null ? current.amount - previous : null;

  return (
    <div className="-mx-4 -mt-4 bg-ink px-4 pb-6 pt-5 text-white sm:-mx-6 sm:-mt-6 sm:rounded-b-lg sm:px-8 sm:pt-6">
      <div className="flex items-center justify-between text-xs font-medium text-white/60">
        <span>Resumen · {formatDate(new Date())}</span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-md px-2 py-1 font-semibold text-white/80 hover:bg-white/10 hover:text-white"
          >
            Editar saldo
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-2.5">
          <div className="w-full sm:w-32">
            <label className="mb-1 block text-[11px] text-white/60">Importe</label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>
          <div className="w-full sm:w-36">
            <label className="mb-1 block text-[11px] text-white/60">A fecha de</label>
            <DatePicker value={date} onChange={setDate} />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "..." : "Guardar"}
          </button>
          {current && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="h-10 rounded-lg bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/20"
            >
              Cancelar
            </button>
          )}
        </form>
      ) : (
        <>
          <p className="mt-2 font-display text-4xl font-semibold tabular-nums tracking-tight">{formatEUR(current!.amount)}</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs text-white/60">a {formatDate(current!.asOfDate)}</span>
            {delta !== null && (
              <span className={`text-xs font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {delta >= 0 ? "+" : ""}
                {formatEUR(delta)} este mes
              </span>
            )}
          </div>

          {trend.length > 1 && (
            <div className="mt-3 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
                  <defs>
                    <linearGradient id="heroTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5b8cff" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#5b8cff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="balance" stroke="#5b8cff" strokeWidth={2} fill="url(#heroTrend)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
            <div>
              <p className="text-[11px] font-medium text-white/60">Ingresos</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-400">{formatEUR(income)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-white/60">Gastos</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-red-400">{formatEUR(expense)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-white/60">Ahorro</p>
              <p className={`mt-0.5 text-sm font-semibold tabular-nums ${net >= 0 ? "text-white" : "text-red-400"}`}>
                {formatEUR(net)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
