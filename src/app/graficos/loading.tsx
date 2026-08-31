import { PageHeadingSkeleton, CardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <PageHeadingSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardSkeleton className="h-72" />
        <CardSkeleton className="h-72" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardSkeleton className="h-72" />
        <CardSkeleton className="h-72" />
      </div>
    </div>
  );
}
