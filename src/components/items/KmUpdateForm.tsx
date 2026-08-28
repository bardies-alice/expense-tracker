"use client";

import { useState } from "react";
import { updateItemKmAction } from "@/lib/actions/items";
import { Input } from "@/components/ui/Input";

export function KmUpdateForm({ itemId, categoryId, currentKm }: { itemId: string; categoryId: string; currentKm: number }) {
  const [km, setKm] = useState(currentKm);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await updateItemKmAction(itemId, categoryId, km);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
      <label className="text-xs font-medium uppercase tracking-wide text-gray-400">Kilometraje</label>
      <div className="w-32">
        <Input type="number" value={km} onChange={(e) => setKm(Number(e.target.value))} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-lg border-none bg-gray-100 px-5 text-sm font-medium text-gray-800 hover:bg-gray-200 disabled:opacity-50"
      >
        {pending ? "..." : "Actualizar"}
      </button>
    </form>
  );
}
