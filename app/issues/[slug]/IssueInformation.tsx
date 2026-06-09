"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Download, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DisplayXL, LabelCaps, BodyLg } from "@/src/components/ui/typography";
import type { Issue } from "@/data/mockIssue";

interface IssueInformationProps {
  issue: Issue;
}

export default function IssueInformation({ issue }: IssueInformationProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  // slideLeft animation variants for editorial content entering
  const slideLeftVariants = {
    hidden: { x: shouldReduceMotion ? 0 : 30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // Premium bezier curve
      },
    },
  };

  const handleReadOnlineClick = () => {
    const viewerSection = document.getElementById("digital-archive-viewer");
    if (viewerSection) {
      viewerSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.div
      variants={slideLeftVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col justify-center h-full max-w-xl"
    >
      {/* Eyebrow metadata */}
      <LabelCaps className="text-accent mb-4 tracking-widest font-semibold block">
        Issue {issue.issueNumber} • {issue.season} {issue.year}
      </LabelCaps>

      {/* Primary editorial heading in Noto Serif */}
      <DisplayXL className="text-foreground tracking-tight font-heading font-normal text-4xl sm:text-5xl lg:text-6xl mb-6 leading-[1.15]">
        {issue.title}
      </DisplayXL>

      {/* Description copy in Inter */}
      <BodyLg className="text-slate-600 mb-8 font-light leading-relaxed text-base sm:text-lg">
        {issue.description}
      </BodyLg>

      {/* Buttons actions: stack on mobile, horizontal row on tablet and desktop */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
        {/* Download Button */}
        <Button
          variant="default"
          size="lg"
          className="bg-black text-white hover:bg-slate-900 border-none transition-colors duration-200 flex items-center justify-center gap-2.5 h-12 shadow-sm font-medium rounded cursor-pointer px-6"
          onClick={() => {
            if (issue.pdfUrl) {
              // Trigger programmatic mock download
              const link = document.createElement("a");
              link.href = issue.pdfUrl;
              link.download = `${issue.id}-issue-${issue.issueNumber}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
          aria-label={`Download PDF edition of Issue ${issue.issueNumber}: ${issue.title}`}
        >
          <Download className="size-4 shrink-0 stroke-[2.25]" />
          <span>Download</span>
        </Button>

        {/* Read Online Button */}
        <Button
          variant="ghost"
          size="lg"
          className="border border-transparent text-slate-800 hover:bg-slate-100 hover:text-black transition-colors duration-200 flex items-center justify-center gap-2.5 h-12 font-medium rounded cursor-pointer px-6"
          onClick={handleReadOnlineClick}
          aria-label={`Read Issue ${issue.issueNumber}: ${issue.title} online inside the archive viewer`}
        >
          <BookOpen className="size-4 shrink-0 text-slate-500 stroke-[2]" />
          <span>Read Online</span>
        </Button>
      </div>
    </motion.div>
  );
}
