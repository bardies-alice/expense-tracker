import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as transactionService from "@/lib/core/transactionService";
import { alexaWebhookSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = alexaWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  if (parsed.data.type === "expense") {
    const transaction = await transactionService.createTransaction({
      type: "EXPENSE",
      amount: parsed.data.amount,
      date: new Date(),
      notes: parsed.data.notes,
      categoryId: parsed.data.categoryId,
      source: "ALEXA",
    });
    return NextResponse.json(transaction, { status: 201 });
  }

  // shopping_item: contrato reservado, sin implementación real todavía (fuera de alcance del MVP).
  return NextResponse.json({ ok: true, received: parsed.data.productName }, { status: 202 });
}
