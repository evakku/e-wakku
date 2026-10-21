"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { HeadlineLg, BodyLg, LabelCaps } from "@/src/components/ui/typography";
import type { AboutPageData } from "./types";

interface AboutNarrativeProps {
  data: AboutPageData;
}

export default function AboutNarrative({ data }: AboutNarrativeProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  const fadeUpVariants: Variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="flex flex-col gap-16 sm:gap-24 lg:gap-28 w-full max-w-5xl mx-auto">
      {/* ── Section 2: Our Story ────────────────────────────────────── */}
      <motion.section
        variants={fadeUpVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-80px" }}
        className="flex flex-col w-full"
        aria-labelledby="story-heading"
      >
        <div className="mb-3 sm:mb-4">
          <LabelCaps className="text-[#059669] font-medium tracking-[0.15em] text-xs">
            {data.storyEyebrow}
          </LabelCaps>
        </div>

        <HeadlineLg
          id="story-heading"
          as="h2"
          className="text-[#0F172A] font-heading font-serif tracking-tight mb-6 sm:mb-8 text-2xl sm:text-3xl lg:text-4xl max-w-3xl"
        >
          {data.storyHeading}
        </HeadlineLg>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 text-[#475569] font-sans leading-relaxed">
          {data.storyParagraphs.map((para, index) => (
            <BodyLg key={index} className="text-[#475569] font-light text-base sm:text-lg">
              {para}
            </BodyLg>
          ))}
        </div>
      </motion.section>

      {/* ── Section 3 & 4: Mission & Community ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 pt-12 sm:pt-16 border-t border-[#E2E8F0]">
        {/* Section 3: Our Mission */}
        <motion.section
          variants={fadeUpVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col w-full"
          aria-labelledby="mission-heading"
        >
          <div className="mb-3 sm:mb-4">
            <LabelCaps className="text-[#059669] font-medium tracking-[0.15em] text-xs">
              {data.missionEyebrow}
            </LabelCaps>
          </div>

          <HeadlineLg
            id="mission-heading"
            as="h2"
            className="text-[#0F172A] font-heading font-serif tracking-tight mb-6 text-2xl sm:text-3xl"
          >
            {data.missionHeading}
          </HeadlineLg>

          <div className="flex flex-col gap-4 text-[#475569] font-sans leading-relaxed">
            {data.missionParagraphs.map((para, index) => (
              <BodyLg key={index} className="text-[#475569] font-light text-base sm:text-lg">
                {para}
              </BodyLg>
            ))}
          </div>
        </motion.section>

        {/* Section 4: Our Community */}
        <motion.section
          variants={fadeUpVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col w-full"
          aria-labelledby="community-heading"
        >
          <div className="mb-3 sm:mb-4">
            <LabelCaps className="text-[#059669] font-medium tracking-[0.15em] text-xs">
              {data.communityEyebrow}
            </LabelCaps>
          </div>

          <HeadlineLg
            id="community-heading"
            as="h2"
            className="text-[#0F172A] font-heading font-serif tracking-tight mb-6 text-2xl sm:text-3xl"
          >
            {data.communityHeading}
          </HeadlineLg>

          <div className="flex flex-col gap-4 text-[#475569] font-sans leading-relaxed">
            {data.communityParagraphs.map((para, index) => (
              <BodyLg key={index} className="text-[#475569] font-light text-base sm:text-lg">
                {para}
              </BodyLg>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
