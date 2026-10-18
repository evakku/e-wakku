import type { AboutPageData } from "@/components/about/types";

export const ABOUT_PAGE_DATA: AboutPageData = {
  heroTitle: "A curation of modern thought and aesthetic living.",
  heroDescription:
    "E-Wakku was founded on the belief that amidst the noise of the digital age, there remains a profound need for quiet reflection, in-depth reporting, and visual restraint.\n\nWe publish stories that matter, presented in a space designed for focus.",
  missionTitle: "Our Mission",
  missionDescription:
    "To document the intersection of culture, technology, and design through an editorial lens that values clarity over volume. We strive to provide our readers with a respite—a digital environment that feels as tactile and considered as premium print.\n\nEvery article, photograph, and layout is crafted to respect the reader's time and attention. We embrace minimalism not as an aesthetic trend, but as a functional necessity for deep reading.",
  missionImage: "/images/media__1780745927835.png",
  editorialBoard: [
    {
      name: "Sarah Jenkins",
      role: "Editor-in-Chief",
      photo: "/images/media__1780753392835.png",
      bio: "Sarah has over 15 years of experience in magazine publishing, leading teams at several global culture publications.",
    },
    {
      name: "Marcus Chen",
      role: "Creative Director",
      photo: "/images/media__1780753398117.png",
      bio: "Marcus shapes the visual identity of E-Wakku, combining classic typography with contemporary layout design.",
    },
    {
      name: "Elena Rodriguez",
      role: "Senior Editor",
      photo: "/images/media__1780754512680.png",
      bio: "Elena commissions and edits long-form features, focusing on design culture, artisanal craft, and architectural history.",
    },
  ],
};

export async function getAboutPage(): Promise<AboutPageData> {
  return ABOUT_PAGE_DATA;
}
