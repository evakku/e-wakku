"use client";

import { motion } from "framer-motion";
import Container from "./Container";
import Section from "./Section";
import type { PageHeaderProps } from "./types";

/**
 * PageHeader
 *
 * Reusable editorial page header used across About, Contact, Archive,
 * Issue, Search, and any future page.
 *
 * Renders:
 *   [badge]        ← optional label caps above title
 *   [title]        ← h1 in Noto Serif
 *   [description]  ← prose paragraph in Inter
 *   [actions]      ← optional button / link row
 *
 * Usage:
 * ```tsx
 * <PageHeader
 *   title="Get in Touch"
 *   badge="Contact"
 *   description="Whether you have a story pitch..."
 *   align="center"
 * />
 *
 * <PageHeader
 *   title="October 2024"
 *   badge="Latest Issue"
 *   actions={<DownloadButton />}
 *   align="left"
 * />
 * ```
 */

const alignClass = {
  left:   "items-start text-left",
  center: "items-center text-center",
  right:  "items-end text-right",
};

const titleEase = [0.4, 0, 0.2, 1] as [number, number, number, number];

export default function PageHeader({
  title,
  badge,
  description,
  actions,
  align = "center",
  className = "",
  sectionVariant = "hero",
}: PageHeaderProps) {
  return (
    <Section variant={sectionVariant} bg="surface">
      <Container size="md">
        <motion.div
          className={[
            "flex flex-col gap-4",
            alignClass[align],
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* Badge / label */}
          {badge && (
            <motion.p
              className="type-label-caps text-[#059669]"
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: titleEase } },
              }}
            >
              {badge}
            </motion.p>
          )}

          {/* Title — h1, Noto Serif */}
          <motion.h1
            className="type-headline-lg text-[#0F172A] max-w-2xl"
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: titleEase } },
            }}
          >
            {title}
          </motion.h1>

          {/* Description */}
          {description && (
            <motion.p
              className="type-body-lg text-[#64748B] max-w-xl"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: titleEase } },
              }}
            >
              {description}
            </motion.p>
          )}

          {/* Actions */}
          {actions && (
            <motion.div
              className="flex flex-wrap gap-3 mt-2"
              style={{
                justifyContent:
                  align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
              }}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: titleEase } },
              }}
            >
              {actions}
            </motion.div>
          )}
        </motion.div>
      </Container>
    </Section>
  );
}
