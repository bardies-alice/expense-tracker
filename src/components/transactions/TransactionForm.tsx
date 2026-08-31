"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Category, Item, Subcategory } from "@prisma/client";
import { createTransactionAction, updateTransactionAction } from "@/lib/actions/transactions";
import { createRecurringRuleAction } from "@/lib/actions/recurring";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { TransactionLinesEditor, type ExpenseLineDraft } from "./TransactionLinesEditor";

type CategoryWithRelations = Category & { subcategories: Subcategory[]; items: Item[] };

export interface TransactionInitial {
  id?: string;
  type: "EXPENSE" | "INCOME";
  amount: number;
  date: string;
  notes?: string | null;
  categoryId: string;
  subcategoryId?: string | null;
  itemId?: string | null;
  lines?: ExpenseLineDraft[];
}

export function TransactionForm({
  categories,
  initial,
  defaultCategoryId,
  defaultItemId,
  onSuccess,
}: {
  categories: CategoryWithRelations[];
  initial?: TransactionInitial;
  defaultCategoryId?: string;
  defaultItemId?: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? "");
  const [lines, setLines] = useState<ExpenseLineDraft[]>(initial?.lines ?? []);
  const [amount, setAmount] = useState<string>(initial?.amount != null ? String(initial.amount) : "");
  const [repeat, setRepeat] = useState(false);
  const [frequency, setFrequency] = useState<"WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY");

  function handleLinesChange(next: ExpenseLineDraft[]) {
    setLines(next);
    if (next.length > 0) {
      const total = next.reduce((sum, l) => sum + l.totalPrice, 0);
      setAmount(String(Math.round(total * 100) / 100));
    }
  }

  const category = useMemo(() => categories.find((c) => c.id === categoryId), [categories, categoryId]);
  const [type, setType] = useState<"EXPENSE" | "INCOME">(initial?.type ?? (category?.slug === "salario" ? "INCOME" : "EXPENSE"));

  function handleCategoryChange(id: string) {
    setCategoryId(id);
    if (!initial) {
      const next = categories.find((c) => c.id === id);
      setType(next?.slug === "salario" ? "INCOME" : "EXPENSE");
    }
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    formData.set("lines", JSON.stringify(lines));
    try {
      if (initial?.id) {
        await updateTransactionAction(initial.id, formData);
      } else if (repeat) {
        formData.set("startDate", formData.get("date") as string);
        formData.set("frequency", frequency);
        await createRecurringRuleAction(formData);
      } else {
        await createTransactionAction(formData);
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/gastos");
      }
    } catch {
      setError("No se pudo guardar. Revisa los datos e inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="max-w-lg space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select name="type" value={type} onChange={(e) => setType(e.target.value as "EXPENSE" | "INCOME")}>
          <option value="EXPENSE">Gasto</option>
          <option value="INCOME">Ingreso</option>
        </Select>
        <Input name="amount" type="number" step="0.01" placeholder="Importe" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>

      <DatePicker name="date" defaultValue={initial?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)} required />

      <Select name="categoryId" value={categoryId} onChange={(e) => handleCategoryChange(e.target.value)}>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      {category && category.subcategories.length > 0 && (
        <Select name="subcategoryId" defaultValue={initial?.subcategoryId ?? ""}>
          <option value="">(sin subcategoría)</option>
          {category.subcategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      )}

      {category && category.items.length > 0 && (
        <Select name="itemId" defaultValue={initial?.itemId ?? defaultItemId ?? ""}>
          <option value="">(sin item asociado)</option>
          {category.items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </Select>
      )}

      <Input name="notes" placeholder="Notas (opcional)" defaultValue={initial?.notes ?? ""} />

      {!initial?.id && (
        <div className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
            Repetir automáticamente
          </label>
          {repeat && (
            <Select value={frequency} onChange={(e) => setFrequency(e.target.value as typeof frequency)} className="w-auto">
              <option value="WEEKLY">Semanal</option>
              <option value="MONTHLY">Mensual</option>
              <option value="YEARLY">Anual</option>
            </Select>
          )}
        </div>
      )}

      {!repeat && <TransactionLinesEditor lines={lines} onChange={handleLinesChange} />}

      {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Guardando..." : initial?.id ? "Guardar cambios" : repeat ? "Crear regla recurrente" : "Crear gasto"}
      </Button>
    </form>
  );
}
