import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { Issue, NewsletterSettings } from '@/components/magazine/types';
import type { AboutPageData } from '@/components/about/types';
import { featuredIssueQuery, recentIssuesQuery, newsletterSettingsQuery, aboutPageQuery } from './queries';

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

const builder = imageUrlBuilder(client);

/**
 * Builds a url for a Sanity image reference
 */
export function urlFor(source: any) {
  return builder.image(source);
}

/**
 * Resolves any image source (Sanity Image reference or local static string) to a URL string
 */
export function getImageUrl(source: any): string {
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
    _id: 'issue-october-2024',
    title: 'October 2024',
    subtitle: 'The Architecture of Tomorrow',
    description: 'Exploring the intersection of modern architecture, sustainable living, and the evolving landscape of urban design in our rapidly changing world.',
    coverImage: '/images/october-2024.png',
    pdfUrl: '#',
    slug: 'october-2024',
    publishedDate: '2024-10-15',
  },
  {
    _id: 'issue-september-2024',
    title: 'September 2024',
    subtitle: 'The Art of Stillness',
    description: 'A quiet examination of minimalist aesthetics, silent spaces, and the power of pause in our hyper-connected lives.',
    coverImage: '/images/september-2024.png',
    pdfUrl: '#',
    slug: 'september-2024',
    publishedDate: '2024-09-15',
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
