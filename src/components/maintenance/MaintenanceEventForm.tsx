"use client";

import { useRef, useState } from "react";
import { createMaintenanceEventAction } from "@/lib/actions/maintenance";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export function MaintenanceEventForm({
  open,
  onClose,
  itemId,
  componentId,
  componentLabel,
}: {
  open: boolean;
  onClose: () => void;
  itemId: string;
  componentId: string | null;
  componentLabel?: string;
}) {
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      await createMaintenanceEventAction(formData);
      formRef.current?.reset();
      onClose();
    } finally {
      setPending(false);
    }
  }

  if (!componentId) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Registrar mantenimiento — ${componentLabel ?? ""}`}>
      <form ref={formRef} action={handleSubmit} className="space-y-3">
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="componentId" value={componentId} />
        <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
        <Input name="mileageKm" type="number" placeholder="Kilometraje (opcional)" />
        <Input name="cost" type="number" step="0.01" placeholder="Coste € (opcional)" />
        <Input name="notes" placeholder="Notas (opcional)" />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Guardando..." : "Registrar"}
        </Button>
      </form>
    </Modal>
  );
}
