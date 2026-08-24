"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";
import { fadeUpVariants } from "@/lib/animations";
import { getImageUrl } from "@/lib/sanity/client";
import { isSupabaseStorageUrl } from "@/lib/supabase-image";
import type { Issue } from "./types";

interface IssueArchiveCardProps {
  issue: Issue;
  className?: string;
}

function formatMonthYear(issue: Issue): string | null {
  if (issue.subtitle) {
    return issue.subtitle;
  }
  if (issue.publishedDate) {
    try {
      const d = new Date(issue.publishedDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      }
    } catch {}
  }
  return null;
}

export default function IssueArchiveCard({ issue, className }: IssueArchiveCardProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const imageUrl = getImageUrl(issue.coverImage);
  const slugStr = typeof issue.slug === "string" ? issue.slug : issue.slug?.current || issue._id || "";
  const dateStr = formatMonthYear(issue);

  return (
    <motion.article
      variants={fadeUpVariants(shouldReduceMotion)}
      className={className ?? "w-full h-full"}
    >
      <div className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/80">
        {/* Inner Cover Container — Generous Padding & object-contain centering */}
        <Link
          href={`/issue/${slugStr}`}
          className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-[#F8FAFC] border border-slate-200/70 flex items-center justify-center p-3 transition-colors duration-300 group-hover:border-slate-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`Cover of ${issue.title}`}
              fill
              unoptimized={isSupabaseStorageUrl(imageUrl)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
              className="object-contain object-center p-2 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 p-4 text-center text-xs font-light text-slate-400">
              <BookOpen className="size-6 text-slate-400 stroke-[1.5]" />
              <span>No cover image</span>
            </div>
          )}
        </Link>

        {/* Card Content Area */}
        <div className="flex flex-1 flex-col pt-4 sm:pt-5">
          {/* Issue Title */}
          <Link
            href={`/issue/${slugStr}`}
            className="group/title focus-visible:outline-none"
          >
            <h3 className="line-clamp-2 font-heading text-lg sm:text-xl font-bold leading-snug text-[#0F172A] transition-colors duration-200 group-hover/title:text-[#059669]">
              {issue.title}
            </h3>
          </Link>

          {/* Description */}
          {issue.description && (
            <p className="mt-2.5 line-clamp-2 text-xs sm:text-sm font-normal leading-relaxed text-[#475569] flex-1">
              {issue.description}
            </p>
          )}

          {/* Month & Year */}
          {dateStr && (
            <p className="mt-3 text-xs font-semibold text-[#059669] tracking-wide">
              {dateStr}
            </p>
          )}

          {/* Read More Button */}
          <div className="mt-4 pt-2">
            <Link
              href={`/issue/${slugStr}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F1F5F9] hover:bg-[#059669] border border-[#CBD5E1] hover:border-[#059669] px-4 py-2.5 text-xs font-semibold text-[#0F172A] hover:text-white transition-all duration-200 cursor-pointer shadow-sm group/btn"
            >
              <span>Read More</span>
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
