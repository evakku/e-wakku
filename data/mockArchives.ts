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
  },
  {
    id: "acoustic-subtraction-quiet-room",
    title: "Acoustic Subtraction",
    category: "Projects",
    description: "An architectural study on sound-dampening structures, materials, and form configurations for high-density metropolitan offices.",
    coverImage: "/images/media__1780745927835.png",
    publishedDate: "2023-04-10",
    readTime: "14 min read",
    slug: "acoustic-subtraction-quiet-room"
  },
  {
    id: "tactility-matte-surfaces",
    title: "The Tactility of Matte Surfaces",
    category: "Blogs",
    description: "Why physical textures and matte screen coatings create a less fatiguing, more intimate reading experience than high-gloss panels.",
    coverImage: "/images/media__1780746202659.png",
    publishedDate: "2023-02-18",
    readTime: "4 min read",
    slug: "tactility-matte-surfaces"
  },
  {
    id: "visual-restraint-corporate-branding",
    title: "Visual Restraint",
    category: "Case Studies",
    description: "A deep dive into how leading tech brands are scaling back their identity designs, adopting high-quality typography and muted colors.",
    coverImage: "/images/media__1780747925013.png",
    publishedDate: "2023-01-05",
    readTime: "11 min read",
    slug: "visual-restraint-corporate-branding"
  },
  {
    id: "css-grid-asymmetric-layouts",
    title: "CSS Grid Magazine Layouts",
    category: "Tutorials",
    description: "How to combine fractional grid rows, dynamic margins, and auto-placement rules to build print-like editorial columns online.",
    coverImage: "/images/media__1780749147995.png",
    publishedDate: "2022-11-28",
    readTime: "9 min read",
    slug: "css-grid-asymmetric-layouts"
  },
  {
    id: "performance-index-turbopack",
    title: "Performance Index",
    category: "Updates",
    description: "Reviewing page speed metrics and compiler latency improvements after porting E-Wakku from Webpack to Next.js Turbopack.",
    coverImage: "/images/media__1780749166106.png",
    publishedDate: "2022-10-15",
    readTime: "5 min read",
    slug: "performance-index-turbopack"
  },
  {
    id: "monochrome-ink-prints",
    title: "Monochrome & Ink",
    category: "Projects",
    description: "Design notes, grid drafts, and typography selection for our first limited-run physical anthology printed on recycled cotton papers.",
    coverImage: "/images/media__1780745927835.png",
    publishedDate: "2022-09-02",
    readTime: "7 min read",
    slug: "monochrome-ink-prints"
  },
  {
    id: "evolution-minimalist-hardware",
    title: "Evolution of Minimalist Hardware",
    category: "Blogs",
    description: "From Braun to modern-day smart devices, we trace the golden thread of structural clarity and functional simplicity.",
    coverImage: "/images/august-2024.png",
    publishedDate: "2022-08-21",
    readTime: "6 min read",
    slug: "evolution-minimalist-hardware"
  },
  {
    id: "accessible-forms-semantic-html",
    title: "Accessible Semantic Forms",
    category: "Tutorials",
    description: "Best practices for building custom input elements, labels, and validation helpers that remain fully accessible to screen readers.",
    coverImage: "/images/media__1780749154417.png",
    publishedDate: "2022-07-09",
    readTime: "8 min read",
    slug: "accessible-forms-semantic-html"
  },
  {
    id: "modular-typography-eink",
    title: "Modular Typography",
    category: "Case Studies",
    description: "How we optimized serif line height, letter spacing, and rendering scales for high-contrast, low-refresh-rate reader hardware.",
    coverImage: "/images/media__1780749154417.png",
    publishedDate: "2022-05-18",
    readTime: "10 min read",
    slug: "modular-typography-eink"
  },
  {
    id: "fluid-spacing-css",
    title: "Fluid Spacing Systems",
    category: "Tutorials",
    description: "Using clamp() math alongside design tokens to implement layouts that resize gracefully between small mobile and ultra-wide screens.",
    coverImage: "/images/media__1780749157620.png",
    publishedDate: "2022-04-12",
    readTime: "7 min read",
    slug: "fluid-spacing-css"
  },
  {
    id: "editorial-platform-roadmap",
    title: "Editorial Platform Roadmap",
    category: "Updates",
    description: "A comprehensive preview of upcoming features, including multi-author collaboration workspaces and draft preview links.",
    coverImage: "/images/media__1780753392835.png",
    publishedDate: "2022-03-01",
    readTime: "4 min read",
    slug: "editorial-platform-roadmap"
  },
  {
    id: "visualizing-code-architecture",
    title: "Visualizing Code",
    category: "Projects",
    description: "A computational design project translating clean code patterns, dependency graphs, and complexity files into 3D digital shapes.",
    coverImage: "/images/media__1780753398117.png",
    publishedDate: "2022-01-20",
    readTime: "9 min read",
    slug: "visualizing-code-architecture"
  },
  {
    id: "in-praise-negative-space",
    title: "In Praise of Negative Space",
    category: "Blogs",
    description: "Why modern web layout systems should embrace whitespace as a primary functional element rather than empty margins.",
    coverImage: "/images/media__1780754512680.png",
    publishedDate: "2021-12-15",
    readTime: "5 min read",
    slug: "in-praise-negative-space"
  },
  {
    id: "secluded-creative-residencies",
    title: "Secluded Creative Residencies",
    category: "Case Studies",
    description: "An analysis of how remote architectural retreats stimulate intense creative outputs for designers and programmers.",
    coverImage: "/images/july-2024.png",
    publishedDate: "2021-11-10",
    readTime: "13 min read",
    slug: "secluded-creative-residencies"
  }
];

export function getArchiveItemBySlug(slug: string): ArchiveItem | undefined {
  return mockArchivesList.find((item) => item.slug === slug);
}
