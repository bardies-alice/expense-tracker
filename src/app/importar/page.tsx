import { listCategoriesWithItems } from "@/lib/core/categoryService";
import { listImportMerchantRules } from "@/lib/core/importRuleService";
import { ImportCsvClient } from "@/components/import/ImportCsvClient";

export default async function ImportarPage() {
  const [categories, merchantRules] = await Promise.all([listCategoriesWithItems(), listImportMerchantRules()]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Importar movimientos</h1>
      <ImportCsvClient categories={categories} merchantRules={merchantRules} />
    </div>
  );
}
