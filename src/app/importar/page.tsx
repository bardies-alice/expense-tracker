import { listCategoriesWithItems } from "@/lib/core/categoryService";
import { listImportMerchantRules } from "@/lib/core/importRuleService";
import { ImportCsvClient } from "@/components/import/ImportCsvClient";
import { PageHeading } from "@/components/ui/PageHeading";

export const dynamic = "force-dynamic";

export default async function ImportarPage() {
  const [categories, merchantRules] = await Promise.all([listCategoriesWithItems(), listImportMerchantRules()]);

  return (
    <div className="space-y-6">
      <PageHeading title="Importar" subtitle="Sube un extracto y añade transacciones en bloque" />
      <ImportCsvClient categories={categories} merchantRules={merchantRules} />
    </div>
  );
}
