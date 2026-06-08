/**
 * Sanity GROQ Queries for E-Wakku
 * ─────────────────────────────────────────────────────────────────────
 * These queries define the data shape retrieved from the Sanity CMS.
 */

// Fetches the featured issue (highest priority featured flag, or most recently published)
export const featuredIssueQuery = `
  *[_type == "issue"] | order(featured desc, publishedDate desc)[0] {
    _id,
    title,
    subtitle,
    description,
    coverImage,
    pdfUrl,
    slug,
    publishedDate
  }
`;

// Fetches the 6 most recent issues, excluding the featured issue ID passed as a parameter
export const recentIssuesQuery = `
  *[_type == "issue" && _id != $featuredId] | order(publishedDate desc)[0...6] {
    _id,
    title,
    subtitle,
    description,
    coverImage,
    pdfUrl,
    slug,
    publishedDate
  }
`;

// Fetches global newsletter CTA content settings
export const newsletterSettingsQuery = `
  *[_type == "newsletterSettings"][0] {
    _id,
    heading,
    description,
    buttonText
  }
`;

// Fetches About page content settings
export const aboutPageQuery = `
  *[_type == "aboutPage"][0] {
    _id,
    heroTitle,
    heroDescription,
    heroEyebrow,
    missionTitle,
    missionDescription,
    missionImage,
    editorialBoard[] {
      name,
      role,
      photo,
      bio
    }
  }
`;
