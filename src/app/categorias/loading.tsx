import { PageHeadingSkeleton, CardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeadingSkeleton />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} className="h-[124px]" />
        ))}
      </div>
    </div>
  );
}
