import { differenceInCalendarDays } from "date-fns";
import type { ComponentStatus } from "@/types";
import type { StatusInput } from "./types";

const STATUS_PRIORITY: Record<ComponentStatus, number> = {
  unknown: 0,
  ok: 1,
  warning: 2,
  overdue: 3,
};

function worst(a: ComponentStatus, b: ComponentStatus): ComponentStatus {
  return STATUS_PRIORITY[a] >= STATUS_PRIORITY[b] ? a : b;
}

function statusFromRemaining(remaining: number, warningThreshold: number | null | undefined): ComponentStatus {
  if (remaining <= 0) return "overdue";
  if (warningThreshold != null && remaining <= warningThreshold) return "warning";
  return "ok";
}

export function computeComponentStatus(input: StatusInput): ComponentStatus {
  const { ruleType, intervalKm, intervalDays, warningKm, warningDays, lastEventDate, lastEventKm, currentKm } = input;
  const today = input.today ?? new Date();

  if (!lastEventDate) return "unknown";

  let timeStatus: ComponentStatus | null = null;
  if (intervalDays != null) {
    const daysSince = differenceInCalendarDays(today, lastEventDate);
    const remainingDays = intervalDays - daysSince;
    timeStatus = statusFromRemaining(remainingDays, warningDays);
  }

  let distanceStatus: ComponentStatus | null = null;
  if (intervalKm != null && currentKm != null && lastEventKm != null) {
    const kmSince = currentKm - lastEventKm;
    const remainingKm = intervalKm - kmSince;
    distanceStatus = statusFromRemaining(remainingKm, warningKm);
  }

  if (ruleType === "TIME") return timeStatus ?? "unknown";
  if (ruleType === "DISTANCE") return distanceStatus ?? "unknown";

  // DISTANCE_OR_TIME: whichever dimension has data, take the worst; if neither, unknown.
  if (timeStatus && distanceStatus) return worst(timeStatus, distanceStatus);
  return timeStatus ?? distanceStatus ?? "unknown";
}
