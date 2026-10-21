/**
 * About Page Content Types
 *
 * Types for E-Wakku's editorial About page, communicating its identity
 * as a Malayalam digital magazine founded in 2025 focused on digital literacy.
 */

export interface AboutPageData {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;

  storyEyebrow: string;
  storyHeading: string;
  storyParagraphs: string[];

  missionEyebrow: string;
  missionHeading: string;
  missionParagraphs: string[];

  communityEyebrow: string;
  communityHeading: string;
  communityParagraphs: string[];

  latestIssueEyebrow: string;
  latestIssueHeading: string;
  latestIssueDescription: string;
}

/**
 * @deprecated Legacy editorial member type retained for backwards compatibility
 */
export interface EditorialMember {
  name: string;
  role: string;
  photo?: string;
  bio?: string;
}

