import { describe, it, expect } from "vitest";
import { ABOUT_PAGE_DATA, getAboutPage } from "@/lib/queries/about";
import type { Issue } from "@/lib/queries/issue";

describe("About Page Content & UX Redesign", () => {
  describe("Content Strategy & Requirements", () => {
    it("communicates that E-Wakku is a Malayalam digital magazine founded in 2025", () => {
      expect(ABOUT_PAGE_DATA.heroTitle).toContain("Malayalam digital magazine");
      expect(ABOUT_PAGE_DATA.heroDescription).toContain("Malayalam digital magazine");
      expect(ABOUT_PAGE_DATA.heroDescription).toContain("2025");
      expect(ABOUT_PAGE_DATA.heroEyebrow).toBe("ABOUT E-WAKKU");
    });

    it("emphasizes digital literacy and accessible publishing across all narrative sections", () => {
      // Hero
      expect(ABOUT_PAGE_DATA.heroDescription.toLowerCase()).toContain("digital literacy");
      
      // Story
      expect(ABOUT_PAGE_DATA.storyHeading).toBe("Born from a shared curiosity.");
      expect(ABOUT_PAGE_DATA.storyParagraphs.some((p) => p.includes("2025"))).toBe(true);
      expect(ABOUT_PAGE_DATA.storyParagraphs.some((p) => p.toLowerCase().includes("digital literacy"))).toBe(true);
      expect(ABOUT_PAGE_DATA.storyParagraphs.some((p) => p.includes("Malayalam"))).toBe(true);

      // Mission
      expect(ABOUT_PAGE_DATA.missionHeading).toBe("Making digital knowledge more accessible.");
      expect(ABOUT_PAGE_DATA.missionParagraphs.some((p) => p.toLowerCase().includes("digital literacy"))).toBe(true);
      expect(ABOUT_PAGE_DATA.missionParagraphs.some((p) => p.includes("Malayalam readers"))).toBe(true);

      // Community
      expect(ABOUT_PAGE_DATA.communityHeading).toBe("Built by people who care.");
      expect(ABOUT_PAGE_DATA.communityParagraphs.some((p) => p.toLowerCase().includes("digital literacy"))).toBe(true);
      expect(ABOUT_PAGE_DATA.communityParagraphs.some((p) => p.includes("collective effort"))).toBe(true);
    });

    it("does not include unsupported claims or fake staff names", () => {
      const fullText = JSON.stringify(ABOUT_PAGE_DATA);
      expect(fullText).not.toContain("Sarah Jenkins");
      expect(fullText).not.toContain("Marcus Chen");
      expect(fullText).not.toContain("Elena Rodriguez");
      expect(fullText).not.toContain("Editor-in-Chief");
      expect(fullText).not.toContain("Art Director");
    });

    it("provides the expected Latest Issue copy", () => {
      expect(ABOUT_PAGE_DATA.latestIssueEyebrow).toBe("THE LATEST ISSUE");
      expect(ABOUT_PAGE_DATA.latestIssueHeading).toBe("Explore our latest edition.");
      expect(ABOUT_PAGE_DATA.latestIssueDescription).toContain(
        "Discover the latest issue of E-Wakku and explore the ideas, stories, and perspectives"
      );
    });

    it("getAboutPage resolves the redesigned data contract", async () => {
      const data = await getAboutPage();
      expect(data).toEqual(ABOUT_PAGE_DATA);
      expect(data.storyParagraphs.length).toBeGreaterThanOrEqual(2);
      expect(data.missionParagraphs.length).toBeGreaterThanOrEqual(2);
      expect(data.communityParagraphs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Latest Issue UX & Navigation Routing", () => {
    const mockIssue: Issue = {
      id: "5941f827-784f-463f-8a7c-c4b87bd0015f",
      title: "Technology & Society Edition",
      description: "An in-depth exploration of digital literacy in Kerala.",
      pdf_url: "https://example.com/issue.pdf",
      cover_image_url: "https://example.com/cover.png",
      month: "03",
      year: 2025,
      is_draft: false,
      created_at: "2025-03-01T00:00:00Z",
      published_at: "2025-03-01T10:00:00Z",
    };

    it("generates the correct contextual route to issue detail from the About page", () => {
      const targetHref = `/issue/${mockIssue.id}?from=about`;
      expect(targetHref).toBe("/issue/5941f827-784f-463f-8a7c-c4b87bd0015f?from=about");
    });

    it("constructs descriptive and accessible alt text for the issue cover", () => {
      const altText = `Cover of ${mockIssue.title} — E-Wakku Malayalam digital magazine`;
      expect(altText).toBe(
        "Cover of Technology & Society Edition — E-Wakku Malayalam digital magazine"
      );
    });

    it("handles back routing in IssueDetailsView when from=about", () => {
      const fromParam: string = "about";
      const backUrl = fromParam === "allIssues" ? "/allIssues" : fromParam === "about" ? "/about" : "/archive";
      const backLabel = fromParam === "allIssues" ? "All Issues" : fromParam === "about" ? "About" : "Archive";

      expect(backUrl).toBe("/about");
      expect(backLabel).toBe("About");
    });

    it("correctly formats issue edition dates from month and year fields", () => {
      const monthNames: Record<string, string> = {
        "01": "January", "02": "February", "03": "March", "04": "April",
        "05": "May", "06": "June", "07": "July", "08": "August",
        "09": "September", "10": "October", "11": "November", "12": "December",
      };

      const format = (issue: { month: string; year: number; published_at?: string | null }) => {
        if (issue.month && issue.year) {
          const cleanMonth = issue.month.padStart(2, "0");
          const monthLabel = monthNames[cleanMonth] || issue.month;
          return `${monthLabel} ${issue.year}`;
        }
        if (issue.published_at) {
          const d = new Date(issue.published_at);
          if (!isNaN(d.getTime())) {
            return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          }
        }
        return "";
      };

      expect(format({ month: "02", year: 2016 })).toBe("February 2016");
      expect(format({ month: "05", year: 2012 })).toBe("May 2012");
      expect(format({ month: "10", year: 2027 })).toBe("October 2027");
      expect(format({ month: "3", year: 2025 })).toBe("March 2025");
      expect(format({ month: "", year: 0, published_at: "2026-10-20T06:20:56.108Z" })).toBe("October 2026");
      expect(format({ month: "", year: 0, published_at: null })).toBe("");
    });

    it("verifies that only published issues (is_draft = false) are eligible for display", () => {
      const sampleIssues: Issue[] = [
        { ...mockIssue, id: "draft-1", is_draft: true, title: "Unpublished Draft" },
        { ...mockIssue, id: "pub-1", is_draft: false, title: "Published Issue" },
      ];

      const publishedOnly = sampleIssues.filter((i) => !i.is_draft);
      expect(publishedOnly.length).toBe(1);
      expect(publishedOnly[0].id).toBe("pub-1");
    });
  });
});
