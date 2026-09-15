"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface ExpenseLineDraft {
  productName: string;
  quantity: number;
  totalPrice: number;
}

export function TransactionLinesEditor({
  lines,
  onChange,
}: {
  lines: ExpenseLineDraft[];
  onChange: (lines: ExpenseLineDraft[]) => void;
}) {
  const [draft, setDraft] = useState<ExpenseLineDraft>({ productName: "", quantity: 1, totalPrice: 0 });

  function addLine() {
    if (!draft.productName || draft.totalPrice <= 0) return;
    onChange([...lines, draft]);
    setDraft({ productName: "", quantity: 1, totalPrice: 0 });
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addLine();
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted">Líneas de producto (opcional)</p>
      {lines.map((line, i) => (
        <div key={i} className="flex min-w-0 items-center gap-2 text-sm">
          <span className="min-w-0 flex-1 truncate">{line.productName}</span>
          <span className="shrink-0 text-muted">x{line.quantity}</span>
          <span className="shrink-0">{line.totalPrice.toFixed(2)} €</span>
          <button type="button" onClick={() => removeLine(i)} className="flex h-9 w-9 shrink-0 items-center justify-center text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
      ))}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Producto"
            value={draft.productName}
            onChange={(e) => setDraft({ ...draft, productName: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex gap-2">
          <div className="w-1/2 shrink-0 sm:w-16">
            <Input
              type="number"
              placeholder="Cant."
              value={draft.quantity}
              onChange={(e) => setDraft({ ...draft, quantity: Number(e.target.value) })}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="w-1/2 shrink-0 sm:w-24">
            <Input
              type="number"
              step="0.01"
              placeholder="Precio"
              value={draft.totalPrice || ""}
              onChange={(e) => setDraft({ ...draft, totalPrice: Number(e.target.value) })}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button type="button" variant="secondary" onClick={addLine}>
            +
          </Button>
        </div>
      </div>
    </div>
  );
}
