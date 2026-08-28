"use client";

import { Calendar, dateFnsLocalizer, type EventProps } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { CalendarEvent } from "@/lib/calendar/buildCalendarEvents";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales: { es },
});

const KIND_COLOR: Record<CalendarEvent["kind"], string> = {
  income: "#10b981",
  expense: "#6366f1",
  maintenance: "#f59e0b",
};

function EventItem({ event }: EventProps<CalendarEvent>) {
  return <span title={event.title}>{event.title}</span>;
}

const MESSAGES = {
  today: "Hoy",
  previous: "Atrás",
  next: "Siguiente",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay eventos en este rango.",
};

export function AppCalendar({ events }: { events: CalendarEvent[] }) {
  return (
    <div className="h-[650px] rounded-lg border border-gray-200 bg-white p-3">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        culture="es"
        messages={MESSAGES}
        components={{ event: EventItem }}
        eventPropGetter={(event: CalendarEvent) => ({
          style: { backgroundColor: KIND_COLOR[event.kind], border: "none" },
        })}
      />
    </div>
  );
}
