"use client";

import { Button } from "@/components/ui/button";

interface SearchFilterProps {
  years: string[];
  activeYear: string;
  setActiveYear: (year: string) => void;
  totalCount: number;
}

export default function SearchFilter({
  years,
  activeYear,
  setActiveYear,
  totalCount
}: SearchFilterProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full border-b border-border/20 pb-6 mb-10">
      
      {/* Year Filter Chips */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by issued year">
        {years.map((year) => {
          const isActive = activeYear === year;
          return (
            <Button
              key={year}
              onClick={() => setActiveYear(year)}
              variant={isActive ? "default" : "outline"}
              className={[
                "h-8 px-4 rounded-full font-sans uppercase tracking-wider text-[11px] font-semibold transition-all cursor-pointer select-none",
                isActive
                  ? "bg-primary text-white border-primary"
                  : "bg-card border-border/30 hover:border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
              ].join(" ")}
              aria-pressed={isActive}
            >
              {year}
            </Button>
          );
        })}
      </div>

      {/* Total results count */}
      <div className="text-right text-xs md:text-sm text-muted-foreground font-sans font-medium shrink-0">
        Showing {totalCount} {totalCount === 1 ? 'Result' : 'Results'}
      </div>
    </div>
  );
}
