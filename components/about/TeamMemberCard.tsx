"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { BodyMd, LabelCaps } from "@/src/components/ui/typography";
import { getImageUrl } from "@/lib/sanity/client";
import type { EditorialMember } from "./types";

interface TeamMemberCardProps {
  member: EditorialMember;
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const imageUrl = getImageUrl(member.photo);

  const hoverAnimation: Variants = shouldReduceMotion
    ? {}
    : {
        hover: {
          scale: 1.04,
          transition: { duration: 0.25, ease: "easeOut" },
        },
      };

  return (
    <div className="flex flex-col items-center text-center p-4">
      {/* Portrait Image with subtle scale on hover */}
      <motion.div
        whileHover={shouldReduceMotion ? undefined : "hover"}
        variants={hoverAnimation}
        className="relative size-24 md:size-24 mb-5 overflow-hidden rounded-[18px] bg-muted border border-border/10 cursor-pointer shadow-paper-sm transition-editorial"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Portrait of ${member.name}, ${member.role}`}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs font-light">
            {member.name.charAt(0)}
          </div>
        )}
      </motion.div>

      {/* Details */}
      <div className="flex flex-col gap-1">
        <BodyMd className="font-sans font-medium text-foreground tracking-tight">
          {member.name}
        </BodyMd>
        <LabelCaps className="text-muted-foreground text-[10px] sm:text-[11px] tracking-wider block font-semibold">
          {member.role}
        </LabelCaps>
      </div>
    </div>
  );
}
