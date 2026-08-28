"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category, Item, Subcategory } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TransactionForm, type TransactionInitial } from "./TransactionForm";

type CategoryWithRelations = Category & { subcategories: Subcategory[]; items: Item[] };

export function TransactionModal({
  categories,
  initial,
  defaultCategoryId,
  defaultItemId,
  trigger = "Nuevo gasto",
  variant = "primary",
}: {
  categories: CategoryWithRelations[];
  initial?: TransactionInitial;
  defaultCategoryId?: string;
  defaultItemId?: string;
  trigger?: string;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      {variant === "secondary" ? (
        <button onClick={() => setOpen(true)} className="text-xs text-indigo-600 hover:text-indigo-800">
          {trigger}
        </button>
      ) : (
        <Button onClick={() => setOpen(true)}>{trigger}</Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={initial?.id ? "Editar transacción" : "Nuevo gasto / ingreso"}>
        <TransactionForm
          categories={categories}
          initial={initial}
          defaultCategoryId={defaultCategoryId}
          defaultItemId={defaultItemId}
          onSuccess={handleSuccess}
        />
      </Modal>
    </>
  );
}
