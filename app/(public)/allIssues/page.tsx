import type { Metadata } from "next";
import { Section, Container } from "@/components/layout";
import ArchiveIssuesGrid from "@/components/magazine/ArchiveIssuesGrid";
import { getAllPublishedIssues, getNewsletterSettings } from "@/lib/queries/issue";
import { toMagazineIssue } from "@/lib/queries/issue-adapter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "All Issues | The Journal",
  description: "Browse every published issue of The Journal — covers, editions, and full digital archives.",
};

export default async function AllIssuesPage() {
  const [rows, newsletterSettings] = await Promise.all([
    getAllPublishedIssues(),
    Promise.resolve(getNewsletterSettings()),
  ]);

  const issues = rows.map(toMagazineIssue);

  return (
    <div className="flex flex-col w-full bg-[#F8FAFC]">
      <Section variant="hero" bg="transparent" className="pt-[90px] pb-3 sm:pt-[100px] sm:pb-2">
        <Container size="lg">
          <div className="flex flex-col items-start text-left">
            <span className="mb-3 sm:mb-4 text-xs sm:text-sm font-medium uppercase tracking-[0.15em] text-[#0F766E]">
              Curated Collections
            </span>

            <h1 className="mb-3.5 sm:mb-4 font-serif text-[40px] sm:text-[48px] font-normal leading-tight text-[#111827] md:text-[56px]">
              All Issues
            </h1>

            <p className="mb-0 max-w-[650px] text-[15px] sm:text-[16px] leading-relaxed text-[#4B5563] md:text-[18px]">
              Browse every published issue — covers, editions, and full digital
              archives from The Journal.
            </p>
          </div>
        </Container>
      </Section>

      <Section
        variant="large"
        bg="transparent"
        className="!pt-0 !mt-0"
      >
        <Container size="lg">
          <ArchiveIssuesGrid issues={issues} />
        </Container>
      </Section>
    </div>
  );
}
