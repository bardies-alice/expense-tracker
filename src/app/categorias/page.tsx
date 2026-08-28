import { listCategories } from "@/lib/core/categoryService";
import { CategoryList } from "@/components/categories/CategoryList";
import { CategoryForm } from "@/components/categories/CategoryForm";

export default async function CategoriasPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Categorías</h1>
        <CategoryForm />
      </div>
      <CategoryList categories={categories} />
    </div>
  );
}
