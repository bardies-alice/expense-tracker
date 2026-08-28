import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const subcategorySchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
});

export const itemSchema = z.object({
  categoryId: z.string().min(1),
  type: z.enum(["CAR", "HOUSE", "GENERIC"]),
  name: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const maintenanceComponentSchema = z.object({
  itemId: z.string().min(1),
  componentType: z.string().min(1),
  zoneKey: z.string().min(1),
  label: z.string().min(1),
  ruleType: z.enum(["DISTANCE", "TIME", "DISTANCE_OR_TIME"]),
  intervalKm: z.number().int().positive().optional(),
  intervalDays: z.number().int().positive().optional(),
  warningKm: z.number().int().positive().optional(),
  warningDays: z.number().int().positive().optional(),
});

export const maintenanceEventSchema = z.object({
  componentId: z.string().min(1),
  date: z.coerce.date(),
  mileageKm: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
  cost: z.number().nonnegative().optional(),
});

export const expenseLineSchema = z.object({
  productName: z.string().min(1),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative().optional(),
  totalPrice: z.number().nonnegative(),
  category: z.string().optional(),
});

export const transactionSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z.number().positive(),
  date: z.coerce.date(),
  notes: z.string().optional(),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional(),
  itemId: z.string().optional(),
  source: z.enum(["MANUAL", "ALEXA", "OCR"]).default("MANUAL"),
  receiptImageUrl: z.string().optional(),
  lines: z.array(expenseLineSchema).optional(),
});

export const transactionUpdateSchema = transactionSchema.partial();

export const alexaWebhookSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("expense"),
    amount: z.number().positive(),
    categoryId: z.string().min(1),
    notes: z.string().optional(),
  }),
  z.object({
    type: z.literal("shopping_item"),
    productName: z.string().min(1),
  }),
]);
