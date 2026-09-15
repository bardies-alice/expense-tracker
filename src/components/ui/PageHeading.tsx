export function PageHeading({ title, subtitle }: { title: React.ReactNode; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-[30px] w-[30px] shrink-0 rounded-[9px] bg-ink" />
      <div>
        <h1 className="m-0 font-display text-xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
