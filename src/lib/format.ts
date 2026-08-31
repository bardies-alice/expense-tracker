const eurFormatter = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function formatEUR(amount: number) {
  return eurFormatter.format(amount);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
}

export function formatMonthShort(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString("es-ES", { month: "short" });
  return label.charAt(0).toUpperCase() + label.slice(1).replace(".", "");
}
