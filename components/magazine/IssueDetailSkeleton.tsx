import { Skeleton } from "@/components/ui/skeleton";
import { Container, Section } from "@/components/layout";

export default function IssueDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading publication details..."
      className="flex flex-col w-full bg-[#F8FAFC]"
    >
      <span className="sr-only">Loading digital issue...</span>

      {/* SECTION 1 — ISSUE HERO SKELETON */}
      <Section variant="hero" bg="white" className="py-16 sm:py-24 lg:py-28">
        <Container size="lg">
          {/* Back link */}
          <div className="mb-6 py-5">
            <Skeleton className="h-5 w-28 rounded" />
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center">
            {/* Left Column: Metadata & CTAs */}
            <div className="flex flex-col justify-center lg:col-span-5 order-1 lg:order-1 gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 sm:h-14 w-full max-w-sm mt-1" />
              <div className="flex flex-col gap-2.5 mt-3 max-w-xl">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Skeleton className="h-12 w-full sm:w-36 rounded-md" />
                <Skeleton className="h-12 w-full sm:w-36 rounded-md" />
              </div>
            </div>

            {/* Right Column: Portrait Cover Showcase */}
            <div className="lg:col-span-7 order-2 lg:order-2 flex justify-center items-center py-4 sm:py-6 lg:py-8">
              <Skeleton className="aspect-[3/4] w-full max-w-[250px] sm:max-w-[290px] lg:max-w-[320px] rounded-2xl shadow-md" />
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION 2 — DIGITAL ARCHIVE VIEWER SKELETON */}
      <Section
        variant="large"
        bg="transparent"
        divider
        className="py-16 sm:py-24 lg:py-32"
      >
        <Container size="lg">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-baseline border-b border-slate-200 pb-4">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-28" />
            </div>

            {/* Helper notice skeleton */}
            <Skeleton className="h-14 w-full rounded-xl" />

            {/* PDF Viewer Canvas Skeleton */}
            <Skeleton className="h-[400px] sm:h-[500px] lg:h-[700px] w-full rounded-xl" />
          </div>
        </Container>
      </Section>
    </div>
  );
}
