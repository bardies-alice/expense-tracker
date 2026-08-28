import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { tripSchema } from "@/lib/validation/schemas";

export function listTrips() {
  return prisma.trip.findMany({ orderBy: { startDate: "desc" } });
}

export function createTrip(input: z.infer<typeof tripSchema>) {
  return prisma.trip.create({ data: input });
}

export function deleteTrip(id: string) {
  return prisma.trip.delete({ where: { id } });
}
