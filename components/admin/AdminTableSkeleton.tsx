import { Skeleton } from "@/components/ui/skeleton";

export interface AdminTableSkeletonProps {
  title?: string;
  subtitle?: string;
  showActionButton?: boolean;
}

export default function AdminTableSkeleton({
  title = "Manage Publications",
  subtitle = "Loading publication data...",
  showActionButton = true,
}: AdminTableSkeletonProps) {
  return (
    <div
      role="status"
      aria-label={`Loading ${title}...`}
      className="flex flex-col gap-6 animate-fade-in w-full"
    >
      <span className="sr-only">Loading {title}: {subtitle}</span>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-1.5" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        {showActionButton && (
          <Skeleton className="h-10 w-32 rounded-lg shrink-0" />
        )}
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-full sm:w-64 rounded-lg" />
      </div>

      {/* Table Card Skeleton */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="py-3 px-5 w-[80px]">
                  <Skeleton className="h-3.5 w-12" />
                </th>
                <th className="py-3 px-5 min-w-[280px]">
                  <Skeleton className="h-3.5 w-24" />
                </th>
                <th className="py-3 px-5">
                  <Skeleton className="h-3.5 w-16" />
                </th>
                <th className="py-3 px-5">
                  <Skeleton className="h-3.5 w-16" />
                </th>
                <th className="py-3 px-5 text-right">
                  <Skeleton className="h-3.5 w-16 ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F4]">
              {Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-5 w-[80px]">
                    <Skeleton className="w-14 h-[72px] rounded-lg" />
                  </td>
                  <td className="py-3.5 px-5">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-28 mb-1.5" />
                    <Skeleton className="h-3 w-full max-w-sm" />
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <Skeleton className="h-3.5 w-24" />
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] bg-white">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
