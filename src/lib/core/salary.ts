// Salary usually lands on the last days of the month, but that money isn't really available
// to spend until the month it's meant to cover. This only affects which month a salary
// transaction is *attributed to* in monthly summaries/charts — it never changes the real
// transaction date, since that's what current balance and the calendar rely on to be accurate.
// Day 1-2 is left in its own month: that already reads as "next month" (or payroll running a
// day or two late), not a case that needs pushing forward again.
export function budgetMonthKey(date: Date, categorySlug: string | null | undefined): string {
  const shifted = categorySlug === "salario" && date.getDate() > 2 ? new Date(date.getFullYear(), date.getMonth() + 1, 1) : date;
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}
