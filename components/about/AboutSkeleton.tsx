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

      {/* Hero Section Skeleton */}
      <Section variant="hero" bg="white" className="py-16 sm:py-24 lg:py-32">
        <Container size="lg">
          <div className="flex flex-col max-w-3xl">
            <Skeleton className="h-4 w-28 mb-4" />
            <Skeleton className="h-12 sm:h-14 w-full max-w-lg mb-6" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Mission Section Skeleton */}
      <Section variant="large" divider bg="white" className="py-16 sm:py-24 lg:py-32">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column Content */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-3/4 mb-2" />
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Right Column Image */}
            <div className="lg:col-span-6">
              <Skeleton className="aspect-[4/3] w-full rounded-2xl shadow-sm" />
            </div>
          </div>
        </Container>
      </Section>
    </article>
  );
}
