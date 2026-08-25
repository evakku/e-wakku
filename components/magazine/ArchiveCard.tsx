"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUpVariants } from "@/lib/animations";
import { ArrowRight, BookOpen } from "lucide-react";
import type { ArchiveItem } from "@/data/mockArchives";

interface ArchiveCardProps {
  item: ArchiveItem;
}

export default function ArchiveCard({ item }: ArchiveCardProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.article
      variants={fadeUpVariants(shouldReduceMotion)}
      className="group flex flex-col h-full bg-white rounded-[20px] p-4 sm:p-5 border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:shadow-slate-200/80 transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-300"
    >
      {/* Cover Image Container — Generous Padding & object-contain centering */}
      <Link
        href={`/issue/${item.slug}`}
        className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-[#F8FAFC] border border-slate-200/70 flex items-center justify-center p-3 transition-colors duration-300 group-hover:border-slate-300 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#059669]"
      >
        {item.coverImage ? (
          <Image
            src={item.coverImage}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-contain object-center p-2 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-center text-xs font-light text-slate-400">
            <BookOpen className="size-6 text-slate-400 stroke-[1.5]" />
            <span>No Cover Image</span>
          </div>
        )}
      </Link>

      {/* Card Content Area */}
      <div className="flex flex-col flex-1 pt-4 sm:pt-5">
        {/* Title */}
        <Link
          href={`/issue/${item.slug}`}
          className="group/title focus-visible:outline-none"
        >
          <h3 className="line-clamp-2 font-heading text-lg sm:text-xl font-bold leading-snug text-[#0F172A] transition-colors duration-200 group-hover/title:text-[#059669]">
            {item.title}
          </h3>
        </Link>

        {/* Description */}
        {item.description && (
          <p className="mt-2.5 line-clamp-2 text-xs sm:text-sm font-normal leading-relaxed text-[#475569] flex-1">
            {item.description}
          </p>
        )}

        {/* Month & Year */}
        {item.publishedDate && (
          <p className="mt-3 text-xs font-semibold text-[#059669] tracking-wide">
            {formatDate(item.publishedDate)}
          </p>
        )}

        {/* Read More Button */}
        <div className="mt-4 pt-2">
          <Link
            href={`/issue/${item.slug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F1F5F9] hover:bg-[#059669] border border-[#CBD5E1] hover:border-[#059669] px-4 py-2.5 text-xs font-semibold text-[#0F172A] hover:text-white transition-all duration-200 cursor-pointer shadow-sm group/btn"
          >
            <span>Read More</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
