import { prisma } from "@/lib/prisma";

export function listImportMerchantRules() {
  return prisma.importMerchantRule.findMany();
}

export function upsertImportMerchantRule(matchText: string, categoryId: string, subcategoryId?: string) {
  return prisma.importMerchantRule.upsert({
    where: { matchText },
    update: { categoryId, subcategoryId: subcategoryId ?? null },
    create: { matchText, categoryId, subcategoryId: subcategoryId ?? null },
  });
}

export function deleteImportMerchantRule(id: string) {
  return prisma.importMerchantRule.delete({ where: { id } });
}
