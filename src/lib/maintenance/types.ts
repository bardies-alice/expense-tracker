import type { MaintenanceRuleType } from "@prisma/client";
import type { ComponentStatus } from "@/types";

export interface StatusInput {
  ruleType: MaintenanceRuleType;
  intervalKm?: number | null;
  intervalDays?: number | null;
  warningKm?: number | null;
  warningDays?: number | null;
  lastEventDate?: Date | null;
  lastEventKm?: number | null;
  currentKm?: number | null;
  today?: Date;
}

export type { ComponentStatus };
