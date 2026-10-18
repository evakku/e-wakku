import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIssueById } from "@/lib/queries/issue";
import { toDetailIssue } from "@/lib/queries/issue-adapter";
import IssueDetailsView from "@/app/issues/[slug]/IssueDetailsView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const row = await getIssueById(slug);

  if (!row) {
    return {
      title: "Issue Not Found",
      description: "The requested magazine issue could not be found.",
    };
  }

  const issue = toDetailIssue(row);

  return {
    title: issue.title,
    description: `${issue.season} ${issue.year} — ${issue.description.substring(0, 100)}...`,
    openGraph: {
      title: `${issue.title} | E-Wakku`,
      description: `${issue.season} ${issue.year} — ${issue.title}`,
      images: issue.coverImage
        ? [{ url: issue.coverImage, width: 800, height: 1067, alt: `Cover art for ${issue.title}` }]
        : [],
      type: "article",
      siteName: "E-Wakku",
    },
  };
}

export default async function IssueSingularPage({ params }: PageProps) {
  const { slug } = await params;
  const row = await getIssueById(slug);

  if (!row) {
    notFound();
  }

  return <IssueDetailsView issue={toDetailIssue(row)} />;
}
