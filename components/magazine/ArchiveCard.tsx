"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUpVariants } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { HeadlineMd, BodyMd, LabelCaps } from "@/src/components/ui/typography";
import type { ArchiveItem } from "@/data/mockArchives";

interface ArchiveCardProps {
  item: ArchiveItem;
}

export default function ArchiveCard({ item }: ArchiveCardProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  // Formatting date to a readable format: e.g., "OCTOBER 2024"
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }).toUpperCase();
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.article
      variants={fadeUpVariants(shouldReduceMotion)}
      className="group flex flex-col h-full bg-card rounded-lg overflow-hidden border border-border/10 shadow-paper-sm hover:shadow-paper-md transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Card Image Cover */}
      <Link
        href={`/issue/${item.slug}`}
        className="block relative aspect-[4/5] overflow-hidden bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2"
        tabIndex={0}
      >
        {item.coverImage ? (
          <Image
            src={item.coverImage}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-light">
            No Cover Image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-60 pointer-events-none" />
      </Link>

      {/* Card Content Area */}
      <div className="flex flex-col flex-1 p-6">
        {/* Category & Date Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge
            variant="outline"
            className="text-[10px] tracking-wider font-sans uppercase font-semibold text-accent border-accent/20 px-2 py-0 h-4.5 bg-accent/5"
          >
            {item.category}
          </Badge>
          <span className="text-[10px] tracking-wider text-muted-foreground font-sans font-semibold uppercase">
            {formatDate(item.publishedDate)}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/issue/${item.slug}`}
          className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
        >
          <HeadlineMd className="text-xl font-heading font-normal text-foreground group-hover:text-accent transition-colors duration-200 line-clamp-2 leading-tight">
            {item.title}
          </HeadlineMd>
        </Link>

        {/* Description */}
        <BodyMd className="text-muted-foreground mt-2 font-light line-clamp-2 leading-relaxed flex-1">
          {item.description}
        </BodyMd>

        {/* Bottom Metadata & CTA */}
        <div className="mt-5 pt-4 border-t border-border/10 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-sans font-medium">{item.readTime}</span>
          
          <Link
            href={`/issue/${item.slug}`}
            className="inline-flex items-center gap-1 font-semibold text-accent group-hover:text-accent/80 transition-colors uppercase tracking-wider text-[11px] font-sans"
          >
            Read More
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
