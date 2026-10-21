import { Skeleton } from "@/components/ui/skeleton";
import { Container, Section } from "@/components/layout";

export default function AboutSkeleton() {
  return (
    <article
      role="status"
      aria-label="Loading about page..."
      className="flex flex-col w-full"
    >
      <span className="sr-only">Loading about page content...</span>

      {/* ── Section 1: Hero Skeleton ──────────────────────────────────── */}
      <Section variant="hero" bg="white" className="py-16 sm:py-24 lg:py-28">
        <Container size="lg">
          <div className="flex flex-col items-center text-center max-w-[900px] mx-auto w-full">
            <Skeleton className="h-4 w-32 mb-6" />
            <Skeleton className="h-12 sm:h-16 w-full max-w-3xl mb-8" />
            <div className="flex flex-col gap-3 w-full max-w-2xl">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12 mx-auto" />
              <Skeleton className="h-4 w-4/5 mx-auto" />
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Section 2, 3, 4: Narrative Sections Skeleton ─────────────── */}
      <Section variant="large" divider bg="white" className="py-16 sm:py-20 lg:py-24">
        <Container size="lg">
          <div className="flex flex-col gap-16 max-w-5xl mx-auto w-full">
            {/* Story Skeleton */}
            <div className="flex flex-col w-full">
              <Skeleton className="h-3 w-24 mb-4" />
              <Skeleton className="h-8 sm:h-10 w-2/3 max-w-md mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex flex-col gap-2.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>

            {/* Mission & Community Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 pt-12 border-t border-[#E2E8F0]">
              <div className="flex flex-col">
                <Skeleton className="h-3 w-24 mb-4" />
                <Skeleton className="h-8 w-3/4 mb-5" />
                <div className="flex flex-col gap-2.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <div className="flex flex-col">
                <Skeleton className="h-3 w-28 mb-4" />
                <Skeleton className="h-8 w-2/3 mb-5" />
                <div className="flex flex-col gap-2.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Section 5: Latest Issue Skeleton ─────────────────────────── */}
      <Section variant="large" bg="surface" divider className="py-16 sm:py-20 lg:py-24">
        <Container size="lg">
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-12 lg:p-16 shadow-sm max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              <div className="lg:col-span-7 flex flex-col gap-4 order-2 lg:order-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-12 w-48 rounded-md mt-2" />
              </div>
              <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
                <Skeleton className="aspect-[3/4] w-full max-w-[280px] rounded-2xl" />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </article>
  );
}
