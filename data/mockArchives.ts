export interface ArchiveItem {
  id: string;
  title: string;
  category: 'Projects' | 'Blogs' | 'Case Studies' | 'Tutorials' | 'Updates';
  description: string;
  coverImage: string;
  publishedDate: string;
  readTime: string;
  slug: string;
  featured?: boolean;
}

export const mockArchivesList: ArchiveItem[] = [
  {
    id: "neural-frontier-ai-interfaces",
    title: "The Neural Frontier",
    category: "Projects",
    description: "Exploring the intersections of biological intelligence and generative systems in the new decade, crafting minimalist AI interfaces.",
    coverImage: "/images/october-2024.png",
    publishedDate: "2024-10-24",
    readTime: "8 min read",
    slug: "neural-frontier-ai-interfaces",
    featured: true
  },
  {
    id: "quiet-aesthetics-hardware-design",
    title: "Quiet Aesthetics",
    category: "Blogs",
    description: "How minimalism redefined the consumer hardware landscape of the mid-20s, prioritizing tactile presence over digital volume.",
    coverImage: "/images/august-2024.png",
    publishedDate: "2024-08-15",
    readTime: "5 min read",
    slug: "quiet-aesthetics-hardware-design"
  },
  {
    id: "remote-pivot-secluded-workspaces",
    title: "The Remote Pivot",
    category: "Case Studies",
    description: "A photographic journey and architectural analysis through the world's most secluded, inspiring creative workspaces.",
    coverImage: "/images/july-2024.png",
    publishedDate: "2024-07-15",
    readTime: "12 min read",
    slug: "remote-pivot-secluded-workspaces"
  },
  {
    id: "silicon-symbiosis-wearables",
    title: "Silicon Symbiosis",
    category: "Tutorials",
    description: "Tracing the evolution of wearable technology from utility to personal expression. Learn screen layout rules for calm UI design.",
    coverImage: "/images/architecture_of_silence_cover.png",
    publishedDate: "2024-06-12",
    readTime: "7 min read",
    slug: "silicon-symbiosis-wearables"
  },
  {
    id: "craft-issue-analog-resurgence",
    title: "The Craft Issue",
    category: "Blogs",
    description: "Celebrating the resurgence of analog craftsmanship, raw tactile textures, and letterpress printing in a digital-first economy.",
    coverImage: "/images/media__1780749154417.png",
    publishedDate: "2024-05-10",
    readTime: "6 min read",
    slug: "craft-issue-analog-resurgence"
  },
  {
    id: "platform-update-v2-editorial-engine",
    title: "Platform Update: Version 2.0 Engine",
    category: "Updates",
    description: "Introducing support for responsive typographic containers, modular grid spacing tokens, and smooth motion frameworks.",
    coverImage: "/images/media__1780749157620.png",
    publishedDate: "2024-04-02",
    readTime: "3 min read",
    slug: "platform-update-v2-editorial-engine"
  },
  {
    id: "voices-of-change-design-directors",
    title: "Voices of Change",
    category: "Case Studies",
    description: "Our annual selection of the designers, engineers, and creative directors shaping the next decade of digital design.",
    coverImage: "/images/media__1780753392835.png",
    publishedDate: "2023-12-05",
    readTime: "10 min read",
    slug: "voices-of-change-design-directors"
  },
  {
    id: "urban-equilibrium-sustainable-infrastructure",
    title: "Urban Equilibrium",
    category: "Projects",
    description: "How megacities are adapting to the demands of sustainable living, structural green infrastructure, and vertical communities.",
    coverImage: "/images/media__1780753398117.png",
    publishedDate: "2023-10-18",
    readTime: "9 min read",
    slug: "urban-equilibrium-sustainable-infrastructure"
  },
  {
    id: "digital-ether-navigating-privacy",
    title: "The Digital Ether",
    category: "Blogs",
    description: "Navigating the complexities of data privacy, user consent patterns, and cookie-less web analytics in modern web applications.",
    coverImage: "/images/media__1780754512680.png",
    publishedDate: "2023-08-20",
    readTime: "8 min read",
    slug: "digital-ether-navigating-privacy"
  },
  {
    id: "typography-noto-serif-inter",
    title: "Typography Design Scale",
    category: "Tutorials",
    description: "A developer's tutorial on pairing high-contrast serif headings with sleek sans-serif body copies for premium digital layouts.",
    coverImage: "/images/september-2024.png",
    publishedDate: "2023-06-15",
    readTime: "5 min read",
    slug: "typography-noto-serif-inter"
  }
];

export function getArchiveItemBySlug(slug: string): ArchiveItem | undefined {
  return mockArchivesList.find((item) => item.slug === slug);
}
