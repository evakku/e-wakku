"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeadlineLg, DisplayXL, LabelCaps, BodyLg } from "@/src/components/ui/typography";
import { fadeUpVariants, staggerContainer } from "@/lib/animations";
import type { ArchiveItem } from "@/data/mockArchives";

interface FeaturedArchiveProps {
  item: ArchiveItem;
}

export default function FeaturedArchive({ item }: FeaturedArchiveProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={staggerContainer}
      className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16 items-center border-b border-border/20 pb-16 mb-16"
      aria-label="Featured Archive Item"
    >
      {/* Left side: Editorial Content */}
      <motion.div
        variants={fadeUpVariants(shouldReduceMotion)}
        className="flex flex-col lg:col-span-5 order-2 lg:order-1"
      >
        <div className="flex items-center gap-3 mb-4">
          <Badge
            variant="outline"
            className="text-[11px] tracking-wider font-sans uppercase font-bold text-accent border-accent/30 px-2.5 py-0.5 h-5.5 bg-accent/5"
          >
            FEATURED {item.category}
          </Badge>
          <span className="text-xs text-muted-foreground font-sans font-medium">
            {formatDate(item.publishedDate)}
          </span>
        </div>

        <HeadlineLg className="text-foreground tracking-tight font-heading mb-5 font-normal leading-tight">
          {item.title}
        </HeadlineLg>

        <BodyLg className="text-muted-foreground mb-8 font-light leading-relaxed max-w-xl">
          {item.description}
        </BodyLg>

        <div>
          <Link href={`/issue/${item.slug}`}>
            <Button
              variant="default"
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white flex items-center gap-2.5 h-12 shadow-sm font-medium transition-editorial px-6 rounded-md cursor-pointer text-base"
              aria-label={`Read featured item ${item.title}`}
            >
              <BookOpen className="size-4 shrink-0" />
              Read Article
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Right side: Large cover showcase */}
      <motion.div
        variants={fadeUpVariants(shouldReduceMotion)}
        className="lg:col-span-7 order-1 lg:order-2"
      >
        <Link href={`/issue/${item.slug}`} className="group block focus:outline-none">
          <div className="relative aspect-[7/5] w-full overflow-hidden rounded-2xl bg-muted border border-border/10 shadow-paper-lg group-focus-visible:ring-3 group-focus-visible:ring-ring transition-editorial">
            {item.coverImage ? (
              <Image
                src={item.coverImage}
                alt={`Featured Image for ${item.title}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 700px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-light">
                No Featured Image
              </div>
            )}
            {/* Elegant vignette shadow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
