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
      <p className="text-xs font-medium text-gray-500">Líneas de producto (opcional)</p>
      {lines.map((line, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="flex-1">{line.productName}</span>
          <span className="text-gray-400">x{line.quantity}</span>
          <span>{line.totalPrice.toFixed(2)} €</span>
          <button type="button" onClick={() => removeLine(i)} className="text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Producto"
            value={draft.productName}
            onChange={(e) => setDraft({ ...draft, productName: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="w-16 shrink-0">
          <Input
            type="number"
            placeholder="Cant."
            value={draft.quantity}
            onChange={(e) => setDraft({ ...draft, quantity: Number(e.target.value) })}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="w-24 shrink-0">
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
  );
}
