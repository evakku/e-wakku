import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAnalyticsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading analytics..."
      className="flex flex-col gap-8 animate-fade-in w-full"
    >
      <span className="sr-only">Loading publication analytics...</span>

      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-60 mb-1.5" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between h-[130px]"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="mt-3">
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Activity Card Skeleton */}
        <div className="lg:col-span-8 rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-44 mb-1" />
              <Skeleton className="h-3.5 w-60" />
            </div>
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
          {/* Chart placeholder bars */}
          <div className="h-64 flex items-end gap-3 pt-6 pb-2 border-b border-slate-100">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <Skeleton
                  className="w-full rounded-t-md"
                  style={{ height: `${20 + ((idx * 17) % 75)}%` }}
                />
                <Skeleton className="h-3 w-6" />
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Summary Skeleton */}
        <div className="lg:col-span-4 rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-4">
          <Skeleton className="h-5 w-40 mb-2" />
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
