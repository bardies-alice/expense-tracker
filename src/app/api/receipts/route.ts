import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import * as transactionService from "@/lib/core/transactionService";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "receipts");

// Placeholder: guarda la imagen del ticket y crea una transacción borrador con source=OCR.
// La extracción real de líneas de producto (OCR) se implementará más adelante sobre esta misma transacción.
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("receipt");
  const categoryId = formData.get("categoryId");

  if (!(file instanceof File) || typeof categoryId !== "string") {
    return NextResponse.json({ error: "Se requiere 'receipt' (archivo) y 'categoryId'" }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  const receiptImageUrl = `/uploads/receipts/${filename}`;

  const transaction = await transactionService.createTransaction({
    type: "EXPENSE",
    amount: 0,
    date: new Date(),
    categoryId,
    source: "OCR",
    receiptImageUrl,
    notes: "Borrador pendiente de extracción OCR",
  });

  return NextResponse.json(transaction, { status: 201 });
}
