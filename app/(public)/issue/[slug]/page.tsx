import type { Metadata } from "next";
import { getIssueBySlug } from "@/data/mockIssue";
import IssueDetailsView from "@/app/issues/[slug]/IssueDetailsView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Reuse dynamic metadata generation for /issue/[slug] route
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const issue = getIssueBySlug(resolvedParams.slug);

  if (!issue) {
    return {
      title: "Issue Not Found | The Journal",
      description: "The requested magazine issue could not be found.",
    };
  }

  return {
    title: `${issue.title} | The Journal`,
    description: `Explore Issue ${issue.issueNumber} of The Journal. ${issue.description.substring(0, 100)}...`,
    openGraph: {
      title: `${issue.title} | The Journal`,
      description: `Explore Issue ${issue.issueNumber} of The Journal.`,
      images: [
        {
          url: issue.coverImage,
          width: 800,
          height: 1067,
          alt: `Cover art for ${issue.title}`,
        },
      ],
      type: "article",
      siteName: "The Journal",
    },
  };
}

export default async function IssueSingularPage({ params }: PageProps) {
  const resolvedParams = await params;

  return <IssueDetailsView slug={resolvedParams.slug} />;
}
