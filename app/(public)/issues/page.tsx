import type { Metadata } from "next";
import { Suspense } from "react";
import { Section, Container } from "@/components/layout";
import EmptyState from "@/components/magazine/EmptyState";
import { getAllPublishedIssues } from "@/lib/queries/issue";
import { toMagazineIssue } from "@/lib/queries/issue-adapter";
import ArchiveIssuesGrid from "@/components/magazine/ArchiveIssuesGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "All Issues | The Journal",
  description: "Browse every published issue of The Journal.",
};

export default async function AllIssuesPage() {
  const issues = await getAllPublishedIssues();

  return (
    <div className="flex flex-col w-full bg-[#F8FAFC]">
      <Section variant="hero" bg="white" className="py-16 sm:py-24 lg:py-32">
        <Container size="lg">
          {issues.length === 0 ? (
            <EmptyState />
          ) : (
            <Suspense fallback={<div className="min-h-[400px]" />}>
              <ArchiveIssuesGrid
                issues={issues.map(toMagazineIssue)}
                issueSource="home"
              />
            </Suspense>
          )}
        </Container>
      </Section>
    </div>
  );
}

