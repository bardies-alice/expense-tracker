import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as transactionService from "@/lib/core/transactionService";
import { transactionSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const transactions = await transactionService.listTransactions({
    categoryId: searchParams.get("categoryId") ?? undefined,
    itemId: searchParams.get("itemId") ?? undefined,
    type: (searchParams.get("type") as "EXPENSE" | "INCOME" | null) ?? undefined,
  });
  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = transactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }
  const transaction = await transactionService.createTransaction(parsed.data);
  return NextResponse.json(transaction, { status: 201 });
}
