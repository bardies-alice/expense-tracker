import type { MaintenanceEvent } from "@prisma/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatEUR } from "@/lib/format";

export function MaintenanceHistoryTable({ events }: { events: MaintenanceEvent[] }) {
  if (events.length === 0) {
    return <EmptyState title="Sin historial" description="Todavía no hay eventos registrados para este componente." />;
  }

  return (
    <table className="min-w-full divide-y divide-gray-100 text-sm">
      <tbody className="divide-y divide-gray-100">
        {events.map((e) => (
          <tr key={e.id}>
            <td className="py-1.5 pr-4 text-gray-500">{formatDate(e.date)}</td>
            <td className="py-1.5 pr-4">{e.mileageKm ? `${e.mileageKm} km` : "—"}</td>
            <td className="py-1.5 pr-4">{e.cost ? formatEUR(e.cost) : "—"}</td>
            <td className="py-1.5 text-gray-500">{e.notes ?? ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
