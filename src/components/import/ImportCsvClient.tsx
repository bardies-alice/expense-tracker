"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, ImportMerchantRule, Subcategory } from "@prisma/client";
import { normalizeMerchant, parseRevolutCsv, type ParsedImportRow } from "@/lib/import/revolut";
import { getExistingExternalRefsAction, importTransactionsAction } from "@/lib/actions/imports";
import { createSubcategoryAction } from "@/lib/actions/categories";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatEUR } from "@/lib/format";

type CategoryWithSub = Category & { subcategories: Subcategory[] };

interface EditableRow extends ParsedImportRow {
  included: boolean;
  categoryId: string;
  subcategoryId: string;
  remember: boolean;
  alreadyRemembered: boolean;
  alreadyImported: boolean;
}

type Tab = "pendientes" | "listas" | "importadas" | "todos";

const PAGE_SIZE = 50;

function classify(r: EditableRow): Tab {
  if (r.alreadyImported) return "importadas";
  if (!r.categoryId) return "pendientes";
  return "listas";
}

function snapshotFor(tabValue: Tab, list: EditableRow[]) {
  return new Set(
    list.filter((r) => !r.internal && (tabValue === "todos" || classify(r) === tabValue)).map((r) => r.externalRef)
  );
}

function toDate(fechaInicio: string) {
  // "2026-01-03 23:57:54" -> ISO-ish, Date constructor parses this fine with a "T"
  return fechaInicio.replace(" ", "T");
}

