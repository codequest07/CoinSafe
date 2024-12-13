import { Skeleton } from "@/components/ui/skeleton";

export default function DashLoadingskeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Top bar skeleton */}
      <Skeleton className="h-12 w-full rounded-lg" />

      {/* Two column section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>

      {/* Full width bottom section */}
      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  );
}
