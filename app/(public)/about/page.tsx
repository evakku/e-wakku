import type { Metadata } from "next";
import { Section, Container } from "@/components/layout";
import {
  AboutHero,
  AboutNarrative,
  AboutLatestIssue,
} from "@/components/about";
import { getAboutPage, ABOUT_PAGE_DATA } from "@/lib/queries/about";
import { getLatestIssue } from "@/lib/queries/issue";
import type { Issue } from "@/lib/queries/issue";
import { getImageUrl } from "@/lib/utils/image";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Dynamic metadata generation for SEO
export async function generateMetadata(): Promise<Metadata> {
  let latestIssue: Issue | null = null;
  try {
    latestIssue = await getLatestIssue();
  } catch {
    // Graceful fallback if database query fails during metadata generation
  }

  const coverUrl = latestIssue?.cover_image_url
    ? getImageUrl(latestIssue.cover_image_url)
    : undefined;

  const pageTitle = "About E-Wakku | Malayalam Digital Magazine";
  const pageDescription =
    "Discover E-Wakku, a Malayalam digital magazine founded in 2025 by people passionate about digital literacy.";

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: coverUrl
        ? [
            {
              url: coverUrl,
              width: 1200,
              height: 1600,
              alt: `Cover of ${latestIssue?.title || "latest issue"} — E-Wakku Malayalam digital magazine`,
            },
          ]
        : [],
      type: "website",
      siteName: "E-Wakku",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: coverUrl ? [coverUrl] : [],
    },
  };
}

export default async function AboutPage() {
  const [aboutDataResult, latestIssueResult] = await Promise.allSettled([
    getAboutPage(),
    getLatestIssue(),
  ]);

  const aboutData =
    aboutDataResult.status === "fulfilled"
      ? aboutDataResult.value
      : ABOUT_PAGE_DATA;

  const latestIssue =
    latestIssueResult.status === "fulfilled" ? latestIssueResult.value : null;

  // Structured Data (JSON-LD) for Editorial About Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About E-Wakku | Malayalam Digital Magazine",
    description:
      "Discover E-Wakku, a Malayalam digital magazine founded in 2025 by people passionate about digital literacy.",
    publisher: {
      "@type": "Organization",
      name: "E-Wakku",
      url: "https://e-wakku.com",
      logo: {
        "@type": "ImageObject",
        url: "https://e-wakku.com/logo.png",
      },
    },
    mainEntity: {
      "@type": "Organization",
      name: "E-Wakku",
      foundingDate: "2025",
      description:
        "A Malayalam digital magazine founded in 2025 by people passionate about digital literacy.",
      knowsAbout: [
        "Malayalam Digital Magazine",
        "Digital Literacy",
        "Digital Publishing",
        "Technology and Society",
      ],
    },
  };

  return (
    <>
      {/* Structured SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="flex flex-col w-full">
        {/* Section 1: Hero Section */}
        <Section variant="hero" bg="white" className="py-16 sm:py-24 lg:py-28">
          <Container size="lg">
            <AboutHero
              eyebrow={aboutData.heroEyebrow}
              title={aboutData.heroTitle}
              description={aboutData.heroDescription}
            />
          </Container>
        </Section>

        {/* Sections 2, 3, 4: Narrative Sections (Our Story, Mission, Community) */}
        <Section variant="large" divider bg="white" className="py-16 sm:py-20 lg:py-24">
          <Container size="lg">
            <AboutNarrative data={aboutData} />
          </Container>
        </Section>

        {/* Section 5: Latest Issue Presentation */}
        <Section variant="large" bg="surface" divider className="py-16 sm:py-20 lg:py-24">
          <Container size="lg">
            <AboutLatestIssue
              issue={latestIssue}
              eyebrow={aboutData.latestIssueEyebrow}
              heading={aboutData.latestIssueHeading}
              description={aboutData.latestIssueDescription}
            />
          </Container>
        </Section>
      </article>
    </>
  );
}