// Salary usually lands on the last days of the month, but that money isn't really
// available until the month it's meant to cover — so we book it on the 1st of the
// following month. Day 1-2 is left alone: that's already next month (or payroll
// running a day or two late), not a case that needs shifting forward again.
export function normalizeSalaryDate(date: Date): Date {
  if (date.getDate() <= 2) return date;
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}
