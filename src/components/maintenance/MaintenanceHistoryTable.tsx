import type { MaintenanceEvent } from "@prisma/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatEUR } from "@/lib/format";

export function MaintenanceHistoryTable({ events }: { events: MaintenanceEvent[] }) {
  if (events.length === 0) {
    return <EmptyState title="Sin historial" description="Todavía no hay eventos registrados para este componente." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <tbody className="divide-y divide-border">
          {events.map((e) => (
            <tr key={e.id}>
              <td className="whitespace-nowrap py-1.5 pr-4 text-muted">{formatDate(e.date)}</td>
              <td className="whitespace-nowrap py-1.5 pr-4">{e.mileageKm ? `${e.mileageKm} km` : "—"}</td>
              <td className="whitespace-nowrap py-1.5 pr-4">{e.cost ? formatEUR(e.cost) : "—"}</td>
              <td className="max-w-[160px] break-words py-1.5 text-muted">{e.notes ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
