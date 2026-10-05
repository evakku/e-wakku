"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { staggerContainer } from "@/lib/animations";
import IssueArchiveCard from "./IssueArchiveCard";
import type { Issue } from "./types";

const ITEMS_PER_PAGE = 8;

interface IssueArchiveGridProps {
  issues: Issue[];
  title?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
  viewAllPlacement?: "header" | "footer";
  enablePagination?: boolean;
  issueSource?: "home" | "archive";
}

export default function IssueArchiveGrid({
  issues,
  title = "ISSUES",
  showViewAll = true,
  viewAllHref = "/allIssues",
  viewAllLabel = "All Issues",
  viewAllPlacement = "header",
  enablePagination = !showViewAll,
}: IssueArchiveGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

  const shouldPaginate = enablePagination && issues.length > ITEMS_PER_PAGE;
  const totalPages = shouldPaginate ? Math.ceil(issues.length / ITEMS_PER_PAGE) : 1;

  const displayedIssues = useMemo(() => {
    if (showViewAll) return issues.slice(0, 3);
    if (!shouldPaginate) return issues;
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return issues.slice(start, start + ITEMS_PER_PAGE);
  }, [issues, showViewAll, shouldPaginate, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setIsPageLoading(true);
    setCurrentPage(page);

    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => setIsPageLoading(false), 250);
  };

  const isHomePreview = showViewAll;

  return (
    <section
      ref={gridRef}
      className="scroll-mt-28 flex flex-col w-full items-center"
      aria-labelledby="archive-title"
    >
      {/* Subheading Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-8 sm:mb-10 w-full max-w-[1140px] mx-auto">
        <h2
          id="archive-title"
          className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]"
        >
          {title}
        </h2>
        {showViewAll && viewAllPlacement === "header" && (
          <Link
            href={viewAllHref}
            className="text-xs sm:text-sm font-semibold text-[#059669] hover:text-[#047857] transition-colors flex items-center gap-1.5 group focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:outline-none rounded cursor-pointer"
          >
            <span>{viewAllLabel}</span>
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>

      {/* 3-Card Centered Grid Container */}
      <div className="w-full max-w-[1140px] mx-auto flex justify-center">
        <motion.div
          key={currentPage}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className={[
            isHomePreview
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 w-full justify-items-center transition-opacity duration-200"
              : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 w-full transition-opacity duration-200",
            isPageLoading ? "opacity-40" : "opacity-100",
          ].join(" ")}
        >
          {displayedIssues.map((issue) => (
            <IssueArchiveCard
              key={issue._id}
              issue={issue}
              className="w-full h-full"
            />
          ))}
        </motion.div>
      </div>

      {/* Pagination Controls (when viewing full list) */}
      {shouldPaginate && totalPages > 1 && (
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPageLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
            <span>Previous</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              disabled={isPageLoading}
              aria-current={page === currentPage ? "page" : undefined}
              className={[
                "min-w-10 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]",
                page === currentPage
                  ? "bg-[#059669] text-white shadow-sm"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPageLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
            aria-label="Next page"
          >
            <span>Next</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {showViewAll && viewAllPlacement === "footer" && (
        <div className="flex justify-center pt-8">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
          >
            {viewAllLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
