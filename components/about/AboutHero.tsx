"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { DisplayXL, LabelCaps, BodyLg } from "@/src/components/ui/typography";

interface AboutHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export default function AboutHero({
  eyebrow = "EST. 2024",
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
        ease: [0.4, 0, 0.2, 1], // Standard E-Wakku easing
      },
    },
  };

  return (
    <div className="flex flex-col items-center text-center max-w-[900px] mx-auto w-full">
      <motion.div
        variants={fadeUpVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center"
      >
        {eyebrow && (
          <LabelCaps className="text-muted-foreground/80 mb-6 tracking-[0.2em] font-medium block">
            {eyebrow}
          </LabelCaps>
        )}
        
        <DisplayXL as="h1" className="text-foreground tracking-tight font-heading mb-8 leading-[1.15] text-[clamp(2rem,6vw+0.5rem,3.75rem)]">
          {title}
        </DisplayXL>
        
        {/* Paragraph splits by newlines to render editorial paragraph styling */}
        <div className="flex flex-col gap-6 text-muted-foreground font-sans leading-relaxed">
          {description.split("\n\n").map((para, index) => (
            <BodyLg key={index} className="text-muted-foreground font-light font-sans max-w-2xl mx-auto">
              {para}
            </BodyLg>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
