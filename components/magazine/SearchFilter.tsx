"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LabelCaps } from "@/src/components/ui/typography";

export type CategoryType = 'All' | 'Projects' | 'Blogs' | 'Case Studies' | 'Tutorials' | 'Updates';

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: CategoryType;
  setActiveCategory: (category: CategoryType) => void;
  totalCount: number;
}

const CATEGORIES: CategoryType[] = ['All', 'Projects', 'Blogs', 'Case Studies', 'Tutorials', 'Updates'];

export default function SearchFilter({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  totalCount
}: SearchFilterProps) {
  return (
    <div className="flex flex-col gap-6 w-full border-b border-border/20 pb-8 mb-10">
      {/* Upper row: Search bar and total results */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input Box */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none">
            <Search className="size-4.5" />
          </span>
          <Input
            type="text"
            placeholder="Search archives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-10 h-11 w-full text-sm font-sans rounded-full border border-border/40 bg-card focus-visible:bg-card shadow-sm"
            aria-label="Search archive items"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors p-1 rounded-full outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-label="Clear search input"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Total results count */}
        <div className="text-right text-xs md:text-sm text-muted-foreground font-sans font-medium shrink-0">
          Showing {totalCount} {totalCount === 1 ? 'Result' : 'Results'}
        </div>
      </div>

      {/* Lower row: Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <Button
              key={category}
              onClick={() => setActiveCategory(category)}
              variant={isActive ? "default" : "outline"}
              className={[
                "h-8 px-4 rounded-full font-sans uppercase tracking-wider text-[11px] font-semibold transition-all cursor-pointer select-none",
                isActive
                  ? "bg-primary text-white border-primary"
                  : "bg-card border-border/30 hover:border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
              ].join(" ")}
              aria-pressed={isActive}
            >
              {category}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
