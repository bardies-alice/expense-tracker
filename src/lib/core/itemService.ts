import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import type { itemSchema } from "@/lib/validation/schemas";

export function getItemById(id: string) {
  return prisma.item.findUnique({
    where: { id },
    include: {
      category: true,
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

export function createItem(input: z.infer<typeof itemSchema>) {
  return prisma.item.create({
    data: {
      categoryId: input.categoryId,
      type: input.type,
      name: input.name,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export function updateItemMetadata(id: string, metadata: Record<string, unknown>) {
  return prisma.item.update({ where: { id }, data: { metadata: metadata as Prisma.InputJsonValue } });
}

export function deleteItem(id: string) {
  return prisma.item.delete({ where: { id } });
}
