"use client";

import { useState } from "react";
import type { Category, Subcategory } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { PageHeading } from "@/components/ui/PageHeading";
import { CategoryForm } from "./CategoryForm";
import { CategoryList } from "./CategoryList";

export function CategoriesBoard({ categories }: { categories: (Category & { subcategories: Subcategory[] })[] }) {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeading title="Categorías" subtitle="Organiza dónde va tu dinero" />
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
