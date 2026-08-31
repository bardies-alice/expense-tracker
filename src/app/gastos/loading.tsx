import { PageHeadingSkeleton, CardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeadingSkeleton />
      <CardSkeleton className="h-[500px]" />
    </div>
  );
}
