export function PageHeading({ title, subtitle }: { title: React.ReactNode; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-[30px] w-[30px] shrink-0 rounded-[9px]"
        style={{ background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)" }}
      />
      <div>
        <h1 className="m-0 text-xl font-bold tracking-tight text-gray-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
