import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { maintenanceComponentSchema, maintenanceEventSchema } from "@/lib/validation/schemas";

export function createMaintenanceComponent(input: z.infer<typeof maintenanceComponentSchema>) {
  return prisma.maintenanceComponent.create({ data: input });
}

export function deleteMaintenanceComponent(id: string) {
  return prisma.maintenanceComponent.delete({ where: { id } });
}

export function createMaintenanceEvent(input: z.infer<typeof maintenanceEventSchema>, transactionId?: string) {
  return prisma.maintenanceEvent.create({
    data: { ...input, transactionId },
  });
}

export function listAllComponentsWithLatestEvent() {
  return prisma.maintenanceComponent.findMany({
    include: {
      item: true,
      events: { orderBy: { date: "desc" }, take: 1 },
    },
  });
}

export function listEventsForComponent(componentId: string) {
  return prisma.maintenanceEvent.findMany({
    where: { componentId },
    orderBy: { date: "desc" },
  });
}
