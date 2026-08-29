"use client";

import { useState } from "react";
import { deleteItemAction } from "@/lib/actions/items";

export function DeleteItemButton({ id, categoryId }: { id: string; categoryId: string }) {
  const [pending, setPending] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("¿Eliminar este item? También se borrarán sus componentes de mantenimiento.")) return;
    setPending(true);
    try {
      await deleteItemAction(id, categoryId);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="absolute right-2 top-2 rounded-full p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
      aria-label="Eliminar item"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}
