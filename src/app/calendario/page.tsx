import { listTransactions } from "@/lib/core/transactionService";
import { listAllComponentsWithLatestEvent } from "@/lib/core/maintenanceService";
import { buildCalendarEvents } from "@/lib/calendar/buildCalendarEvents";
import { AppCalendar } from "@/components/calendar/AppCalendar";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const [transactions, components] = await Promise.all([
    listTransactions(),
    listAllComponentsWithLatestEvent(),
  ]);

  const events = buildCalendarEvents(transactions, components);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Calendario</h1>
      <AppCalendar events={events} />
    </div>
  );
}
