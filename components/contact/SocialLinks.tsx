"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { LabelCaps } from "@/src/components/ui/typography";
import type { SocialLink } from "./types";

interface SocialLinksProps {
  links: SocialLink[];
  divider?: boolean;
}

export default function SocialLinks({ links, divider = true }: SocialLinksProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  const hoverAnimation: Variants = shouldReduceMotion
    ? {}
    : {
        hover: {
          scale: 1.05,
          color: "var(--accent)", // Emerald accent color
          transition: { duration: 0.2, ease: "easeOut" },
        },
      };

  return (
    <div className="w-full flex flex-col items-center">
      {divider && (
        <div className="w-full max-w-[200px] h-px bg-border/40 mb-12" aria-hidden="true" />
      )}
      
      <nav aria-label="Social media directories" className="w-full flex justify-center">
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4 max-w-xl">
          {links.map((link, index) => (
            <li key={`${link.label}-${index}`}>
              <motion.a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={shouldReduceMotion ? undefined : "hover"}
                variants={hoverAnimation}
                className={[
                  "inline-block font-sans text-xs text-muted-foreground",
                  "transition-colors duration-200 outline-none",
                  "focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-1 py-0.5",
                ].join(" ")}
              >
                <LabelCaps className="font-semibold tracking-widest text-[11px]">
                  {link.label}
                </LabelCaps>
              </motion.a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
