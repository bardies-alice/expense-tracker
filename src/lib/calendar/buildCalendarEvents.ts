import { addDays } from "date-fns";
import type { Item, MaintenanceComponent, MaintenanceEvent, Transaction } from "@prisma/client";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  kind: "expense" | "income" | "maintenance";
}

type TransactionRow = Transaction & { category: { name: string } };
type ComponentRow = MaintenanceComponent & { item: Item; events: MaintenanceEvent[] };

export function buildCalendarEvents(transactions: TransactionRow[], components: ComponentRow[]): CalendarEvent[] {
  const transactionEvents: CalendarEvent[] = transactions.map((t) => ({
    id: `tx-${t.id}`,
    title: `${t.type === "INCOME" ? "+" : "-"}${t.amount.toFixed(2)}€ · ${t.category.name}`,
    start: t.date,
    end: t.date,
    allDay: true,
    kind: t.type === "INCOME" ? "income" : "expense",
  }));

  const maintenanceEvents: CalendarEvent[] = [];
  for (const c of components) {
    const lastEvent = c.events[0];
    if (!lastEvent || c.intervalDays == null) continue;
    const dueDate = addDays(lastEvent.date, c.intervalDays);
    maintenanceEvents.push({
      id: `maint-${c.id}`,
      title: `Próximo: ${c.label} (${c.item.name})`,
      start: dueDate,
      end: dueDate,
      allDay: true,
      kind: "maintenance",
    });
  }

  return [...transactionEvents, ...maintenanceEvents];
}
