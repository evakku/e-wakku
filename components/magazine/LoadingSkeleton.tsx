import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading latest issues..."
      className="flex flex-col gap-16 lg:gap-24 w-full"
    >
      <span className="sr-only">Loading publications...</span>

      {/* 1. Featured Issue Hero Skeleton */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center">
        {/* Left Column Text details */}
        <div className="flex flex-col lg:col-span-5 order-1 lg:order-1 gap-4">
          {/* Eyebrow */}
          <Skeleton className="h-4 w-28" />
          {/* Title */}
          <Skeleton className="h-12 sm:h-14 w-full max-w-sm mt-1" />
          {/* Description paragraphs */}
          <div className="flex flex-col gap-2.5 mt-3 max-w-xl">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          {/* Buttons row */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Skeleton className="h-12 w-full sm:w-36 rounded-md" />
            <Skeleton className="h-12 w-full sm:w-36 rounded-md" />
          </div>
        </div>

        {/* Right Column Cover Image container */}
        <div className="lg:col-span-7 order-2 lg:order-2 flex justify-center items-center py-4 sm:py-6">
          <Skeleton className="aspect-[3/4] w-full max-w-[250px] sm:max-w-[290px] lg:max-w-[320px] rounded-2xl shadow-md" />
        </div>
      </div>

      {/* 2. Past Issues Grid Skeleton */}
      <div className="flex flex-col gap-8 w-full pt-8 border-t border-slate-200/60">
        {/* Header */}
        <div className="flex justify-between items-baseline border-b border-border/40 pb-4">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Grid cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-[20px] border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-sm gap-4"
            >
              {/* Inner Cover Aspect-4/3 */}
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              {/* Title */}
              <Skeleton className="h-6 w-3/4 mt-1" />
              {/* Description */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
              {/* Month */}
              <Skeleton className="h-3.5 w-24 mt-1" />
              {/* Button */}
              <Skeleton className="h-9 w-28 rounded-xl mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
