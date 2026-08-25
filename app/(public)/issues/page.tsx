import type { Metadata } from "next";
import { Section, Container } from "@/components/layout";
import IssueArchiveGrid from "@/components/magazine/IssueArchiveGrid";
import EmptyState from "@/components/magazine/EmptyState";
import { getAllPublishedIssues } from "@/lib/queries/issue";
import { toMagazineIssue } from "@/lib/queries/issue-adapter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "All Issues | The Journal",
  description: "Browse every published issue of The Journal.",
};

export default async function AllIssuesPage() {
  const issues = await getAllPublishedIssues();

  return (
    <div className="flex flex-col w-full">
      <Section variant="hero" bg="white">
        <Container size="lg">
          {issues.length === 0 ? (
            <EmptyState />
          ) : (
            <IssueArchiveGrid
              issues={issues.map(toMagazineIssue)}
              title="All Issues"
              showViewAll={false}
              issueSource="home"
            />
          )}
        </Container>
      </Section>
    </div>
  );
}
