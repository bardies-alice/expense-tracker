import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as maintenanceService from "@/lib/core/maintenanceService";
import { maintenanceEventSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest, { params }: { params: Promise<{ componentId: string }> }) {
  const { componentId } = await params;
  const body = await request.json();
  const parsed = maintenanceEventSchema.safeParse({ ...body, componentId });
  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }
  const event = await maintenanceService.createMaintenanceEvent(parsed.data);
  return NextResponse.json(event, { status: 201 });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ componentId: string }> }) {
  const { componentId } = await params;
  const events = await maintenanceService.listEventsForComponent(componentId);
  return NextResponse.json(events);
}
