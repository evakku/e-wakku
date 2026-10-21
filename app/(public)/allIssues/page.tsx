import { Suspense } from "react";
import type { Metadata } from "next";
import { Section, Container } from "@/components/layout";
import ArchiveIssuesGrid from "@/components/magazine/ArchiveIssuesGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllPublishedIssues } from "@/lib/queries/issue";
import { toMagazineIssue } from "@/lib/queries/issue-adapter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "All Issues",
  description: "Browse every published issue of E-Wakku — covers, editions, and full digital archives.",
};

export default async function AllIssuesPage() {
  const rows = await getAllPublishedIssues();
  const issues = rows.map(toMagazineIssue);

  return (
    <div className="flex flex-col w-full bg-[#F8FAFC]">
      <Section variant="hero" bg="transparent" className="pt-[90px] pb-3 sm:pt-[100px] sm:pb-2">
        <Container size="lg">
          <div className="flex flex-col items-start text-left">
            <span className="mb-3 sm:mb-4 text-xs sm:text-sm font-medium uppercase tracking-[0.15em] text-[#0F766E]">
              Curated Collections
            </span>

            <h1 className="mb-3.5 sm:mb-4 font-serif text-[40px] sm:text-[48px] font-normal leading-tight text-[#111827] md:text-[56px]">
              All Issues
            </h1>

            <p className="mb-0 max-w-[650px] text-[15px] sm:text-[16px] leading-relaxed text-[#4B5563] md:text-[18px]">
              Browse every published issue — covers, editions, and full digital
              archives from E-Wakku.
            </p>
          </div>
        </Container>
      </Section>

      <Section
        variant="large"
        bg="transparent"
        className="!pt-0 !mt-0"
      >
        <Container size="lg">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
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
            }
          >
            <ArchiveIssuesGrid issues={issues} />
          </Suspense>
        </Container>
      </Section>
    </div>
  );
}
