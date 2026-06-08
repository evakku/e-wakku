"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { HeadlineLg } from "@/src/components/ui/typography";
import TeamMemberCard from "./TeamMemberCard";
import type { EditorialMember } from "./types";

interface EditorialBoardProps {
  title?: string;
  members: EditorialMember[];
}

export default function EditorialBoard({
  title = "Editorial Board",
  members,
}: EditorialBoardProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="flex flex-col w-full items-center">
      {title && (
        <HeadlineLg className="text-foreground tracking-tight font-heading mb-12 sm:mb-16 text-center">
          {title}
        </HeadlineLg>
      )}

      {/* Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 sm:gap-y-16 w-full max-w-5xl justify-items-center"
      >
        {members.map((member, index) => (
          <motion.div
            key={`${member.name}-${index}`}
            variants={itemVariants}
            className="w-full max-w-sm"
          >
            <TeamMemberCard member={member} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
