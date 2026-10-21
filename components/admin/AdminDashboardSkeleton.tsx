import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading admin dashboard..."
      className="flex flex-col gap-8 animate-fade-in w-full"
    >
      <span className="sr-only">Loading editorial dashboard metrics and data...</span>

      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-56 mb-1.5" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* 6 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between h-[120px]"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="mt-3">
              <Skeleton className="h-7 w-12 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid: Recent Publications & Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Issues Table Skeleton */}
        <div className="lg:col-span-7 xl:col-span-8 rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
            <div>
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-3.5 w-56" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="w-12 h-16 rounded-md shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Enquiries Skeleton */}
        <div className="lg:col-span-5 xl:col-span-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
            <div>
              <Skeleton className="h-5 w-36 mb-1" />
              <Skeleton className="h-3.5 w-48" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="flex items-start gap-4 px-6 py-4">
                <Skeleton className="size-9 rounded-full shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
