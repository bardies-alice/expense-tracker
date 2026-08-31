"use client";

import { useRef, useState } from "react";
import type { ItemType } from "@prisma/client";
import type { ComponentTypeDefinition } from "@/lib/constants/componentTypes";
import { SVG_ZONES } from "@/lib/constants/componentTypes";
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

const NO_ZONE = "";

export function MaintenanceComponentForm({
  itemId,
  itemType,
  catalog,
}: {
  itemId: string;
  itemType: ItemType;
  catalog: ComponentTypeDefinition[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState<ComponentTypeDefinition | undefined>(catalog[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [zoneKey, setZoneKey] = useState<string>(catalog[0]?.zoneKey ?? NO_ZONE);
  const formRef = useRef<HTMLFormElement>(null);
  const zones = SVG_ZONES[itemType] ?? [];

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
            onChange={(e) => {
              const c = catalog.find((c) => c.componentType === e.target.value);
              setSelected(c);
              setIsCustom(!c);
              setZoneKey(c?.zoneKey ?? NO_ZONE);
            }}
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
          <div>
            <input type="hidden" name="zoneKey" value={zoneKey} />
            <Select value={zoneKey} onChange={(e) => setZoneKey(e.target.value)} disabled={!isCustom}>
              <option value={NO_ZONE}>Sin marcador en el dibujo (solo en la lista)</option>
              {zones.map((z) => (
                <option key={z.zoneKey} value={z.zoneKey}>
                  {z.label}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-gray-400">
              {isCustom
                ? "Dónde aparece el marcador en el dibujo. Si no eliges ninguna, el componente se mostrará igualmente en la lista de abajo."
                : "Este componente ya tiene marcador asignado en el dibujo."}
            </p>
          </div>
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
