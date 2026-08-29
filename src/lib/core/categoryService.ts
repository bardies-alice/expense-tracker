import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { categorySchema, categoryUpdateSchema, subcategorySchema } from "@/lib/validation/schemas";
import { slugify } from "@/lib/slug";

export function listCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { subcategories: true },
  });
}

export function listCategoriesWithItems() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { subcategories: true, items: { where: { archivedAt: null } } },
  });
}

export function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      subcategories: true,
      items: { orderBy: { createdAt: "desc" } },
    },
  });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      subcategories: true,
      items: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getCategorySlug(id: string) {
  const category = await prisma.category.findUnique({ where: { id }, select: { slug: true } });
  return category?.slug ?? null;
}

export function createCategory(input: z.infer<typeof categorySchema>) {
  return prisma.category.create({
    data: {
      name: input.name,
      slug: slugify(input.name),
      icon: input.icon,
      color: input.color,
      isCustom: true,
    },
  });
}

export function updateCategory(id: string, input: z.infer<typeof categoryUpdateSchema>) {
  return prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name, slug: slugify(input.name) }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.color !== undefined && { color: input.color }),
    },
  });
}

export function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

export function createSubcategory(input: z.infer<typeof subcategorySchema>) {
  return prisma.subcategory.create({ data: input });
}
