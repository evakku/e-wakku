import type { ContactPageData } from "@/components/contact/types";

// Static replacement for the old Sanity "contact page" singleton.
// Edit these values directly, or later swap this for a Supabase `settings`
// table read if you want it editable from the admin panel.

export function getContactPage(): ContactPageData {
    return {
        contactTitle: "Get in Touch",
        contactDescription:
            "Whether you have a story pitch, a question about our archives, or simply want to say hello, we're always open to conversation.",
    };
}