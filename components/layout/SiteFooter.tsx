"use client";

import Footer from "@/components/footer/Footer";
import type { ReactNode } from "react";
import { EXTERNAL_BLOG_URL } from "@/lib/constants/navigation";
import type { FooterLink } from "@/components/footer/types";

/**
 * SiteFooter
 *
 * Thin wrapper that wires project-specific content into the reusable <Footer>
 * component. To adapt for another project, update the constants below and
 * leave components/footer/ untouched.
 */

const FOOTER_LINKS: readonly FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "All Issues", href: "/allIssues" },
  { label: "Blog", href: EXTERNAL_BLOG_URL, external: true },
] as const;

const CURRENT_YEAR = new Date().getFullYear();

interface SiteFooterProps {
  attribution?: ReactNode;
}

export default function SiteFooter({ attribution }: SiteFooterProps = {}) {
  return (
    <Footer
      brandName="E-Wakku"
      copyrightText={`© ${CURRENT_YEAR} E-Wakku. All rights reserved.`}
      links={[...FOOTER_LINKS]}
      attribution={attribution}
    />
  );
}
