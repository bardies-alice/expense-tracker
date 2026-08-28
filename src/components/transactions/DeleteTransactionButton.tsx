"use client";

import { useState } from "react";
import { deleteTransactionAction } from "@/lib/actions/transactions";

export function DeleteTransactionButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar esta transacción?")) return;
    setPending(true);
    try {
      await deleteTransactionAction(id);
    } finally {
      setPending(false);
    }
  }

  return (
    <button onClick={handleDelete} disabled={pending} className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
      Eliminar
    </button>
  );
}
