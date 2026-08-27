import type { Metadata } from "next";
import { Section, Container } from "@/components/layout";
import { AboutHero, MissionSection, EditorialBoard } from "@/components/about";
import { getAboutPage, getImageUrl } from "@/lib/sanity/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Dynamic metadata generation for SEO
export async function generateMetadata(): Promise<Metadata> {
  const aboutData = await getAboutPage();
  const coverUrl = aboutData.missionImage
    ? getImageUrl(aboutData.missionImage)
    : "/images/media__1780745927835.png";

  return {
    title: "About | The Journal",
    description: "Learn about The Journal's editorial mission, philosophy, and team.",
    openGraph: {
      title: "About | The Journal",
      description: "Learn about The Journal's editorial mission, philosophy, and team.",
      images: coverUrl ? [{ url: coverUrl, width: 1200, height: 857, alt: "The Journal Mission Image" }] : [],
      type: "website",
      siteName: "The Journal",
    },
  };
}

export default async function AboutPage() {
  const aboutData = await getAboutPage();

  // Structured Data (JSON-LD) for Editorial About Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About The Journal",
    "description": "Learn about The Journal's editorial mission, philosophy, and team.",
    "publisher": {
      "@type": "Organization",
      "name": "The Journal Publishing",
      "logo": {
        "@type": "ImageObject",
        "url": "https://e-wakku.com/logo.png",
      },
    },
    "mainEntity": {
      "@type": "Organization",
      "name": "The Journal",
      "foundingDate": "2024",
      "knowsAbout": ["Culture", "Design", "Aesthetic Living", "In-depth Journalism"],
      "employee": aboutData.editorialBoard?.map((member) => ({
        "@type": "Person",
        "name": member.name,
        "jobTitle": member.role,
      })) || [],
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
        <Section variant="hero" bg="white">
          <Container size="lg">
            <AboutHero
              eyebrow={aboutData.heroEyebrow}
              title={aboutData.heroTitle}
              description={aboutData.heroDescription}
            />
          </Container>
        </Section>

        {/* Section 2: Mission Section */}
        <Section variant="large" divider bg="white">
          <Container size="lg">
            <MissionSection
              title={aboutData.missionTitle}
              description={aboutData.missionDescription}
              image={aboutData.missionImage}
            />
          </Container>
        </Section>

        {/* Section 3: Editorial Board Section */}
        {aboutData.editorialBoard && aboutData.editorialBoard.length > 0 && (
          <Section variant="large" divider bg="white">
            <Container size="lg">
              <EditorialBoard
                title="Editorial Board"
                members={aboutData.editorialBoard}
              />
            </Container>
          </Section>
        )}

        {/* Section 4: Future Expansion Areas */}
        {/*
          This container is structured for future modules
          (e.g., brand partners, submissions, or editorial guidelines)
        */}
      </article>
    </>
  );
}
