import { listCategoriesWithItems } from "@/lib/core/categoryService";
import { ImportCsvClient } from "@/components/import/ImportCsvClient";

export default async function ImportarPage() {
  const categories = await listCategoriesWithItems();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Importar movimientos</h1>
      <ImportCsvClient categories={categories} />
    </div>
  );
}
