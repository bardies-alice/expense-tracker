import { PageHeadingSkeleton, CardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <PageHeadingSkeleton />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton className="h-24" />
        <CardSkeleton className="h-24" />
        <CardSkeleton className="h-24" />
        <CardSkeleton className="h-24" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardSkeleton className="h-72" />
        <CardSkeleton className="h-72" />
      </div>
      <CardSkeleton className="h-64" />
    </div>
  );
}
