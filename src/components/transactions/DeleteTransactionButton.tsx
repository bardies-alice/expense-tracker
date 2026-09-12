"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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
    <button
      onClick={handleDelete}
      disabled={pending}
      title="Eliminar"
      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Eliminar</span>
    </button>
  );
}
