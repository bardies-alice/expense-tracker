"use client";

import { useState } from "react";
import { updateItemKmAction } from "@/lib/actions/items";
import { Button } from "@/components/ui/Button";
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
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input type="number" value={km} onChange={(e) => setKm(Number(e.target.value))} className="w-32" />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "..." : "Actualizar km"}
      </Button>
    </form>
  );
}
