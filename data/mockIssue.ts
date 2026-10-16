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
