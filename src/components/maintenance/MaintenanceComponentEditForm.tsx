"use client";

import { useRef, useState } from "react";
import { updateMaintenanceComponentAction } from "@/lib/actions/maintenance";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import type { VisualComponent } from "@/components/items/visual-card/VisualCard";

const RULE_LABELS: Record<string, string> = {
  DISTANCE: "Por kilómetros",
  TIME: "Por tiempo",
  DISTANCE_OR_TIME: "Por km o tiempo (lo que llegue antes)",
};

export function MaintenanceComponentEditForm({
  itemId,
  component,
  onClose,
}: {
  itemId: string;
  component: VisualComponent | null;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      await updateMaintenanceComponentAction(formData);
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal open={!!component} onClose={onClose} title={`Vida útil — ${component?.label ?? ""}`}>
      {component && (
        <form ref={formRef} action={handleSubmit} className="space-y-3" key={component.id}>
          <input type="hidden" name="itemId" value={itemId} />
          <input type="hidden" name="componentId" value={component.id} />
          <Input name="label" defaultValue={component.label} required />
          <Select name="ruleType" defaultValue={component.ruleType}>
            {Object.entries(RULE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input name="intervalKm" type="number" placeholder="Intervalo km" defaultValue={component.intervalKm ?? ""} />
            <Input name="warningKm" type="number" placeholder="Aviso km antes" defaultValue={component.warningKm ?? ""} />
            <Input name="intervalDays" type="number" placeholder="Intervalo días" defaultValue={component.intervalDays ?? ""} />
            <Input name="warningDays" type="number" placeholder="Aviso días antes" defaultValue={component.warningDays ?? ""} />
          </div>
          <p className="text-xs text-gray-400">Deja un campo vacío para quitar ese límite.</p>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      )}
    </Modal>
  );
}
