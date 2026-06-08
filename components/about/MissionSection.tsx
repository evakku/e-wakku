"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { HeadlineLg, BodyLg } from "@/src/components/ui/typography";
import { getImageUrl } from "@/lib/sanity/client";
import type { SanityImageReference } from "@/components/magazine/types";

interface MissionSectionProps {
  title?: string;
  description: string;
  image: SanityImageReference | string;
}

export default function MissionSection({
  title = "Our Mission",
  description,
  image,
}: MissionSectionProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const imageUrl = getImageUrl(image);

  // Text slides left (starts shifted right)
  const textVariants: Variants = {
    initial: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : 24,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Image slides right (starts shifted left)
  const imageVariants: Variants = {
    initial: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : -24,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
      {/* Left: Mission Content */}
      <motion.div
        variants={textVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-col justify-center order-1"
      >
        <HeadlineLg className="text-foreground tracking-tight font-heading mb-6 lg:mb-8">
          {title}
        </HeadlineLg>
        
        <div className="flex flex-col gap-6 text-muted-foreground font-sans leading-relaxed max-w-xl">
          {description.split("\n\n").map((para, index) => (
            <BodyLg key={index} className="font-light font-sans">
              {para}
            </BodyLg>
          ))}
        </div>
      </motion.div>

      {/* Right: Mission Image */}
      <motion.div
        variants={imageVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        className="order-2 w-full"
      >
        <div className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted border border-border/10 shadow-paper-md">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Editorial illustration of publication mission"
              fill
              sizes="(max-width: 1024px) 100vw, 550px"
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-light">
              No Mission Image
            </div>
          )}
          {/* Subtle overlay shading for elegant look */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}
