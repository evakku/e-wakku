export interface Issue {
  id: string;
  title: string;
  issueNumber: string;
  season: string;
  year: string;
  description: string;
  coverImage: string;
  pdfUrl?: string;
  pageCount: number;
}

export const mockIssue: Issue = {
  id: "the-architecture-of-silence",
  title: "The Architecture of Silence",
  issueNumber: "42",
  season: "Autumn",
  year: "2024",
  description: "An exploration into the spaces between noise. This issue delves deep into minimalist design, silent retreats, and the psychological impact of acoustic architecture in modern metropolitan environments. We explore how subtraction creates meaning.",
  coverImage: "/images/architecture_of_silence_cover.png",
  pdfUrl: "/assets/documents/issue-42-the-architecture-of-silence.pdf", // Mock URL
  pageCount: 48,
};

export const mockIssuesList: Issue[] = [
  mockIssue,
  {
    id: "minimalist-spaces",
    title: "Minimalist Spaces",
    issueNumber: "41",
    season: "Summer",
    year: "2024",
    description: "Looking into the essence of architectural subtraction and how pure forms shape human consciousness.",
    coverImage: "/images/architecture_of_silence_cover.png", // reusing the same for mock purposes
    pdfUrl: "/assets/documents/issue-41-minimalist-spaces.pdf",
    pageCount: 52,
  },
  {
    id: "august-2024",
    title: "August 2024",
    issueNumber: "40",
    season: "Summer",
    year: "2024",
    description: "An exploration of domesticity, interior design philosophy, and the spaces we curate to call home.",
    coverImage: "/images/august-2024.png",
    pdfUrl: "#",
    pageCount: 64,
  },
  {
    id: "july-2024",
    title: "July 2024",
    issueNumber: "39",
    season: "Summer",
    year: "2024",
    description: "Celebrating craft, tactile materials, and the resurgence of handmade processes in a digital era.",
    coverImage: "/images/july-2024.png",
    pdfUrl: "#",
    pageCount: 60,
  }
];

import { mockArchivesList } from "./mockArchives";

export function getIssueBySlug(slug: string): Issue | undefined {
  const issue = mockIssuesList.find(
    (issue) => issue.id === slug || issue.title.toLowerCase().replace(/ /g, "-") === slug
  );
  if (issue) return issue;

  const archiveItem = mockArchivesList.find(
    (item) => item.slug === slug || item.id === slug || item.title.toLowerCase().replace(/ /g, "-") === slug
  );

  if (archiveItem) {
    const year = archiveItem.publishedDate.split("-")[0] || "2024";
    const dateObj = new Date(archiveItem.publishedDate);
    const month = dateObj.toLocaleDateString("en-US", { month: "long" });

    return {
      id: archiveItem.id,
      title: archiveItem.title,
      issueNumber: archiveItem.category,
      season: month.toUpperCase(),
      year: year,
      description: archiveItem.description,
      coverImage: archiveItem.coverImage,
      pdfUrl: "#",
      pageCount: Math.ceil(parseInt(archiveItem.readTime) * 1.5) || 8,
    };
  }

  return undefined;
}
