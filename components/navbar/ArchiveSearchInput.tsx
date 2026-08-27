"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useCallback } from "react";

/**
 * ArchiveSearchInput
 *
 * A standalone client component that renders a search input in the Navbar when
 * the user is on an archive page (/archive, /issues, /archives). Writes the query to
 * the URL as `?q=` so the archive page can read it via useSearchParams without lifting state.
 *
 * Wrapped in <Suspense> by the parent (SiteNavbar) to satisfy Next.js
 * App Router requirements around useSearchParams in streaming layouts.
 */
export default function ArchiveSearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";

  const isArchivePage =
    pathname === "/archive" || pathname === "/issues" || pathname === "/archives";

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      const targetPath = isArchivePage ? pathname : "/archive";
      router.replace(`${targetPath}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, pathname, isArchivePage]
  );

  // Only render on archive routes
  if (!isArchivePage) return null;

  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
        <Search className="size-3.5" />
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search Issues…"
        aria-label="Search Issues"
        className={[
          "w-full h-8 pl-8 pr-7 text-[12px] sm:text-[13px] rounded-full",
          "bg-[#F1F5F9] border border-transparent truncate",
          "text-[#334155] placeholder:text-[#94A3B8]",
          "focus:outline-none focus:bg-white focus:border-[#CBD5E1]",
          "transition-all duration-200",
        ].join(" ")}
      />
      {query && (
        <button
          onClick={() => handleChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#334155] transition-colors p-0.5 rounded-full cursor-pointer"
          aria-label="Clear search"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}

