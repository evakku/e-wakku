"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface IssuesPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

export function IssuesPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: IssuesPaginationProps) {
  if (total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC]">
      <p className="text-xs text-[#64748B]">
        Showing{" "}
        <span className="font-semibold text-[#0F172A]">
          {start}–{end}
        </span>{" "}
        of <span className="font-semibold text-[#0F172A]">{total}</span> issues
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={[
            "flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] border border-[#E2E8F0] transition-colors cursor-pointer",
            page <= 1
              ? "opacity-40 pointer-events-none"
              : "hover:bg-white hover:border-[#CBD5E1] hover:text-[#0F172A]",
          ].join(" ")}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={[
              "flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium border transition-colors cursor-pointer",
              p === page
                ? "bg-[#059669] text-white border-[#059669]"
                : "text-[#64748B] border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1] hover:text-[#0F172A]",
            ].join(" ")}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={[
            "flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] border border-[#E2E8F0] transition-colors cursor-pointer",
            page >= totalPages
              ? "opacity-40 pointer-events-none"
              : "hover:bg-white hover:border-[#CBD5E1] hover:text-[#0F172A]",
          ].join(" ")}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
