import { Skeleton } from "@/components/ui/skeleton";
import { Container, Section } from "@/components/layout";

export default function ArchiveSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading digital archive..."
      className="flex flex-col w-full bg-[#F8FAFC]"
    >
      <span className="sr-only">Loading digital archive collection...</span>

      {/* Hero Header Skeleton */}
      <Section variant="hero" bg="transparent" className="pt-[90px] pb-3 sm:pt-[100px] sm:pb-2">
        <Container size="lg">
          <div className="flex flex-col items-start text-left">
            <Skeleton className="h-4 w-36 mb-4" />
            <Skeleton className="h-12 sm:h-14 w-64 mb-4" />
            <Skeleton className="h-5 w-full max-w-xl" />
          </div>
        </Container>
      </Section>

      {/* Filter Bar & Grid Skeleton */}
      <Section variant="large" bg="transparent" className="!pt-0 !mt-0 pb-16">
        <Container size="lg">
          <div className="flex flex-col gap-8 w-full">
            {/* Filter buttons & search bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-slate-200 pb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <Skeleton className="h-9 w-16 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
            </div>

            {/* 8 Issue Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col rounded-[20px] border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-sm gap-4"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <Skeleton className="h-6 w-4/5 mt-1" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-3/4" />
                  </div>
                  <Skeleton className="h-3.5 w-24 mt-1" />
                  <Skeleton className="h-9 w-28 rounded-xl mt-2" />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
