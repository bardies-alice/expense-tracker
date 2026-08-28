"use client";

import { useRef, useState } from "react";
import { createItemAction } from "@/lib/actions/items";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";

const TYPE_LABELS: Record<string, string> = { CAR: "Coche", HOUSE: "Casa", GENERIC: "Genérico" };

export function ItemForm({ categoryId, defaultType = "GENERIC" }: { categoryId: string; defaultType?: "CAR" | "HOUSE" | "GENERIC" }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [type, setType] = useState(defaultType);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      await createItemAction(formData);
      formRef.current?.reset();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Añadir item
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo item">
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <input type="hidden" name="categoryId" value={categoryId} />
          <Select name="type" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input name="name" placeholder="Nombre (ej. Ibiza 2018)" required />
          {type === "CAR" && (
            <>
              <Input name="brand" placeholder="Marca" />
              <Input name="model" placeholder="Modelo" />
              <Input name="currentKm" type="number" placeholder="Kilometraje actual" />
            </>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creando..." : "Crear"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
