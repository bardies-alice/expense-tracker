import Link from "next/link";
import type { Category, Subcategory } from "@prisma/client";
import { CategoryIcon } from "./CategoryIcon";
import { CategoryForm } from "./CategoryForm";

export function CategoryList({
  categories,
  editMode = false,
}: {
  categories: (Category & { subcategories: Subcategory[] })[];
  editMode?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/categorias/${c.slug}`}
          className="relative flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-5 text-center transition-shadow hover:shadow-md"
        >
          {editMode && (
            <div className="absolute right-2 top-2">
              <CategoryForm category={c} />
            </div>
          )}
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: (c.color ?? "#6366f1") + "22", color: c.color ?? "#6366f1" }}
          >
            <CategoryIcon name={c.icon} className="h-6 w-6" />
          </div>
          <span className="text-sm font-medium text-gray-900">{c.name}</span>
          <span className="text-xs text-gray-400">{c.subcategories.length} subcategorías</span>
        </Link>
      ))}
    </div>
  );
}
