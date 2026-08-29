"use server";

import { revalidatePath } from "next/cache";
import * as balanceService from "@/lib/core/balanceService";

export async function setBalanceAnchorAction(formData: FormData) {
  const amount = Number(formData.get("amount"));
  const asOfDate = new Date(formData.get("asOfDate") as string);
  await balanceService.setBalanceAnchor(amount, asOfDate);
  revalidatePath("/");
}
