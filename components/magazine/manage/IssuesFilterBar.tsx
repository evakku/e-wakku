"use client";

import { Search, X } from "lucide-react";

interface IssuesFilterBarProps {
  currentStatus: "all" | "published" | "draft";
  searchInput: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onClearSearch: () => void;
  onStatusChange: (status: "all" | "published" | "draft") => void;
}

export function IssuesFilterBar({
  currentStatus,
  searchInput,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onStatusChange,
}: IssuesFilterBarProps) {
  const statusTabs: Array<{ label: string; value: "all" | "published" | "draft" }> = [
    { label: "All Issues", value: "all" },
    { label: "Published", value: "published" },
    { label: "Drafts", value: "draft" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-sm">
      {/* Status Filters */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto">
        {statusTabs.map((tab) => {
          const active = currentStatus === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatusChange(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-[#059669] text-white"
                  : "text-[#64748B] hover:bg-[#F0F2F4] hover:text-[#0F172A]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <form onSubmit={onSearchSubmit} className="relative w-full sm:w-72">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
        />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search issues by title..."
          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-1.5 pl-8 pr-8 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#059669]"
        />
        {searchInput && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
          >
            <X size={12} />
          </button>
        )}
      </form>
    </div>
  );
}
