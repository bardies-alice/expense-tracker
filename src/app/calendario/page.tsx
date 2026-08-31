import { listTransactions } from "@/lib/core/transactionService";
import { listAllComponentsWithLatestEvent } from "@/lib/core/maintenanceService";
import { buildCalendarEvents } from "@/lib/calendar/buildCalendarEvents";
import { AppCalendar } from "@/components/calendar/AppCalendar";
import { PageHeading } from "@/components/ui/PageHeading";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const [transactions, components] = await Promise.all([
    listTransactions(),
    listAllComponentsWithLatestEvent(),
  ]);

  const events = buildCalendarEvents(transactions, components);

  return (
    <div className="space-y-6">
      <PageHeading title="Calendario" subtitle="Tus movimientos día a día" />
      <AppCalendar events={events} />
    </div>
  );
}
