"use client";

import Footer from "@/components/footer/Footer";

/**
 * SiteFooter
 *
 * Thin wrapper that wires project-specific content into the reusable <Footer>
 * component. To adapt for another project, update the constants below and
 * leave components/footer/ untouched.
 */

const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "All Issues", href: "/allIssues" },
  { label: "Newsletter", href: "/newsletter" },
] as const;

const CURRENT_YEAR = new Date().getFullYear();

export default function SiteFooter() {
  return (
    <Footer
      brandName="E-Wakku"
      copyrightText={`© ${CURRENT_YEAR} E-Wakku. All rights reserved.`}
      links={[...FOOTER_LINKS]}
    />
  );
}
