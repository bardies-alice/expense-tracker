"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Category, Item, Subcategory } from "@prisma/client";
import { createTransactionAction, updateTransactionAction } from "@/lib/actions/transactions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
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
}: {
  categories: CategoryWithRelations[];
  initial?: TransactionInitial;
  defaultCategoryId?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? "");
  const [lines, setLines] = useState<ExpenseLineDraft[]>(initial?.lines ?? []);

  const category = useMemo(() => categories.find((c) => c.id === categoryId), [categories, categoryId]);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    formData.set("lines", JSON.stringify(lines));
    try {
      if (initial?.id) {
        await updateTransactionAction(initial.id, formData);
      } else {
        await createTransactionAction(formData);
      }
      router.push("/gastos");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="max-w-lg space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select name="type" defaultValue={initial?.type ?? "EXPENSE"}>
          <option value="EXPENSE">Gasto</option>
          <option value="INCOME">Ingreso</option>
        </Select>
        <Input name="amount" type="number" step="0.01" placeholder="Importe" defaultValue={initial?.amount} required />
      </div>

      <Input name="date" type="date" defaultValue={initial?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)} required />

      <Select name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
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
        <Select name="itemId" defaultValue={initial?.itemId ?? ""}>
          <option value="">(sin item asociado)</option>
          {category.items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </Select>
      )}

      <Input name="notes" placeholder="Notas (opcional)" defaultValue={initial?.notes ?? ""} />

      <TransactionLinesEditor lines={lines} onChange={setLines} />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Guardando..." : initial?.id ? "Guardar cambios" : "Crear gasto"}
      </Button>
    </form>
  );
}
