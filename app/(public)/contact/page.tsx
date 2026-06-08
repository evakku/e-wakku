import type { Metadata } from "next";
import { Section, Container } from "@/components/layout";
import { ContactHero, ContactForm, DirectContact, SocialLinks } from "@/components/contact";
import { getContactPage } from "@/lib/sanity/client";

// Dynamic metadata generation for SEO
export async function generateMetadata(): Promise<Metadata> {
  const contactData = await getContactPage();

  return {
    title: "Contact | The Journal",
    description: contactData.contactDescription || "Get in touch with The Journal editorial team.",
    openGraph: {
      title: "Contact | The Journal",
      description: contactData.contactDescription || "Get in touch with The Journal editorial team.",
      type: "website",
      siteName: "The Journal",
    },
  };
}

export default async function ContactPage() {
  const contactData = await getContactPage();

  // Structured Data (JSON-LD) for Editorial Contact Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact The Journal",
    "description": "Get in touch with The Journal's editorial, archives, or licensing team.",
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
      "email": contactData.contactEmail,
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
        <Section variant="hero" bg="white" className="pb-8 lg:pb-12">
          <Container size="lg">
            <ContactHero
              title={contactData.contactTitle}
              description={contactData.contactDescription}
            />
          </Container>
        </Section>

        {/* Section 2: Contact Form Card */}
        <Section variant="default" bg="white" className="pt-0 pb-10">
          <Container size="lg">
            <ContactForm />
          </Container>
        </Section>

        {/* Section 3: Direct Contact */}
        <Section variant="compact" bg="white" className="py-6">
          <Container size="lg">
            <DirectContact email={contactData.contactEmail} />
          </Container>
        </Section>

        {/* Section 4: Social Links */}
        {contactData.socialLinks && contactData.socialLinks.length > 0 && (
          <Section variant="compact" bg="white" className="pt-6 pb-16">
            <Container size="lg">
              <SocialLinks links={contactData.socialLinks} />
            </Container>
          </Section>
        )}
      </article>
    </>
  );
}
