import type { MetadataRoute } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

/**
 * Dynamic sitemap generation (FE-06)
 * Includes all published issue pages and replaces /archive with /allIssues.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://e-wakku.com";

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/allIssues`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
    ];

    // Dynamically generate URLs for all published issues
    try {
        const { url, anonKey } = getSupabaseConfig();
        const supabase = createSupabaseClient(url, anonKey);
        const { data: issues } = await supabase
            .from("issues")
            .select("id, published_at")
            .eq("is_draft", false)
            .order("published_at", { ascending: false });

        if (issues && issues.length > 0) {
            const issueRoutes: MetadataRoute.Sitemap = issues.map((issue) => ({
                url: `${baseUrl}/issue/${issue.id}`,
                lastModified: issue.published_at
                    ? new Date(issue.published_at)
                    : new Date(),
                changeFrequency: "monthly" as const,
                priority: 0.8,
            }));

            return [...staticRoutes, ...issueRoutes];
        }
    } catch (err) {
        console.error("Failed to generate dynamic sitemap entries:", err);
    }

    return staticRoutes;
}