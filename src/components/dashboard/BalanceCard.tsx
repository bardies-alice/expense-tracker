"use client";

import { useEffect, useState } from "react";
import { setBalanceAnchorAction } from "@/lib/actions/balance";
import { Input } from "@/components/ui/Input";
import { formatEUR } from "@/lib/format";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function BalanceCard({ balance }: { balance: { amount: number; asOfDate: Date } | null }) {
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

  if (editing) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-2 text-xs font-medium text-gray-500">Saldo actual</p>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2.5">
          <div className="w-32">
            <label className="mb-1 block text-[11px] text-gray-400">Importe</label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>
          <div className="w-36">
            <label className="mb-1 block text-[11px] text-gray-400">A fecha de</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-lg border-none bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? "..." : "Guardar"}
          </button>
          {current && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="h-10 rounded-lg border-none bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              Cancelar
            </button>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">Saldo actual</p>
        <button onClick={() => setEditing(true)} className="text-xs text-indigo-600 hover:text-indigo-800">
          Editar
        </button>
      </div>
      <p className={`mt-1 text-2xl font-semibold ${current!.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
        {formatEUR(current!.amount)}
      </p>
    </div>
  );
}
