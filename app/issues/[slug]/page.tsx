import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Legacy route redirect (FE-01)
 * 301 Permanent Redirect to canonical /issue/[slug] route.
 */
export default async function RedirectIssuesPage({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/issue/${slug}`);
}
