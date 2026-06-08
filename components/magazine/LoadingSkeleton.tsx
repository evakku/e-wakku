import { Container } from "@/components/layout";

export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-24 w-full">
      {/* 1. Featured Issue Hero Skeleton */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center animate-pulse">
        {/* Left Column Text details */}
        <div className="flex flex-col lg:col-span-5 order-1 lg:order-1 gap-4">
          {/* Eyebrow */}
          <div className="h-4 w-24 bg-muted rounded" />
          {/* Title */}
          <div className="h-14 w-full max-w-sm bg-muted rounded mt-2" />
          {/* Description paragraphs */}
          <div className="flex flex-col gap-2 mt-4">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
          {/* Buttons row */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="h-12 w-36 bg-muted rounded-md" />
            <div className="h-12 w-36 bg-muted rounded-md" />
          </div>
        </div>

        {/* Right Column Cover Image container */}
        <div className="lg:col-span-7 order-2 lg:order-2">
          <div className="aspect-[7/5] w-full bg-muted rounded-2xl" />
        </div>
      </div>

      {/* 2. Past Issues Grid Skeleton */}
      <div className="flex flex-col gap-8 w-full animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-baseline border-b border-border/40 pb-4">
          <div className="h-8 w-36 bg-muted rounded" />
          <div className="h-4 w-28 bg-muted rounded" />
        </div>

        {/* Grid cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              {/* Cover Aspect-4/5 */}
              <div className="aspect-[4/5] w-full bg-muted rounded-lg" />
              {/* Title & icon */}
              <div className="flex justify-between items-center gap-4 mt-2">
                <div className="h-6 w-1/2 bg-muted rounded" />
                <div className="h-4 w-4 bg-muted rounded-full" />
              </div>
              {/* Subtitle */}
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
