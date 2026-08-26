import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <div className="flex flex-col w-full bg-[#F8FAFC]">
      <Section variant="hero" bg="white" className="py-16 sm:py-24 lg:py-32">
        <Container size="lg">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-[#0F766E] hover:text-[#0D9488] transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
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