export function ImportCsvClient({
  categories: initialCategories,
  merchantRules,
}: {
  categories: CategoryWithSub[];
  merchantRules: ImportMerchantRule[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithSub[]>(initialCategories);
  const [rows, setRows] = useState<EditableRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<Tab>("pendientes");
  const [pinnedRefs, setPinnedRefs] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; remembered: number } | null>(null);
  const [propagation, setPropagation] = useState<{
    descripcion: string;
    patch: { categoryId: string; subcategoryId: string };
    siblings: EditableRow[];
    selected: Set<string>;
  } | null>(null);
  const [newSubFor, setNewSubFor] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");
  const [creatingSub, setCreatingSub] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function categoryBySlug(slug: string | null) {
    if (!slug) return null;
    return categories.find((c) => c.slug === slug) ?? null;
  }

  const merchantRuleMap = useMemo(() => new Map(merchantRules.map((r) => [r.matchText, r])), [merchantRules]);

  async function handleFile(file: File) {
    setLoadingFile(true);
    try {
      const text = await file.text();
      const parsed = parseRevolutCsv(text);
      const realExternalRefs = parsed.filter((r) => !r.internal).map((r) => r.externalRef);
      const existingRefs = new Set(await getExistingExternalRefsAction(realExternalRefs));

      const built: EditableRow[] = parsed.map((r) => {
          const alreadyImported = existingRefs.has(r.externalRef);
          const saved = merchantRuleMap.get(normalizeMerchant(r.descripcion));
          if (saved) {
            return {
              ...r,
              included: !r.internal && !alreadyImported,
              categoryId: saved.categoryId,
              subcategoryId: saved.subcategoryId ?? "",
              remember: false,
              alreadyRemembered: true,
              alreadyImported,
            };
          }
          const category = categoryBySlug(r.guessedCategorySlug);
          const subcategory = category && r.guessedSubcategoryName
            ? category.subcategories.find((s) => s.name === r.guessedSubcategoryName)
            : null;
          return {
            ...r,
            included: !r.internal && !alreadyImported,
            categoryId: category?.id ?? "",
            subcategoryId: subcategory?.id ?? "",
            remember: false,
            alreadyRemembered: false,
            alreadyImported,
          };
        });

      setRows(built);
      setPinnedRefs(snapshotFor("pendientes", built));
      setResult(null);
      setPage(0);
      setTab("pendientes");
    } finally {
      setLoadingFile(false);
    }
  }

  const realRows = useMemo(() => rows?.filter((r) => !r.internal) ?? [], [rows]);
  const internalCount = (rows?.length ?? 0) - realRows.length;

  // Live counts (for tab labels) recompute as you edit rows.
  const pendientesRows = useMemo(() => realRows.filter((r) => classify(r) === "pendientes"), [realRows]);
  const listasRows = useMemo(() => realRows.filter((r) => classify(r) === "listas"), [realRows]);
  const importadasRows = useMemo(() => realRows.filter((r) => classify(r) === "importadas"), [realRows]);

  // The rows actually shown for the active tab stay pinned to whatever matched when the tab
  // was opened, so picking a category doesn't yank the row out from under you mid-edit.
  const tabRows = useMemo(() => realRows.filter((r) => pinnedRefs.has(r.externalRef)), [realRows, pinnedRefs]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return tabRows;
    const q = search.toLowerCase();
    return tabRows.filter((r) => r.descripcion.toLowerCase().includes(q));
  }, [tabRows, search]);

  const includedRows = realRows.filter((r) => r.included && !r.alreadyImported);
  const pageRows = filteredRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  function updateRow(externalRef: string, patch: Partial<EditableRow>) {
    setRows((prev) => prev?.map((r) => (r.externalRef === externalRef ? { ...r, ...patch } : r)) ?? null);
  }

  function siblingsOf(r: EditableRow): EditableRow[] {
    if (!rows) return [];
    const key = normalizeMerchant(r.descripcion);
    return rows.filter((x) => x.externalRef !== r.externalRef && !x.alreadyImported && normalizeMerchant(x.descripcion) === key);
  }

  // Explicit, on demand: once a row has category (and subcategory, if any) set the way you want,
  // "Aplicar a otras" lets you pick which other rows for the same merchant get the same treatment.
  // Triggering this off the category/subcategory selects themselves would pop the modal before
  // you'd even picked a subcategory.
  function openPropagation(r: EditableRow) {
    const siblings = siblingsOf(r);
    if (siblings.length === 0) return;
    setPropagation({
      descripcion: r.descripcion,
      patch: { categoryId: r.categoryId, subcategoryId: r.subcategoryId },
      siblings,
      selected: new Set(siblings.map((s) => s.externalRef)),
    });
  }

  function togglePropagationRow(externalRef: string) {
    setPropagation((prev) => {
      if (!prev) return null;
      const selected = new Set(prev.selected);
      if (selected.has(externalRef)) selected.delete(externalRef);
      else selected.add(externalRef);
      return { ...prev, selected };
    });
  }

  function confirmPropagation() {
    if (!propagation) return;
    const { patch, selected } = propagation;
    setRows((prev) => prev?.map((r) => (selected.has(r.externalRef) ? { ...r, ...patch } : r)) ?? null);
    setPropagation(null);
  }

  function handleSubcategorySelect(r: EditableRow, value: string) {
    if (value === "__new__") {
      setNewSubFor(r.externalRef);
      setNewSubName("");
      return;
    }
    updateRow(r.externalRef, { subcategoryId: value });
  }

  async function submitNewSubcategory(r: EditableRow) {
    const name = newSubName.trim();
    if (!name) return;
    setCreatingSub(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("categoryId", r.categoryId);
      const sub = await createSubcategoryAction(formData);
      setCategories((prev) => prev.map((c) => (c.id === r.categoryId ? { ...c, subcategories: [...c.subcategories, sub] } : c)));
      updateRow(r.externalRef, { subcategoryId: sub.id });
      setNewSubFor(null);
      setNewSubName("");
    } finally {
      setCreatingSub(false);
    }
  }

  function changeTab(next: Tab) {
    setTab(next);
    setPinnedRefs(snapshotFor(next, rows ?? []));
    setPage(0);
  }

  async function handleImport() {
    if (!rows) return;
    setPending(true);
    try {
      const payload = includedRows
        .filter((r) => r.categoryId)
        .map((r) => ({
          externalRef: r.externalRef,
          type: r.type,
          amount: Math.abs(r.importe),
          date: new Date(toDate(r.fechaInicio)),
          notes: r.descripcion,
          categoryId: r.categoryId,
          subcategoryId: r.subcategoryId || undefined,
          rememberMatchText: r.remember ? normalizeMerchant(r.descripcion) : undefined,
        }));
      const res = await importTransactionsAction(payload);
      const importedRefs = new Set(payload.map((p) => p.externalRef));
      setRows((prev) => prev?.map((r) => (importedRefs.has(r.externalRef) ? { ...r, alreadyImported: true } : r)) ?? null);
      // Drop them from the tab you're working in too, instead of leaving a grayed-out
      // "✓ importado" row you have to scroll or page past to reach the next one.
      setPinnedRefs((prev) => new Set([...prev].filter((ref) => !importedRefs.has(ref))));
      setResult(res);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!rows) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="mb-4 text-sm text-gray-500">
          Extracto CSV de Revolut. Los movimientos internos (Pocket, cambio de divisa) se detectan y excluyen
          automáticamente.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={loadingFile}>
          {loadingFile ? "Analizando..." : "Seleccionar CSV"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <span className="text-gray-600">
          <strong className="text-gray-900">{realRows.length}</strong> movimientos reales
        </span>
        <span className="text-gray-400">
          {internalCount} internos excluidos automáticamente (Pocket / cambio de divisa)
        </span>
        <span className="text-gray-600">
          <strong className="text-gray-900">{includedRows.length}</strong> incluidos para importar
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Input placeholder="Buscar descripción..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="w-56" />
          <Button onClick={handleImport} disabled={pending || includedRows.length === 0}>
            {pending ? "Importando..." : `Importar ${includedRows.length}`}
          </Button>
        </div>
      </div>

      {result && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {result.imported} movimientos importados{result.skipped > 0 ? `, ${result.skipped} ya existían (omitidos)` : ""}
          {result.remembered > 0 ? `. ${result.remembered} comercios recordados para próximas importaciones` : ""}.
        </p>
      )}

      <div className="flex gap-1 border-b border-gray-200">
        {(
          [
            ["pendientes", "Sin categoría", pendientesRows.length],
            ["listas", "Listas para importar", listasRows.length],
            ["importadas", "Ya importadas", importadasRows.length],
            ["todos", "Todos", realRows.length],
          ] as [Tab, string, number][]
        ).map(([value, label, count]) => (
          <button
            key={value}
            onClick={() => changeTab(value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === value ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label} <span className="text-xs text-gray-400">({count})</span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full table-fixed divide-y divide-gray-200 text-sm">
          <colgroup>
            <col className="w-16" />
            <col className="w-24" />
            <col />
            <col className="w-24" />
            <col className="w-40" />
            <col className="w-40" />
            <col className="w-20" />
            <col className="w-28" />
          </colgroup>
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Incluir</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2 text-right">Importe</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Subcategoría</th>
              <th className="px-3 py-2">Recordar</th>
              <th className="px-3 py-2">Otras filas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageRows.map((r) => {
              const category = categories.find((c) => c.id === r.categoryId);
              return (
                <tr key={r.externalRef} className={r.included && !r.alreadyImported ? "" : "opacity-40"}>
                  <td className="px-3 py-2">
                    {r.alreadyImported ? (
                      <span className="text-xs text-gray-400" title="Ya está en tus transacciones">
                        ✓ importado
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={r.included}
                        onChange={(e) => updateRow(r.externalRef, { included: e.target.checked })}
                      />
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500">{r.fechaInicio.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-gray-800">{r.descripcion}</td>
                  <td className={`whitespace-nowrap px-3 py-2 text-right font-medium ${r.type === "INCOME" ? "text-emerald-600" : "text-gray-900"}`}>
                    {r.type === "INCOME" ? "+" : "-"}
                    {formatEUR(Math.abs(r.importe))}
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={r.categoryId}
                      onChange={(e) => updateRow(r.externalRef, { categoryId: e.target.value, subcategoryId: "" })}
                      className={`min-w-[140px] ${!r.categoryId && r.included ? "border-amber-400" : ""}`}
                    >
                      <option value="">(sin categoría)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    {category && newSubFor === r.externalRef ? (
                      <div className="flex items-center gap-1">
                        <Input
                          autoFocus
                          placeholder="Nombre de la subcategoría"
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && submitNewSubcategory(r)}
                          className="w-36"
                        />
                        <button
                          onClick={() => submitNewSubcategory(r)}
                          disabled={creatingSub || !newSubName.trim()}
                          className="text-xs text-indigo-600 hover:text-indigo-800 disabled:opacity-40"
                        >
                          ✓
                        </button>
                        <button onClick={() => setNewSubFor(null)} className="text-xs text-gray-400 hover:text-gray-600">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <Select
                        value={r.subcategoryId}
                        onChange={(e) => handleSubcategorySelect(r, e.target.value)}
                        disabled={!category}
                        className="min-w-[140px]"
                      >
                        <option value="">{category ? "(ninguna)" : "—"}</option>
                        {category?.subcategories.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                        {category && <option value="__new__">+ Nueva subcategoría...</option>}
                      </Select>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {r.alreadyRemembered ? (
                      <span className="text-xs text-gray-400" title="Ya guardado de una importación anterior">
                        ✓ guardado
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={r.remember}
                        disabled={!r.categoryId}
                        title="Recordar este comercio para futuras importaciones"
                        onChange={(e) => updateRow(r.externalRef, { remember: e.target.checked })}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {r.categoryId && siblingsOf(r).length > 0 && (
                      <button onClick={() => openPropagation(r)} className="whitespace-nowrap text-xs text-indigo-600 hover:text-indigo-800">
                        Aplicar a otras ({siblingsOf(r).length})
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="disabled:opacity-30">
            ← Anterior
          </button>
          <span>
            Página {page + 1} de {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="disabled:opacity-30">
            Siguiente →
          </button>
        </div>
      )}

      {propagation && (
        <Modal open onClose={() => setPropagation(null)} title={`Aplicar categoría a otras filas de "${propagation.descripcion}"`}>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Elegí a cuáles de estas {propagation.siblings.length} filas también aplicar la categoría elegida.
            </p>
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {propagation.siblings.map((s) => (
                <li key={s.externalRef}>
                  <label className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={propagation.selected.has(s.externalRef)}
                      onChange={() => togglePropagationRow(s.externalRef)}
                    />
                    <span className="text-gray-500">{s.fechaInicio.slice(0, 10)}</span>
                    <span className="ml-auto font-medium text-gray-900">{formatEUR(Math.abs(s.importe))}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setPropagation(null)}>
                Solo esta fila
              </Button>
              <Button className="flex-1" onClick={confirmPropagation} disabled={propagation.selected.size === 0}>
                Aplicar a {propagation.selected.size} fila{propagation.selected.size === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
