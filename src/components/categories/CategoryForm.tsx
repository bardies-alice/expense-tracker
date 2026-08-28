"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { createCategoryAction } from "@/lib/actions/categories";
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

export function CategoryForm() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_NAMES[0]);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await createCategoryAction(formData);
      formRef.current?.reset();
      setColor(COLOR_OPTIONS[0]);
      setIcon(ICON_NAMES[0]);
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(message.includes("Unique constraint") ? "Ya existe una categoría con ese nombre." : "No se pudo crear la categoría.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nueva categoría</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nueva categoría">
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <Input name="name" placeholder="Nombre" required />
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
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creando..." : "Crear"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
