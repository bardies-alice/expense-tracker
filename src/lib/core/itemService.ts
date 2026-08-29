import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import type { itemSchema } from "@/lib/validation/schemas";
import { uniqueSlug } from "@/lib/slug";

export function getItemById(id: string) {
  return prisma.item.findUnique({
    where: { id },
    include: {
      category: { include: { subcategories: true } },
      components: { include: { events: { orderBy: { date: "desc" } } } },
    },
  });
}

export async function getItemSlug(id: string) {
  const item = await prisma.item.findUnique({ where: { id }, select: { slug: true } });
  return item?.slug ?? null;
}

export function getItemBySlug(slug: string) {
  return prisma.item.findUnique({
    where: { slug },
    include: {
      category: { include: { subcategories: true } },
      components: { include: { events: { orderBy: { date: "desc" } } } },
    },
  });
}

export function listItemsByCategory(categoryId: string) {
  return prisma.item.findMany({
    where: { categoryId, archivedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function createItem(input: z.infer<typeof itemSchema>) {
  const slug = await uniqueSlug(input.name, async (candidate) => (await prisma.item.count({ where: { slug: candidate } })) > 0);
  return prisma.item.create({
    data: {
      categoryId: input.categoryId,
      type: input.type,
      name: input.name,
      slug,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export function updateItemMetadata(id: string, metadata: Record<string, unknown>) {
  return prisma.item.update({ where: { id }, data: { metadata: metadata as Prisma.InputJsonValue } });
}

export function deleteItem(id: string) {
  return prisma.$transaction([
    prisma.transaction.updateMany({ where: { itemId: id }, data: { itemId: null } }),
    prisma.recurringRule.updateMany({ where: { itemId: id }, data: { itemId: null } }),
    prisma.item.delete({ where: { id } }),
  ]);
}
