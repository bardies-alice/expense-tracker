import { listCategories } from "@/lib/core/categoryService";
import { CategoriesBoard } from "@/components/categories/CategoriesBoard";

export default async function CategoriasPage() {
  const categories = await listCategories();

  return <CategoriesBoard categories={categories} />;
}
