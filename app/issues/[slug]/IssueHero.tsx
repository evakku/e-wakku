"use client";

import { motion, useReducedMotion } from "framer-motion";
import IssueCover from "./IssueCover";
import IssueInformation from "./IssueInformation";
import type { Issue } from "@/data/mockIssue";

interface IssueHeroProps {
  issue: Issue;
}

export default function IssueHero({ issue }: IssueHeroProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  // Stagger wrapper variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center"
    >
      {/* Cover Image Column (5 columns out of 12 on desktop) */}
      <div className="lg:col-span-5 order-1">
        <IssueCover title={issue.title} coverImage={issue.coverImage} />
      </div>

      {/* Information Column (7 columns out of 12 on desktop) */}
      <div className="lg:col-span-7 order-2 lg:pl-4">
        <IssueInformation issue={issue} />
      </div>
    </motion.div>
  );
}
