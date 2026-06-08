"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeadlineMd, BodyMd } from "@/src/components/ui/typography";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-dashed border-border/60 rounded-2xl max-w-xl mx-auto bg-card/30">
      {/* Icon */}
      <div className="size-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mb-6">
        <BookOpen className="size-6 stroke-[1.5]" />
      </div>

      {/* Heading */}
      <HeadlineMd className="text-foreground tracking-tight font-heading mb-2">
        No publications yet
      </HeadlineMd>

      {/* Description */}
      <BodyMd className="text-muted-foreground font-light max-w-sm mb-8 leading-relaxed">
        Our editorial team is preparing the first issue. Please stay tuned or check back later.
      </BodyMd>

      {/* CTA Button */}
      <Link href="/contact">
        <Button
          variant="outline"
          size="lg"
          className="border-border hover:bg-muted text-foreground transition-editorial h-11 px-6 rounded-md font-medium cursor-pointer"
        >
          Contact Us
        </Button>
      </Link>
    </div>
  );
}
