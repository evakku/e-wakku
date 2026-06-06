import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import "./globals.css";

/**
 * Root Layout — pure shell
 *
 * Responsibilities:
 * - Load fonts and inject CSS variables
 * - Set root <html> and <body> attributes
 * - Apply global styles
 *
 * Navigation, footer, and page chrome live in route-group layouts:
 *   app/(public)/layout.tsx  → PublicLayout (Navbar + Footer)
 *   app/admin/layout.tsx     → AdminLayout  (Sidebar + Top bar)
 *
 * This keeps the root layout a pure Server Component with zero client-side
 * dependencies.
 */

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "E-Wakku",
    template: "%s | E-Wakku",
  },
  description: "E-Wakku — a premium editorial experience",
  openGraph: {
    siteName: "E-Wakku",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
