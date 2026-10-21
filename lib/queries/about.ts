import type { AboutPageData } from "@/components/about/types";

/**
 * ABOUT_PAGE_DATA
 *
 * Official content for E-Wakku — a Malayalam digital magazine founded in 2025
 * by people passionate about digital literacy and accessible publishing.
 */
export const ABOUT_PAGE_DATA: AboutPageData = {
  heroEyebrow: "ABOUT E-WAKKU",
  heroTitle: "A Malayalam digital magazine for a more digitally literate world.",
  heroDescription:
    "E-Wakku is a Malayalam digital magazine founded in 2025 by people united by a shared passion for digital literacy. We believe meaningful ideas deserve thoughtful attention, and that language should never be a barrier to understanding the digital world.",

  storyEyebrow: "OUR STORY",
  storyHeading: "Born from a shared curiosity.",
  storyParagraphs: [
    "E-Wakku began in 2025 with a simple belief: digital literacy matters, and everyone deserves the opportunity to understand the world shaped by technology and information.",
    "Built by people who care about digital literacy and Malayalam communication, E-Wakku is a space for sharing ideas, encouraging curiosity, and making digital knowledge more approachable for Malayalam readers.",
  ],

  missionEyebrow: "OUR MISSION",
  missionHeading: "Making digital knowledge more accessible.",
  missionParagraphs: [
    "Our mission is to encourage digital literacy among Malayalam readers through meaningful digital publishing. We aim to make ideas easier to explore, information easier to understand, and the digital world easier to navigate.",
    "We believe that informed readers are better equipped to question, learn, participate, and make thoughtful decisions in an increasingly digital society.",
  ],

  communityEyebrow: "OUR COMMUNITY",
  communityHeading: "Built by people who care.",
  communityParagraphs: [
    "E-Wakku is run by people who share a passion for digital literacy and the possibilities of Malayalam digital publishing. Our collective effort is guided by curiosity, a commitment to meaningful content, and the belief that knowledge grows when it is shared.",
  ],

  latestIssueEyebrow: "THE LATEST ISSUE",
  latestIssueHeading: "Explore our latest edition.",
  latestIssueDescription:
    "Discover the latest issue of E-Wakku and explore the ideas, stories, and perspectives featured in this edition.",
};

export async function getAboutPage(): Promise<AboutPageData> {
  return ABOUT_PAGE_DATA;
}
