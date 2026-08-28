import clsx from "clsx";
import type { ComponentStatus } from "@/types";

const STATUS_CLASSES: Record<ComponentStatus, string> = {
  ok: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
  unknown: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<ComponentStatus, string> = {
  ok: "Al día",
  warning: "Próximo",
  overdue: "Atrasado",
  unknown: "Sin datos",
};

export function StatusBadge({ status }: { status: ComponentStatus }) {
  return (
    <span className={clsx("inline-block rounded-full px-2 py-0.5 text-xs font-medium", STATUS_CLASSES[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx("inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700", className)}>
      {children}
    </span>
  );
}
