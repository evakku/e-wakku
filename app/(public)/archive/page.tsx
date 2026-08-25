import type { Metadata } from "next";
import { Section, Container } from "@/components/layout";
import ArchiveIssuesGrid from "@/components/magazine/ArchiveIssuesGrid";
import NewsletterCTA from "@/components/magazine/NewsletterCTA";
import { getAllPublishedIssues, getNewsletterSettings } from "@/lib/queries/issue";
import { toMagazineIssue } from "@/lib/queries/issue-adapter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Archives | The Journal",
  description: "Browse every published issue of The Journal.",
};

export default async function ArchivePage() {
  const [rows, newsletterSettings] = await Promise.all([
    getAllPublishedIssues(),
    Promise.resolve(getNewsletterSettings()),
  ]);

  const issues = rows.map(toMagazineIssue);

  return (
    <div className="flex flex-col w-full bg-[#F8FAFC]">
      <Section variant="hero" bg="transparent" className="pt-[100px] pb-6">
        <Container size="lg">
          <div className="flex flex-col items-start text-left">
            <span className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-[#0F766E]">
              Curated Collections
            </span>
            <h1 className="mb-4 font-serif text-[48px] font-normal leading-tight text-[#111827] md:text-[56px]">
              Archives
            </h1>
            <p className="mb-0 max-w-[650px] text-[16px] leading-relaxed text-[#4B5563] md:text-[18px]">
              Browse every published issue — covers, editions, and full digital archives from The Journal.
            </p>
          </div>
        </Container>
      </Section>

      <Section variant="large" bg="transparent" className="pt-0">
        <Container size="lg">
          <ArchiveIssuesGrid issues={issues} />
        </Container>
      </Section>

      <Section variant="large" divider bg="surface">
        <Container size="lg">
          <NewsletterCTA settings={newsletterSettings} />
        </Container>
      </Section>
    </div>
  );
}
