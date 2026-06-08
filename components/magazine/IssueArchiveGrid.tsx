"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Download } from "lucide-react";
import { HeadlineLg, BodyMd } from "@/src/components/ui/typography";
import { getImageUrl } from "@/lib/sanity/client";
import { fadeUpVariants, staggerContainer } from "@/lib/animations";
import type { Issue } from "./types";

interface IssueArchiveGridProps {
  issues: Issue[];
}

export default function IssueArchiveGrid({ issues }: IssueArchiveGridProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <section className="flex flex-col gap-8 w-full" aria-labelledby="archive-title">
      {/* Grid Header */}
      <div className="flex justify-between items-baseline border-b border-border/40 pb-4">
        <HeadlineLg id="archive-title" className="text-foreground tracking-tight font-heading font-normal">
          Past Issues
        </HeadlineLg>
        <Link
          href="/archive"
          className="text-sm font-medium text-accent hover:text-accent/80 transition-colors flex items-center gap-1 group focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none rounded"
        >
          View All Archives
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
            &rarr;
          </span>
        </Link>
      </div>

      {/* Responsive Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
      >
        {issues.map((issue) => {
          const imageUrl = getImageUrl(issue.coverImage);
          const slugStr = typeof issue.slug === "string" ? issue.slug : issue.slug?.current || "";

          return (
            <motion.article
              key={issue._id}
              variants={fadeUpVariants(shouldReduceMotion)}
              className="group flex flex-col"
            >
              {/* Card Thumbnail / Aspect Ratio container */}
              <Link
                href={`/issue/${slugStr}`}
                className="focus:outline-none rounded-lg group-focus-visible:ring-3 group-focus-visible:ring-accent/40 block overflow-hidden transition-editorial"
                tabIndex={0}
              >
                <div className="card-editorial card-image-45 relative w-full overflow-hidden rounded-lg shadow-paper-sm bg-muted">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`Cover of ${issue.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                      className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-light">
                      No Cover Image
                    </div>
                  )}
                  {/* Subtle editorial card highlight border */}
                  <div className="absolute inset-0 border border-border/10 rounded-lg pointer-events-none" />
                </div>
              </Link>

              {/* Card Details */}
              <div className="mt-5 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-4">
                  <Link
                    href={`/issue/${slugStr}`}
                    className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
                  >
                    <h3 className="font-heading text-xl text-foreground font-normal tracking-tight">
                      {issue.title}
                    </h3>
                  </Link>

                  {issue.pdfUrl && (
                    <Link
                      href={issue.pdfUrl}
                      download
                      className="text-muted-foreground hover:text-accent transition-colors p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-full"
                      aria-label={`Download PDF of ${issue.title}`}
                    >
                      <Download className="size-4 stroke-2" />
                    </Link>
                  )}
                </div>

                {issue.subtitle && (
                  <BodyMd className="text-muted-foreground mt-1 font-light leading-relaxed">
                    {issue.subtitle}
                  </BodyMd>
                )}
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
