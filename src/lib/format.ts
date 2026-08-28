const eurFormatter = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function formatEUR(amount: number) {
  return eurFormatter.format(amount);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
}
