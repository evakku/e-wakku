/**
 * Image helper utility replacing legacy CMS image URL resolvers (INF-03).
 */
export function getImageUrl(
  source: string | { asset?: { url?: string } } | undefined | null
): string {
  if (!source) return "";
  if (typeof source === "string") return source;
  if (typeof source === "object" && source && "asset" in source) {
    return source.asset?.url || "";
  }
  return "";
}
