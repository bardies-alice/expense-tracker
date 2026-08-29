import { listCategories } from "@/lib/core/categoryService";
import { CategoriesBoard } from "@/components/categories/CategoriesBoard";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const categories = await listCategories();

  return <CategoriesBoard categories={categories} />;
}
