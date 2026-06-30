"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Section, Container } from "@/components/layout";
import ArchiveCard from "@/components/magazine/ArchiveCard";
import SearchFilter from "@/components/magazine/SearchFilter";
import NewsletterCTA from "@/components/magazine/NewsletterCTA";
import { mockArchivesList } from "@/data/mockArchives";
import { staggerContainer, fadeUpVariants } from "@/lib/animations";

const ITEMS_PER_PAGE = 6;

function ArchiveContent() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  
  const [activeYear, setActiveYear] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const filterSectionRef = useRef<HTMLDivElement>(null);

  // Extract all unique years from mock data
  const years = useMemo(() => {
    const extractedYears = mockArchivesList
      .map(item => new Date(item.publishedDate).getFullYear().toString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => parseInt(b) - parseInt(a)); // Descending
    return ["All", ...extractedYears];
  }, []);

  // Reset to page 1 whenever search query or year filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchQuery, activeYear]);

  // Handle pagination loading effect
  const handlePageChange = (newPage: number) => {
    setIsPageLoading(true);
    setCurrentPage(newPage);
    
    // Smooth scroll back to search section
    if (filterSectionRef.current) {
      filterSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setTimeout(() => {
      setIsPageLoading(false);
    }, 450);
  };

  // Filter items based on active parameters
  const filteredItems = useMemo(() => {
    return mockArchivesList.filter((item) => {
      const itemYear = new Date(item.publishedDate).getFullYear().toString();
      const matchesYear = activeYear === "All" || itemYear === activeYear;
      
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
        
      return matchesYear && matchesSearch;
    });
  }, [searchQuery, activeYear]);

  // Paginated items
  const paginatedGridItems = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  }, [filteredItems]);

  // Structured Data (JSON-LD) for SEO
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Archives | The Journal",
      "description": "Explore our collection of articles, projects, insights, and updates.",
      "url": typeof window !== "undefined" ? window.location.href : "",
    };

    const scriptId = "jsonld-archive";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute("id", scriptId);
      document.head.appendChild(script);
    }
    script.innerHTML = JSON.stringify(jsonLd);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="flex flex-col w-full bg-[#F8FAFC]">
      <motion.section 
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full pt-[100px] pb-[24px]"
      >
        <Container size="lg">
          <div className="flex flex-col items-start text-left">
            <span className="uppercase tracking-[0.15em] font-medium text-[#0F766E] text-sm mb-4">
              Curated Collections
            </span>
            <h1 className="text-[48px] md:text-[56px] font-normal text-[#111827] mb-4 font-serif leading-tight">
              Archives
            </h1>
            <p className="max-w-[650px] text-[16px] md:text-[18px] text-[#4B5563] leading-relaxed mb-0">
              Explore five years of independent journalism, deep-dives into modern technology, and premium editorial features from The Journal.
            </p>
          </div>
        </Container>
      </motion.section>

      <div ref={filterSectionRef} className="scroll-mt-24 pt-16">
        <Section variant="large" bg="transparent" className="pt-0">
          <Container size="lg">
            
            {/* Content grid below filter */}

            <SearchFilter
              years={years}
              activeYear={activeYear}
              setActiveYear={setActiveYear}
              totalCount={filteredItems.length}
            />

            {filteredItems.length === 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUpVariants(shouldReduceMotion)}
                className="flex flex-col items-center justify-center text-center py-24 px-6 border border-dashed border-border/40 rounded-2xl max-w-xl mx-auto bg-card/30"
              >
                <div className="size-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mb-6">
                  <Inbox className="size-6 stroke-[1.5]" />
                </div>
                <h3 className="font-heading text-xl text-foreground font-normal tracking-tight mb-2">
                  No archives found
                </h3>
                <p className="text-muted-foreground text-sm font-light max-w-sm mb-0 leading-relaxed">
                  Try adjusting your search query or switching filters.
                </p>
              </motion.div>
            ) : (
              <div className="flex flex-col">
                <motion.div
                  key={currentPage}
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className={[
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 transition-opacity duration-300",
                    isPageLoading ? "opacity-40" : "opacity-100"
                  ].join(" ")}
                >
                  {paginatedGridItems.map((item) => (
                    <ArchiveCard key={item.id} item={item} />
                  ))}
                </motion.div>

                {totalPages > 1 && (
                  <div className="mt-20 flex justify-center items-center gap-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isPageLoading}
                      className="w-12 h-12 flex items-center justify-center rounded-full border border-border/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <span className="text-xs font-sans font-semibold uppercase tracking-wider select-none">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isPageLoading}
                      className="w-12 h-12 flex items-center justify-center rounded-full border border-border/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </Container>
        </Section>
      </div>

      <Section variant="large" divider bg="surface">
        <Container size="lg">
          <NewsletterCTA
            settings={{
              heading: "Stay Updated",
              description: "Receive updates when new issues and archives are published.",
              buttonText: "Subscribe",
            }}
          />
        </Container>
      </Section>
    </div>
  );
}

export default function ArchivePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="size-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    }>
      <ArchiveContent />
    </Suspense>
  );
}
