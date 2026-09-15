export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-border ${className}`} />;
}

export function PageHeadingSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-[30px] w-[30px] rounded-[9px]" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return <Skeleton className={`rounded-lg ${className}`} />;
}
