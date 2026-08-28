"use client";

import { useRef, useState } from "react";
import { createCategoryAction } from "@/lib/actions/categories";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export function CategoryForm() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      await createCategoryAction(formData);
      formRef.current?.reset();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nueva categoría</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nueva categoría">
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <Input name="name" placeholder="Nombre" required />
          <Input name="color" type="color" defaultValue="#6366f1" />
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creando..." : "Crear"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
