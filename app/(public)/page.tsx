import type { Metadata } from "next";
import { Section, Container } from "@/components/layout";
import HomeHero from "@/components/magazine/HomeHero";
import IssueArchiveGrid from "@/components/magazine/IssueArchiveGrid";
import EmptyState from "@/components/magazine/EmptyState";
import { getLatestIssue, getAllPublishedIssues } from "@/lib/queries/issue";
import { toMagazineIssue } from "@/lib/queries/issue-adapter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Dynamic metadata generation for SEO
export async function generateMetadata(): Promise<Metadata> {
  const featuredIssue = await getLatestIssue();
  const coverUrl = featuredIssue?.cover_image_url ?? "/images/october-2024.png";

  return {
    title: "The Journal | Premium Digital Magazine",
    description: "A curated collection of modern thought, culture, design, and editorial storytelling.",
    openGraph: {
      title: "The Journal | Premium Digital Magazine",
      description: "A curated collection of modern thought, culture, design, and editorial storytelling.",
      images: coverUrl ? [{ url: coverUrl, width: 1200, height: 857, alt: "Latest Issue Cover" }] : [],
      type: "website",
      siteName: "The Journal",
    },
  };
}

export default async function HomePage() {
  const [featuredIssue, allPublished] = await Promise.all([
    getLatestIssue(),
    getAllPublishedIssues(),
  ]);

  if (!featuredIssue) {
    return (
      <Section variant="hero" bg="white" className="flex flex-1 items-center justify-center">
        <Container size="lg">
          <EmptyState />
        </Container>
      </Section>
    );
  }

  // Get up to 3 published issues for the centered 3-card home grid
  const recentIssues = allPublished.length >= 3 ? allPublished.slice(0, 3) : allPublished;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Periodical",
    "name": "The Journal",
    "description": "A curated collection of modern thought, culture, design, and editorial storytelling.",
    "publisher": {
      "@type": "Organization",
      "name": "The Journal Publishing",
      "logo": {
        "@type": "ImageObject",
        "url": "https://e-wakku.com/logo.png",
      },
    },
  };

  return (
    <>
      {/* Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col w-full bg-[#F8FAFC]">
        {/* Section 1: Hero / Latest Featured Issue (Centered in section) */}
        <Section variant="hero" bg="white" className="py-12 sm:py-20">
          <Container size="lg">
            <HomeHero issue={toMagazineIssue(featuredIssue)} />
          </Container>
        </Section>

        {/* Section 2: ISSUES (Centered 3-Card Grid with Generous Footer Spacing) */}
        {recentIssues.length > 0 && (
          <Section variant="large" bg="transparent" className="py-16 sm:py-24 pb-24 sm:pb-36">
            <Container size="lg">
              <IssueArchiveGrid
                issues={recentIssues.map(toMagazineIssue)}
                title="ISSUES"
                viewAllPlacement="header"
              />
            </Container>
          </Section>
        )}
      </div>
    </>
  );
}