import { Skeleton } from "@/components/ui/skeleton";
import { Container, Section } from "@/components/layout";

export default function ContactSkeleton() {
  return (
    <article
      role="status"
      aria-label="Loading contact page..."
      className="flex flex-col w-full"
    >
      <span className="sr-only">Loading contact page content...</span>

      {/* Hero Section Skeleton */}
      <Section variant="hero" bg="white" className="py-12 sm:py-16 lg:py-12 relative">
        <Container size="lg">
          <div className="flex flex-col max-w-2xl">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-12 sm:h-14 w-80 mb-4" />
            <Skeleton className="h-5 w-full max-w-lg" />
          </div>
        </Container>
      </Section>

      {/* Contact Form Card Skeleton */}
      <Section variant="default" bg="white" className="pt-8 sm:pt-12 pb-16 sm:pb-24 lg:pb-32">
        <Container size="lg">
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm">
            {/* Form Title & Subtitle */}
            <div className="mb-8">
              <Skeleton className="h-7 w-64 mb-2" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>

            {/* Input fields */}
            <div className="flex flex-col gap-6">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full rounded-md" />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-11 w-full rounded-md" />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-36 w-full rounded-md" />
              </div>

              {/* Submit button */}
              <Skeleton className="h-12 w-full rounded-md mt-2" />
            </div>
          </div>
        </Container>
      </Section>
    </article>
  );
}
