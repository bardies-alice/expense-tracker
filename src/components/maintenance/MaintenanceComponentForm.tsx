"use client";

import { useRef, useState } from "react";
import type { ComponentTypeDefinition } from "@/lib/constants/componentTypes";
import { createMaintenanceComponentAction } from "@/lib/actions/maintenance";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";

const RULE_LABELS: Record<string, string> = {
  DISTANCE: "Por kilómetros",
  TIME: "Por tiempo",
  DISTANCE_OR_TIME: "Por km o tiempo (lo que llegue antes)",
};

export function MaintenanceComponentForm({ itemId, catalog }: { itemId: string; catalog: ComponentTypeDefinition[] }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState<ComponentTypeDefinition | undefined>(catalog[0]);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      await createMaintenanceComponentAction(formData);
      formRef.current?.reset();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Añadir componente
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo componente de mantenimiento">
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <input type="hidden" name="itemId" value={itemId} />
          <Select
            onChange={(e) => setSelected(catalog.find((c) => c.componentType === e.target.value))}
            defaultValue={selected?.componentType}
          >
            {catalog.map((c) => (
              <option key={c.componentType} value={c.componentType}>
                {c.label}
              </option>
            ))}
            <option value="">Personalizado</option>
          </Select>
          <input type="hidden" name="componentType" value={selected?.componentType ?? "CUSTOM"} />
          <Input name="label" placeholder="Etiqueta" defaultValue={selected?.label} required />
          <Input name="zoneKey" placeholder="Zona SVG (ej. engine)" defaultValue={selected?.zoneKey ?? ""} required />
          <Select name="ruleType" defaultValue={selected?.ruleType ?? "TIME"}>
            {Object.entries(RULE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input name="intervalKm" type="number" placeholder="Intervalo km" defaultValue={selected?.intervalKm} />
            <Input name="warningKm" type="number" placeholder="Aviso km" defaultValue={selected?.warningKm} />
            <Input name="intervalDays" type="number" placeholder="Intervalo días" defaultValue={selected?.intervalDays} />
            <Input name="warningDays" type="number" placeholder="Aviso días" defaultValue={selected?.warningDays} />
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creando..." : "Crear componente"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
