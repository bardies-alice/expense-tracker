"use client";

import { useRef, useState, type MouseEvent } from "react";
import clsx from "clsx";
import type { Category } from "@prisma/client";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/lib/actions/categories";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { CategoryIcon, ICON_NAMES } from "./CategoryIcon";

const COLOR_OPTIONS = [
  "#6366f1",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#64748b",
  "#78350f",
];

export function CategoryForm({ category }: { category?: Category }) {
  const isEdit = !!category;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState(category?.color ?? COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(category?.icon ?? ICON_NAMES[0]);
  const formRef = useRef<HTMLFormElement>(null);

  function openModal(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setColor(category?.color ?? COLOR_OPTIONS[0]);
    setIcon(category?.icon ?? ICON_NAMES[0]);
    setError(null);
    setOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      if (isEdit) {
        await updateCategoryAction(category.id, formData);
      } else {
        await createCategoryAction(formData);
        formRef.current?.reset();
      }
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        message.includes("Unique constraint")
          ? "Ya existe una categoría con ese nombre."
          : isEdit
            ? "No se pudo actualizar la categoría."
            : "No se pudo crear la categoría."
      );
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!category) return;
    if (!confirm(`¿Eliminar la categoría "${category.name}"? Se perderán sus subcategorías.`)) return;
    setPending(true);
    setError(null);
    try {
      await deleteCategoryAction(category.id);
      setOpen(false);
    } catch {
      setError("No se pudo eliminar la categoría.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {isEdit ? (
        <button
          type="button"
          onClick={openModal}
          aria-label="Editar categoría"
          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      ) : (
        <Button onClick={() => openModal()}>Nueva categoría</Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={isEdit ? "Editar categoría" : "Nueva categoría"}>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <Input name="name" placeholder="Nombre" defaultValue={category?.name} required />
          <input type="hidden" name="color" value={color} />
          <input type="hidden" name="icon" value={icon} />

          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500">Color</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className={clsx(
                    "h-7 w-7 rounded-full ring-offset-2 transition",
                    color === c ? "ring-2 ring-gray-900" : "ring-1 ring-gray-200"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500">Icono</p>
            <div className="grid grid-cols-7 gap-2">
              {ICON_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setIcon(name)}
                  aria-label={name}
                  className={clsx(
                    "flex h-9 w-9 items-center justify-center rounded-md border transition",
                    icon === name ? "border-gray-900 bg-gray-100" : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <CategoryIcon name={name} className="h-4.5 w-4.5 text-gray-700" />
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? (isEdit ? "Guardando..." : "Creando...") : isEdit ? "Guardar" : "Crear"}
            </Button>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Eliminar
              </button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}
