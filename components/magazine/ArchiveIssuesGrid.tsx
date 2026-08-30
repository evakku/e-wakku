"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { staggerContainer } from "@/lib/animations";
import IssueArchiveCard from "./IssueArchiveCard";
import type { Issue } from "./types";

const ITEMS_PER_PAGE = 8;

interface ArchiveIssuesGridProps {
  issues: Issue[];
  issueSource?: "home" | "archive";
}

function getIssueYear(issue: Issue): string | null {
  if (issue.subtitle) {
    const match = issue.subtitle.match(/\b(20\d{2}|19\d{2})\b/);
    if (match) return match[1];
  }
  if (issue.publishedDate) {
    const d = new Date(issue.publishedDate);
    const year = d.getFullYear();
    if (!isNaN(year)) return String(year);
  }
  return null;
}

export default function ArchiveIssuesGrid({
  issues,
  issueSource = "archive",
}: ArchiveIssuesGridProps) {
  const searchParams = useSearchParams();
  const query = (searchParams?.get("q") ?? "").trim().toLowerCase();

  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

  // Extract distinct published years in descending order
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    issues.forEach((issue) => {
      const year = getIssueYear(issue);
      if (year) yearsSet.add(year);
    });
    const sortedYears = Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
    return ["All", ...sortedYears];
  }, [issues]);

  // Filter issues dynamically by selected year and search query
  const filteredIssues = useMemo(() => {
    let result = issues;
    if (selectedYear !== "All") {
      result = result.filter((issue) => getIssueYear(issue) === selectedYear);
    }
    if (query) {
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          (issue.description && issue.description.toLowerCase().includes(query)) ||
          (issue.subtitle && issue.subtitle.toLowerCase().includes(query))
      );
    }
    return result;
  }, [issues, selectedYear, query]);

  const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE);

  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredIssues.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredIssues, currentPage]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setIsPageLoading(true);
    setCurrentPage(page);

    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => setIsPageLoading(false), 250);
  };

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 bg-card/30 px-6 py-24 text-center max-w-xl mx-auto">
        <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Inbox className="size-6 stroke-[1.5]" />
        </div>
        <h3 className="mb-2 font-heading text-xl font-normal tracking-tight text-foreground">
          No published issues yet
        </h3>
        <p className="max-w-sm text-sm font-light leading-relaxed text-muted-foreground">
          Check back soon — new issues will appear here once they are published.
        </p>
      </div>
    );
  }

  return (
    <div ref={gridRef} className="scroll-mt-28 flex flex-col w-full">
      {/* Header Bar with Filter Tabs & Result Count */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full border-b border-border/20 pb-4 mb-5">
        {/* Dynamic Year Filter Tabs */}
        {availableYears.length > 1 && (
          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Filter issues by year"
          >
            {availableYears.map((year) => {
              const isActive = selectedYear === year;
              return (
                <button
                  key={year}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleYearChange(year)}
                  className={[
                    "h-8 px-4 rounded-full font-sans text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border/30 text-muted-foreground hover:border-border/60 hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {year}
                </button>
              );
            })}
          </div>
        )}

        <div className="text-sm font-medium text-muted-foreground">
          Showing {filteredIssues.length} {filteredIssues.length === 1 ? "issue" : "issues"}
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 bg-card/20 px-6 py-16 text-center max-w-md mx-auto my-8">
          <p className="text-sm text-muted-foreground">
            {query
              ? `No published issues found matching "${query}".`
              : `No published issues found for ${selectedYear}.`}
          </p>
        </div>
      ) : (
        <>
          {/* Dynamic Issue Grid — Exactly 4 cards/row */}
          <motion.div
            key={`${selectedYear}-${currentPage}`}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className={[
              "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 transition-opacity duration-200",
              isPageLoading ? "opacity-40" : "opacity-100",
            ].join(" ")}
          >
            {paginatedIssues.map((issue) => (
              <IssueArchiveCard key={issue._id} issue={issue} from={issueSource} />
            ))}
          </motion.div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-16 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPageLoading}
                className="flex size-10 items-center justify-center rounded-full border border-border/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Previous page"
              >
                <ChevronLeft className="size-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  disabled={isPageLoading}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={[
                    "min-w-10 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    page === currentPage
                      ? "bg-primary text-primary-foreground"
                      : "border border-border/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isPageLoading}
                className="flex size-10 items-center justify-center rounded-full border border-border/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Next page"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}