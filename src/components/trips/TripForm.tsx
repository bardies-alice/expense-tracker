"use client";

import { useEffect, useRef, useState } from "react";
import { createTripAction } from "@/lib/actions/trips";
import { fetchSubdivisions, fetchWorldCountries, isDrillSupported, type GeoOption } from "@/lib/geo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";

export function TripForm({ categoryId, onSaved }: { categoryId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [countries, setCountries] = useState<GeoOption[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [subdivisions, setSubdivisions] = useState<GeoOption[]>([]);
  const [subdivisionCode, setSubdivisionCode] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (open && countries.length === 0) {
      fetchWorldCountries().then((layer) => {
        setCountries(layer.options);
        setCountryCode(layer.options[0]?.code ?? "");
      });
    }
  }, [open, countries.length]);

  useEffect(() => {
    if (!countryCode || !isDrillSupported(countryCode)) return;
    fetchSubdivisions(countryCode).then((layer) => {
      setSubdivisions(layer?.options ?? []);
      setSubdivisionCode("");
    });
  }, [countryCode]);

  function handleCountryChange(code: string) {
    setCountryCode(code);
    setSubdivisions([]);
    setSubdivisionCode("");
  }

  const countryName = countries.find((c) => c.code === countryCode)?.name ?? "";
  const subdivisionName = subdivisions.find((s) => s.code === subdivisionCode)?.name ?? "";

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      formData.set("countryCode", countryCode);
      formData.set("countryName", countryName);
      if (subdivisionCode) {
        formData.set("subdivisionCode", subdivisionCode);
        formData.set("subdivisionName", subdivisionName);
      }
      await createTripAction(formData, categoryId);
      formRef.current?.reset();
      setOpen(false);
      onSaved();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        + Nuevo viaje
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo viaje">
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <Select value={countryCode} onChange={(e) => handleCountryChange(e.target.value)} disabled={countries.length === 0}>
            {countries.length === 0 && <option>Cargando países…</option>}
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </Select>

          {subdivisions.length > 0 && (
            <Select value={subdivisionCode} onChange={(e) => setSubdivisionCode(e.target.value)}>
              <option value="">(sin comunidad/estado)</option>
              {subdivisions.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </Select>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input name="startDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            <Input name="endDate" type="date" />
          </div>

          <Input name="notes" placeholder="Notas (opcional)" />

          <Button type="submit" disabled={pending || !countryCode} className="w-full">
            {pending ? "Guardando..." : "Guardar viaje"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
