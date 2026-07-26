import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { Issue, NewsletterSettings } from '@/components/magazine/types';
import type { AboutPageData } from '@/components/about/types';
import type { ContactPageData } from '@/components/contact/types';
import { featuredIssueQuery, recentIssuesQuery, newsletterSettingsQuery, aboutPageQuery, contactPageQuery } from './queries';

// Environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-11';

// Is Sanity CMS configured?
const isSanityConfigured = Boolean(projectId && projectId !== 'dummy');

// Instantiate client (using dummy credentials in mock mode to avoid instantiation errors)
export const client = createClient({
  projectId: projectId || 'dummy-project-id',
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
  // Allow running without projectId during local development fallback
  token: undefined,
});

const builder = createImageUrlBuilder(client);

type ImageSource = Parameters<typeof builder.image>[0];

/**
 * Builds a url for a Sanity image reference
 */
export function urlFor(source: ImageSource) {
  return builder.image(source);
}

/**
 * Resolves any image source (Sanity Image reference or local static string) to a URL string
 */
export function getImageUrl(source: ImageSource | string | undefined | null): string {
  if (!source) return '';
  if (typeof source === 'string') {
    return source;
  }
  if (source && source.asset) {
    try {
      return urlFor(source).url();
    } catch (error) {
      console.error('Error generating Sanity image URL:', error);
      return '';
    }
  }
  return '';
}

/* ─── Mock Data Layer ────────────────────────────────────────────────────── */

const MOCK_ISSUES: Issue[] = [
  {
    _id: 'issue-the-architecture-of-silence',
    title: 'The Architecture of Silence',
    subtitle: 'Issue 42 • Autumn 2024',
    description: 'An exploration into the spaces between noise. This issue delves deep into minimalist design, silent retreats, and the psychological impact of acoustic architecture in modern metropolitan environments. We explore how subtraction creates meaning.',
    coverImage: '/images/architecture_of_silence_cover.png',
    pdfUrl: '/assets/documents/issue-42-the-architecture-of-silence.pdf',
    slug: 'the-architecture-of-silence',
    publishedDate: '2024-10-15',
  },
  {
    _id: 'issue-minimalist-spaces',
    title: 'Minimalist Spaces',
    subtitle: 'Issue 41 • Summer 2024',
    description: 'Looking into the essence of architectural subtraction and how pure forms shape human consciousness.',
    coverImage: '/images/architecture_of_silence_cover.png',
    pdfUrl: '/assets/documents/issue-41-minimalist-spaces.pdf',
    slug: 'minimalist-spaces',
    publishedDate: '2024-07-15',
  },
  {
    _id: 'issue-august-2024',
    title: 'August 2024',
    subtitle: 'Spaces & Places',
    description: 'An exploration of domesticity, interior design philosophy, and the spaces we curate to call home.',
    coverImage: '/images/august-2024.png',
    pdfUrl: '#',
    slug: 'august-2024',
    publishedDate: '2024-08-15',
  },
  {
    _id: 'issue-july-2024',
    title: 'July 2024',
    subtitle: 'The Maker\'s Mark',
    description: 'Celebrating craft, tactile materials, and the resurgence of handmade processes in a digital era.',
    coverImage: '/images/july-2024.png',
    pdfUrl: '#',
    slug: 'july-2024',
    publishedDate: '2024-07-15',
  },
];

const MOCK_NEWSLETTER_SETTINGS: NewsletterSettings = {
  _id: 'newsletter-settings',
  heading: 'Stay Informed',
  description: 'Receive updates when new issues are published.',
  buttonText: 'Subscribe',
};

const MOCK_ABOUT_PAGE: AboutPageData = {
  heroTitle: "A curation of modern thought and aesthetic living.",
  heroDescription: "The Journal was founded on the belief that amidst the noise of the digital age, there remains a profound need for quiet reflection, in-depth reporting, and visual restraint.\n\nWe publish stories that matter, presented in a space designed for focus.",
  heroEyebrow: "EST. 2024",
  missionTitle: "Our Mission",
  missionDescription: "To document the intersection of culture, technology, and design through an editorial lens that values clarity over volume. We strive to provide our readers with a respite—a digital environment that feels as tactile and considered as premium print.\n\nEvery article, photograph, and layout is crafted to respect the reader's time and attention. We embrace minimalism not as an aesthetic trend, but as a functional necessity for deep reading.",
  missionImage: "/images/media__1780745927835.png",
  editorialBoard: [
    {
      name: "Sarah Jenkins",
      role: "Editor-in-Chief",
      photo: "/images/media__1780753392835.png",
      bio: "Sarah has over 15 years of experience in magazine publishing, leading teams at several global culture publications."
    },
    {
      name: "Marcus Chen",
      role: "Creative Director",
      photo: "/images/media__1780753398117.png",
      bio: "Marcus shapes the visual identity of The Journal, combining classic typography with contemporary layout design."
    },
    {
      name: "Elena Rodriguez",
      role: "Senior Editor",
      photo: "/images/media__1780754512680.png",
      bio: "Elena commissions and edits long-form features, focusing on design culture, artisanal craft, and architectural history."
    }
  ]
};

