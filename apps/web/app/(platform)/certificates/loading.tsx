import { Skeleton } from "@/components/ui/skeleton";

export default function CertificatesLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-2 h-5 w-72" />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="mt-4 h-5 w-40" />
            <Skeleton className="mt-2 h-4 w-56" />
            <div className="mt-4 flex items-center gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="mt-4 h-9 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
