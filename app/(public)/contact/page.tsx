import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Section, Container } from "@/components/layout";
import { ContactHero, ContactForm } from "@/components/contact";
import { getContactPage } from "@/lib/queries/contact-settings";

// Dynamic metadata generation for SEO
export async function generateMetadata(): Promise<Metadata> {
  const contactData = getContactPage();

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

export default function ContactPage() {
  const contactData = getContactPage();

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
        <Section variant="hero" bg="white" className="py-12 sm:py-16 lg:py-20 relative">
          <Link href="/" className="mb-6 hidden md:inline-flex items-center text-[#0F766E] hover:text-[#0D9488] transition-colors absolute top-15 left-50">
            <ArrowLeft size={20} className="mr-2" />
            <span className="text-sm font-medium">Back</span>
          </Link>
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