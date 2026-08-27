"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Download, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DisplayXL, LabelCaps, BodyLg } from "@/src/components/ui/typography";
import { getImageUrl } from "@/lib/sanity/client";
import { isSupabaseStorageUrl } from "@/lib/supabase-image";
import { fadeUpVariants, staggerContainer } from "@/lib/animations";
import type { Issue } from "./types";

interface HomeHeroProps {
  issue: Issue;
}

export default function HomeHero({ issue }: HomeHeroProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const imageUrl = getImageUrl(issue.coverImage);
  const slugStr = typeof issue.slug === "string" ? issue.slug : issue.slug?.current || "";
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!issue.pdfUrl || isDownloading) return;

    const issueId = issue._id || (typeof issue.slug === "string" ? issue.slug : issue.slug?.current);
    if (issueId) {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "download", issueId }),
      }).catch(() => {});
    }

    setIsDownloading(true);
    try {
      const response = await fetch(issue.pdfUrl);
      if (!response.ok) throw new Error("Failed to fetch PDF");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const filename = issue.title.toLowerCase().endsWith(".pdf")
        ? issue.title
        : `${issue.title}.pdf`;

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Direct download failed, falling back:", error);
      const filename = issue.title.toLowerCase().endsWith(".pdf")
        ? issue.title
        : `${issue.title}.pdf`;
      const link = document.createElement("a");
      link.href = issue.pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center"
      aria-label="Featured Publication"
    >
      {/* Left Column: Editorial Content */}
      <motion.div
        variants={fadeUpVariants(shouldReduceMotion)}
        className="flex flex-col justify-center lg:col-span-5 order-1 lg:order-1 my-auto"
      >
        <LabelCaps className="text-accent mb-4 tracking-widest font-semibold block">
          Latest Issue
        </LabelCaps>
        
        <DisplayXL className="text-foreground tracking-tight font-heading mb-6">
          {issue.title}
        </DisplayXL>
        
        <BodyLg className="text-muted-foreground mb-8 font-light leading-relaxed max-w-xl">
          {issue.description}
        </BodyLg>
        
        {/* Responsive buttons: stack vertically on mobile, row on tablet/desktop */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {issue.pdfUrl && (
            <Button
              variant="default"
              size="lg"
              disabled={isDownloading}
              onClick={handleDownload}
              className="w-full sm:w-auto bg-accent text-white hover:bg-accent/90 border-0 flex items-center justify-center gap-2.5 h-12 shadow-sm font-medium transition-editorial px-6 rounded-md cursor-pointer disabled:opacity-50"
              aria-label={`Download PDF of ${issue.title}`}
            >
              {isDownloading ? (
                <Loader2 className="size-4 shrink-0 animate-spin" />
              ) : (
                <Download className="size-4 shrink-0" />
              )}
              <span>{isDownloading ? "Downloading..." : "Download Issue"}</span>
            </Button>
          )}
          
          <Link href={`/issue/${slugStr}`} className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-border hover:border-accent/30 hover:bg-muted text-foreground flex items-center justify-center gap-2.5 h-12 font-medium transition-editorial px-6 rounded-md cursor-pointer"
              aria-label={`Read ${issue.title} online`}
            >
              <BookOpen className="size-4 shrink-0 text-muted-foreground group-hover/button:text-accent" />
              Read Online
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Right Column: Premium Cover Image Showcase */}
      <motion.div
        variants={fadeUpVariants(shouldReduceMotion)}
        className="lg:col-span-7 order-2 lg:order-2"
      >
        <Link href={`/issue/${slugStr}`} className="group block focus:outline-none">
          <div className="relative aspect-[7/5] md:aspect-[7/5] w-full overflow-hidden rounded-2xl bg-muted border border-border/10 shadow-paper-lg group-focus-visible:ring-3 group-focus-visible:ring-accent/40 transition-editorial">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`Cover of ${issue.title}`}
                fill
                priority
                unoptimized={isSupabaseStorageUrl(imageUrl)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 700px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-light">
                No Cover Image
              </div>
            )}
            
            {/* Elegant luxury overlay shading */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>
        </Link>
      </motion.div>
    </motion.section>
  );
}
