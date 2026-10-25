"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { DisplayXL, BodyLg, LabelCaps } from "@/src/components/ui/typography";

interface AboutHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export default function AboutHero({
  eyebrow = "ABOUT E-WAKKU",
  title,
  description,
}: AboutHeroProps) {
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
    <div className="flex flex-col items-center text-center max-w-[900px] mx-auto w-full">
      <motion.div
        variants={fadeUpVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center w-full"
      >
        {eyebrow && (
          <div className="mb-4 sm:mb-6">
            <LabelCaps className="text-[#059669] font-medium tracking-[0.15em] text-xs sm:text-sm">
              {eyebrow}
            </LabelCaps>
          </div>
        )}

        <DisplayXL
          as="h1"
          className="text-[#0F172A] tracking-tight font-heading mb-6 sm:mb-8 leading-[1.15] text-[clamp(2rem,5vw+0.5rem,3.5rem)] max-w-4xl"
        >
          {title}
        </DisplayXL>

        {/* Paragraph splits by newlines to render editorial paragraph styling */}
        <div className="flex flex-col gap-6 text-[#475569] font-sans leading-relaxed max-w-2xl mx-auto">
          {description.split("\n\n").map((para, index) => (
            <BodyLg key={index} className="text-[#475569] font-light font-sans text-base sm:text-lg text-justify">
              {para}
            </BodyLg>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
