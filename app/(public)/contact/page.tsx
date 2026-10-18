import type { Metadata } from "next";
import { Section, Container } from "@/components/layout";
import { ContactHero, ContactForm } from "@/components/contact";
import { getContactPage } from "@/lib/queries/contact-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Dynamic metadata generation for SEO
export async function generateMetadata(): Promise<Metadata> {
  const contactData = getContactPage();

  return {
    title: "Contact",
    description: contactData.contactDescription || "Get in touch with the E-Wakku editorial team.",
    openGraph: {
      title: "Contact | E-Wakku",
      description: contactData.contactDescription || "Get in touch with the E-Wakku editorial team.",
      type: "website",
      siteName: "E-Wakku",
    },
  };
}

export default function ContactPage() {
  const contactData = getContactPage();

  // Structured Data (JSON-LD) for Editorial Contact Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact E-Wakku",
    "description": "Get in touch with E-Wakku's editorial, archives, or licensing team.",
    "publisher": {
      "@type": "Organization",
      "name": "E-Wakku Publishing",
      "logo": {
        "@type": "ImageObject",
        "url": "https://e-wakku.com/logo.png",
      },
    },
    "mainEntity": {
      "@type": "Organization",
      "name": "E-Wakku",

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
        <Section variant="hero" bg="white" className="py-12 sm:py-16 lg:py-12 relative">
          <Container size="lg">
            <ContactHero
              title={contactData.contactTitle}
              description={contactData.contactDescription}
            />
          </Container>
        </Section>

        {/* Section 2: Contact Form Card */}
        <Section variant="default" bg="white" className="pt-8 sm:pt-12 pb-16 sm:pb-24 lg:pb-32">
          <Container size="lg">
            <ContactForm />
          </Container>
        </Section>
      </article>
    </>
  );
}