import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="mt-2 h-5 w-56" />

      {/* Profile section */}
      <div className="mt-8 rounded-lg border p-6 space-y-6">
        <Skeleton className="h-6 w-24" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-24 w-full rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded" />
      </div>

      {/* Preferences section */}
      <div className="mt-6 rounded-lg border p-6 space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
