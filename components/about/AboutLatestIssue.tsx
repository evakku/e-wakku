"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { BookOpen, ArrowRight, Calendar } from "lucide-react";
import { HeadlineLg, BodyLg, LabelCaps } from "@/src/components/ui/typography";
import type { Issue } from "@/lib/queries/issue";
import { getImageUrl } from "@/lib/utils/image";

interface AboutLatestIssueProps {
  issue: Issue | null;
  eyebrow?: string;
  heading?: string;
  description?: string;
}

function formatIssueDate(issue: Issue): string {
  if (issue.month && issue.year) {
    const monthNames: Record<string, string> = {
      "01": "January",
      "02": "February",
      "03": "March",
      "04": "April",
      "05": "May",
      "06": "June",
      "07": "July",
      "08": "August",
      "09": "September",
      "10": "October",
      "11": "November",
      "12": "December",
    };
    const cleanMonth = issue.month.padStart(2, "0");
    const monthLabel = monthNames[cleanMonth] || issue.month;
    return `${monthLabel} ${issue.year}`;
  }

  if (issue.published_at) {
    try {
      const d = new Date(issue.published_at);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      }
    } catch {
      // Fallback
    }
  }

  return "";
}

export default function AboutLatestIssue({
  issue,
  eyebrow = "THE LATEST ISSUE",
  heading = "Explore our latest edition.",
  description = "Discover the latest issue of E-Wakku and explore the ideas, stories, and perspectives featured in this edition.",
}: AboutLatestIssueProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fadeUpVariants: Variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const issueHref = issue ? `/issue/${issue.id}?from=about` : "/allIssues";
  const imageUrl = issue ? getImageUrl(issue.cover_image_url) : "";
  const dateLabel = issue ? formatIssueDate(issue) : "";

  return (
    <motion.section
      variants={fadeUpVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-80px" }}
      className="w-full max-w-5xl mx-auto"
      aria-labelledby="latest-issue-heading"
    >
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-12 lg:p-16 shadow-sm">
        {issue ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* ── Left Column: Editorial Info & Action ────────────────── */}
            <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">
              <div className="mb-3 sm:mb-4">
                <LabelCaps className="text-[#059669] font-medium tracking-[0.15em] text-xs">
                  {eyebrow}
                </LabelCaps>
              </div>

              <HeadlineLg
                id="latest-issue-heading"
                as="h2"
                className="text-[#0F172A] font-heading font-serif tracking-tight mb-4 text-2xl sm:text-3xl lg:text-4xl"
              >
                {heading}
              </HeadlineLg>

              <BodyLg className="text-[#475569] font-light font-sans text-base sm:text-lg mb-6 leading-relaxed text-justify">
                {description}
              </BodyLg>

              {/* Issue Details Metadata Box */}
              <div className="mb-8 p-4 sm:p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/80 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#059669]/10 text-[#059669] border border-[#059669]/20">
                    Featured Edition
                  </span>
                  {dateLabel && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#64748B]">
                      <Calendar size={13} className="text-[#94A3B8]" aria-hidden />
                      {dateLabel}
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-serif text-lg sm:text-xl text-[#0F172A] font-medium mt-1">
                  {issue.title}
                </h3>

                {issue.description && (
                  <p className="text-xs sm:text-sm text-[#64748B] line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>
                )}
              </div>

              {/* Call to action */}
              <div>
                <Link
                  href={issueHref}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-md bg-[#059669] hover:bg-[#047857] text-white font-medium text-sm transition-colors duration-200 shadow-sm hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-2 w-full sm:w-auto text-center"
                >
                  <span>Read the latest issue</span>
                  <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
            </div>

            {/* ── Right Column: Interactive Clickable Cover Card ──────── */}
            <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
              <Link
                href={issueHref}
                aria-label={`Read ${issue.title} — E-Wakku Malayalam digital magazine`}
                className="group block w-full max-w-[260px] sm:max-w-[290px] lg:max-w-[320px] outline-none focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-4 rounded-2xl cursor-pointer"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-md group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 ease-out p-2 flex items-center justify-center">
                  {imageUrl && !imageError ? (
                    <>
                      {!imageLoaded && (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 skeleton-shimmer z-0"
                        />
                      )}
                      <Image
                        src={imageUrl}
                        alt={`Cover of ${issue.title} — E-Wakku Malayalam digital magazine`}
                        fill
                        sizes="(max-width: 640px) 260px, (max-width: 1024px) 290px, 320px"
                        priority
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        className={`object-contain p-2 transition-all duration-500 ease-out group-hover:scale-[1.03] ${
                          imageLoaded ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-xs font-light text-[#94A3B8]">
                      <BookOpen className="size-8 text-[#94A3B8] stroke-[1.5]" />
                      <span>Cover not available</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-center">
                  <span className="text-xs font-medium text-[#059669] group-hover:underline inline-flex items-center gap-1">
                    <span>View edition</span>
                    <ArrowRight size={12} aria-hidden />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          /* Graceful Empty State when no published issue exists */
          <div className="flex flex-col items-center text-center py-8 sm:py-12 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#F0FDF4] border border-[#059669]/20 flex items-center justify-center text-[#059669] mb-4">
              <BookOpen size={22} strokeWidth={1.75} />
            </div>
            <HeadlineLg
              id="latest-issue-heading"
              as="h2"
              className="text-[#0F172A] font-heading font-serif text-xl sm:text-2xl mb-2"
            >
              No published issues available yet
            </HeadlineLg>
            <p className="text-sm text-[#64748B] mb-6">
              Our inaugural editions are currently in preparation. Please check back soon or explore our archive.
            </p>
            <Link
              href="/allIssues"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#059669] hover:underline"
            >
              <span>Explore all issues</span>
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </motion.section>
  );
}
