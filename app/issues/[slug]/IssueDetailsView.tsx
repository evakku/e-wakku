"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Section, Container } from "@/components/layout";
import { HeadlineMd } from "@/src/components/ui/typography";
import type { Issue } from "@/data/mockIssue";
import IssueHero from "./IssueHero";
import PDFViewerPlaceholder from "./PDFViewerPlaceholder";

interface IssueDetailsViewProps {
  issue: Issue;
}

export default function IssueDetailsView({ issue }: IssueDetailsViewProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const backHref = from === "archive" ? "/archive" : null;
  const backLabel = "All Issues";
  if (!issue) {
    notFound();
  }

  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // Premium bezier
      },
    },
  };

  return (
    <div className="w-full bg-[#F8FAFC]">
      {/* SECTION 1 — ISSUE HERO */}
      <Section variant="hero" bg="white" className="py-16 sm:py-24 lg:py-28">
        <Container size="lg">
          {backHref && (
            <Link
              href={backHref}
              className="mb-6 inline-flex items-center text-[#0F766E] hover:text-[#0D9488] transition-colors py-5"
            >
              <ArrowLeft size={20} className="mr-2" />
              <span className="text-sm font-medium">{backLabel}</span>
            </Link>
          )}
          <IssueHero issue={issue} />
        </Container>
      </Section>

      {/* SECTION 2 — DIGITAL ARCHIVE VIEWER */}
      <Section
        variant="large"
        bg="transparent"
        divider
        id="digital-archive-viewer"
        className="scroll-mt-12 py-16 sm:py-24 lg:py-32"
      >
        <Container size="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            className="flex flex-col gap-6"
          >
            {/* Heading header row */}
            <div className="flex justify-between items-baseline border-b border-slate-200 pb-4">
              <HeadlineMd className="text-slate-900 font-heading font-normal tracking-tight">
                Digital Archive Viewer
              </HeadlineMd>
              <span className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-widest font-mono">
                {issue.pageCount > 0 ? `${issue.pageCount} Pages` : "Digital Edition"}
              </span>
            </div>

            {/* Interactive PDF Viewer Placeholder Area */}
            <PDFViewerPlaceholder pdfUrl={issue.pdfUrl} title={issue.title} />
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
