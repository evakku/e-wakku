import type { NewsletterSettings } from "@/components/magazine/types";

// Static replacement for the old Sanity "newsletter settings" singleton.
// Edit these values directly, or later swap this for a Supabase `settings`
// table read if you want it editable from the admin panel.

export function getNewsletterSettings(): NewsletterSettings {
  return {
    heading: "Stay in the loop",
    description: "Get each new issue of The Journal delivered straight to your inbox.",
    buttonText: "Subscribe",
  };
}