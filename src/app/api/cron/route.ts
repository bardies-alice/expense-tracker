import { NextRequest, NextResponse } from "next/server";
import { runDueRecurringRules } from "@/lib/core/recurringService";
import { ensureMonthlySnapshots } from "@/lib/core/balanceService";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await runDueRecurringRules();
  await ensureMonthlySnapshots();

  return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
}
