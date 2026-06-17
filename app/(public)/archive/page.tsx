"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, Inbox } from "lucide-react";
import { Section, Container, PageHeader } from "@/components/layout";
import ArchiveCard from "@/components/magazine/ArchiveCard";
import SearchFilter, { type CategoryType } from "@/components/magazine/SearchFilter";
import FeaturedArchive from "@/components/magazine/FeaturedArchive";
import NewsletterCTA from "@/components/magazine/NewsletterCTA";
import { mockArchivesList } from "@/data/mockArchives";
import { staggerContainer, fadeUpVariants } from "@/lib/animations";

const ITEMS_PER_PAGE = 6;

export default function ArchivePage() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryType>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const filterSectionRef = useRef<HTMLDivElement>(null);

  // Reset to page 1 whenever search query or category filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

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

  // Find the featured item when there's no active search or category selection
  const featuredItem = useMemo(() => {
    return mockArchivesList.find(item => item.featured) || mockArchivesList[0];
  }, []);

  // Filter items based on active parameters
  const filteredItems = useMemo(() => {
    return mockArchivesList.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  // Determine if we should show the featured section at the top
  const showFeaturedSection = useMemo(() => {
    return !searchQuery && activeCategory === "All" && featuredItem;
  }, [searchQuery, activeCategory, featuredItem]);

  // Grid items excludes the featured item when it's highlighted at the top
  const gridItems = useMemo(() => {
    if (showFeaturedSection) {
      return filteredItems.filter((item) => item.id !== featuredItem.id);
    }
    return filteredItems;
  }, [filteredItems, showFeaturedSection, featuredItem]);

  // Paginated items
  const paginatedGridItems = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return gridItems.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [gridItems, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(gridItems.length / ITEMS_PER_PAGE);
  }, [gridItems]);

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
      {/* 1. Header Section */}
      <PageHeader
        badge="CURATED COLLECTIONS"
        title="Archives"
        description="Explore our collection of articles, projects, insights, and updates."
        align="left"
        sectionVariant="hero"
      />

      <div ref={filterSectionRef} className="scroll-mt-24">
        {/* 2. Main Content Container */}
        <Section variant="large" bg="transparent" className="pt-0">
          <Container size="lg">
            
            {/* Featured Archive Item at the top */}
            {showFeaturedSection && (
              <FeaturedArchive item={featuredItem} />
            )}

            {/* Search and Filters row */}
            <SearchFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              totalCount={filteredItems.length}
            />

            {/* Empty state when no items match search filters */}
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
              /* Archive Grid */
              <div className="flex flex-col">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={staggerContainer}
                  className={[
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 transition-opacity duration-300",
                    isPageLoading ? "opacity-40" : "opacity-100"
                  ].join(" ")}
                >
                  <AnimatePresence mode="popLayout">
                    {paginatedGridItems.map((item) => (
                      <ArchiveCard key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination Controls */}
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

      {/* 3. Newsletter Section */}
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
