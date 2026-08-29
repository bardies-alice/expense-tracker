"use client";

import { useState } from "react";
import type { Category, Subcategory } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { CategoryForm } from "./CategoryForm";
import { CategoryList } from "./CategoryList";

export function CategoriesBoard({ categories }: { categories: (Category & { subcategories: Subcategory[] })[] }) {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Categorías</h1>
        <div className="flex items-center gap-2">
          <Button variant={editMode ? "secondary" : "ghost"} onClick={() => setEditMode((v) => !v)}>
            {editMode ? "Hecho" : "Editar"}
          </Button>
          <CategoryForm />
        </div>
      </div>
      <CategoryList categories={categories} editMode={editMode} />
    </div>
  );
}
