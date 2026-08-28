import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as transactionService from "@/lib/core/transactionService";
import { transactionUpdateSchema } from "@/lib/validation/schemas";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transaction = await transactionService.getTransactionById(id);
  if (!transaction) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(transaction);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = transactionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }
  const transaction = await transactionService.updateTransaction(id, parsed.data);
  return NextResponse.json(transaction);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await transactionService.deleteTransaction(id);
  return NextResponse.json({ ok: true });
}