const MOCK_CONTACT_PAGE: ContactPageData = {
  contactTitle: "Get in Touch",
  contactDescription: "Whether you have a story pitch, a question about our archives, or simply want to say hello, we're always open to conversation.",
  contactEmail: "hello@thejournal.com",
  socialLinks: [
    { label: "Twitter", url: "https://twitter.com/thejournal" },
    { label: "LinkedIn", url: "https://linkedin.com/company/thejournal" },
    { label: "Instagram", url: "https://instagram.com/thejournal" }
  ]
};

/* ─── Client Fetch Wrappers ──────────────────────────────────────────────── */

/**
 * Fetches the featured issue.
 * Falls back to mock data if Sanity is not configured or fails.
 */
export async function getFeaturedIssue(): Promise<Issue | null> {
  if (!isSanityConfigured) {
    // Artificial latency for loading skeleton visualization in dev
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_ISSUES[0] || null;
  }

  try {
    const featured = await client.fetch<Issue | null>(featuredIssueQuery);
    return featured || MOCK_ISSUES[0] || null;
  } catch (error) {
    console.error('Failed to fetch featured issue from Sanity, using mock fallback:', error);
    return MOCK_ISSUES[0] || null;
  }
}

/**
 * Fetches recent issues, excluding the featured issue.
 * Falls back to mock data if Sanity is not configured or fails.
 */
export async function getRecentIssues(featuredId?: string): Promise<Issue[]> {
  if (!isSanityConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const targetFeaturedId = featuredId || MOCK_ISSUES[0]?._id;
    return MOCK_ISSUES.filter((issue) => issue._id !== targetFeaturedId);
  }

  try {
    const featured = featuredId || (await getFeaturedIssue())?._id;
    return await client.fetch<Issue[]>(recentIssuesQuery, { featuredId: featured || '' });
  } catch (error) {
    console.error('Failed to fetch recent issues from Sanity, using mock fallback:', error);
    const targetFeaturedId = featuredId || MOCK_ISSUES[0]?._id;
    return MOCK_ISSUES.filter((issue) => issue._id !== targetFeaturedId);
  }
}

/**
 * Fetches newsletter CTA settings.
 * Falls back to mock data if Sanity is not configured or fails.
 */
export async function getNewsletterSettings(): Promise<NewsletterSettings> {
  if (!isSanityConfigured) {
    return MOCK_NEWSLETTER_SETTINGS;
  }

  try {
    const settings = await client.fetch<NewsletterSettings | null>(newsletterSettingsQuery);
    return settings || MOCK_NEWSLETTER_SETTINGS;
  } catch (error) {
    console.error('Failed to fetch newsletter settings from Sanity, using mock fallback:', error);
    return MOCK_NEWSLETTER_SETTINGS;
  }
}

/**
 * Fetches the About Page settings.
 * Falls back to mock data if Sanity is not configured or fails.
 */
export async function getAboutPage(): Promise<AboutPageData> {
  if (!isSanityConfigured) {
    // Artificial latency for premium feel visualization in dev
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_ABOUT_PAGE;
  }

  try {
    const data = await client.fetch<AboutPageData | null>(aboutPageQuery);
    return data || MOCK_ABOUT_PAGE;
  } catch (error) {
    console.error('Failed to fetch about page from Sanity, using mock fallback:', error);
    return MOCK_ABOUT_PAGE;
  }
}

/**
 * Fetches the Contact Page settings.
 * Falls back to mock data if Sanity is not configured or fails.
 */
export async function getContactPage(): Promise<ContactPageData> {
  if (!isSanityConfigured) {
    // Artificial latency for premium feel visualization in dev
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_CONTACT_PAGE;
  }

  try {
    const data = await client.fetch<ContactPageData | null>(contactPageQuery);
    return data || MOCK_CONTACT_PAGE;
  } catch (error) {
    console.error('Failed to fetch contact page from Sanity, using mock fallback:', error);
    return MOCK_CONTACT_PAGE;
  }
}
