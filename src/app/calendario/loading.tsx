import { PageHeadingSkeleton, CardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeadingSkeleton />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <CardSkeleton className="h-[500px]" />
        <CardSkeleton className="h-[200px]" />
      </div>
    </div>
  );
}
