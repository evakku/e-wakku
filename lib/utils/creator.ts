/**
 * Formats the creator attribution label for display in the issue management UI.
 *
 * Display Rules:
 * - If the creator's display name is known, return that name.
 * - If creator UUID is present but name could not be resolved, return "Admin".
 * - If creator UUID is null/absent (e.g. legacy issues predating attribution, or deleted creator),
 *   return "Legacy issue".
 *
 * @param creatorName - Resolved display name of the creator (if known).
 * @param creatorId - Supabase Auth UUID of the creator (if assigned).
 * @returns Clean, formatted attribution string.
 */
export function formatCreatorLabel(
  creatorName?: string | null,
  creatorId?: string | null
): string {
  if (creatorName && creatorName.trim()) {
    return creatorName.trim();
  }
  if (creatorId) {
    return "Admin";
  }
  return "Legacy issue";
}
