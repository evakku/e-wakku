import type { Metadata } from "next";
import { Section, Container } from "@/components/layout";
import HomeHero from "@/components/magazine/HomeHero";
import IssueArchiveGrid from "@/components/magazine/IssueArchiveGrid";
import NewsletterCTA from "@/components/magazine/NewsletterCTA";
import EmptyState from "@/components/magazine/EmptyState";
import { getFeaturedIssue, getRecentIssues, getNewsletterSettings, getImageUrl } from "@/lib/sanity/client";

// Dynamic metadata generation for SEO
export async function generateMetadata(): Promise<Metadata> {
  const featuredIssue = await getFeaturedIssue();
  const coverUrl = featuredIssue ? getImageUrl(featuredIssue.coverImage) : "/images/october-2024.png";

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
  // Parallel fetching of CMS/fallback data
  const [featuredIssue, newsletterSettings] = await Promise.all([
    getFeaturedIssue(),
    getNewsletterSettings(),
  ]);

  // Handle case where no publications exist
  if (!featuredIssue) {
    return (
      <Section variant="hero" bg="white" className="flex flex-1 items-center justify-center">
        <Container size="lg">
          <EmptyState />
        </Container>
      </Section>
    );
  }

  // Fetch recent issues excluding the featured one
  const recentIssues = await getRecentIssues(featuredIssue._id);

  // Structured Data (JSON-LD) for Periodical / Magazine
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

      <div className="flex flex-col w-full">
        {/* Section 1: Hero / Latest Issue */}
        <Section variant="hero" bg="white">
          <Container size="lg">
            <HomeHero issue={featuredIssue} />
          </Container>
        </Section>

        {/* Section 2: Past Issues Grid */}
        {recentIssues.length > 0 && (
          <Section variant="large" divider bg="white">
            <Container size="lg">
              <IssueArchiveGrid issues={recentIssues} />
            </Container>
          </Section>
        )}

        {/* Section 3: Newsletter subscription CTA */}
        <Section variant="large" divider bg="surface">
          <Container size="lg">
            <NewsletterCTA settings={newsletterSettings} />
          </Container>
        </Section>
      </div>
    </>
  );
}
