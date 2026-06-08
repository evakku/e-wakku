"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { DisplayXL, BodyLg } from "@/src/components/ui/typography";

interface ContactHeroProps {
  title: string;
  description: string;
}

export default function ContactHero({ title, description }: ContactHeroProps) {
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
    <div className="flex flex-col items-center text-center max-w-[800px] mx-auto w-full">
      <motion.div
        variants={fadeUpVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center"
      >
        <DisplayXL as="h1" className="text-foreground tracking-tight font-heading mb-6 leading-tight text-[clamp(2.5rem,6vw+0.5rem,4rem)]">
          {title}
        </DisplayXL>
        <BodyLg className="text-muted-foreground font-light max-w-2xl leading-relaxed">
          {description}
        </BodyLg>
      </motion.div>
    </div>
  );
}
