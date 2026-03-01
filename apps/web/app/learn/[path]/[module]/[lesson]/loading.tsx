import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Title */}
      <Skeleton className="mt-6 h-10 w-3/4" />
      <Skeleton className="mt-3 h-5 w-1/2" />

      {/* Content skeleton */}
      <div className="mt-8 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />

        {/* Code block skeleton */}
        <Skeleton className="mt-6 h-40 w-full rounded-lg" />

        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        {/* Another code block */}
        <Skeleton className="mt-6 h-32 w-full rounded-lg" />

        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Navigation */}
      <div className="mt-12 flex items-center justify-between border-t pt-6">
        <Skeleton className="h-10 w-28 rounded" />
        <Skeleton className="h-10 w-28 rounded" />
      </div>
    </div>
  );
}
