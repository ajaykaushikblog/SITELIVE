import {
  type Article,
  img,
  authors,
  trending,
  beauty,
  weddings,
  celebrations,
  recipes as recipeRow,
  seasonalSpotlight,
} from './content'
import { articlesBySlug } from './articles'
import { recipesBySlug } from './recipes'
import { diyBySlug } from './diy'

/* =========================================================================
   Universal author profile model.
   ONE template serves every contributor — writer, recipe developer, DIY
   maker, editor. All fields are dynamic; optional fields hide gracefully.
   Published content is aggregated from the author's real content
   relationships across articles, recipes and DIY projects.
   ========================================================================= */

export type ContentType = 'Article' | 'Recipe' | 'DIY' | 'Guide' | 'Ideas'

/* A card enriched with the taxonomy the profile filters on */
export type ContentCard = Article & {
  contentType: ContentType
  categories: string[]
  occasions: string[]
  seasons: string[]
}

export type SocialLink = {
  platform: 'Instagram' | 'Pinterest' | 'Facebook' | 'X' | 'TikTok' | 'YouTube' | 'Website'
  href: string
}

export type AuthorProfile = {
  id: string
  name: string
  slug: string
  profileImage: string
  professionalTitle: string
  shortBio: string
  longBio: string[]
  expertise: { label: string; href?: string }[]
  credentials?: string[]
  location?: string
  website?: string
  email?: string
  socialLinks: SocialLink[]
  yearsExperience?: number
  /* stats — omit any that aren't genuinely known */
  articleCount?: number
  recipeCount?: number
  diyCount?: number
  status: 'active' | 'inactive'
  seo: {
    seoTitle: string
    metaDescription: string
    canonicalUrl: string
    robots: string
    ogImage: string
  }
}

/* ---- Profiles (bio layer on the shared Author records) ---- */
export const authorProfiles: Record<string, AuthorProfile> = {
  'maya-reyes': {
    id: 'au-maya',
    name: authors.maya.name,
    slug: 'maya-reyes',
    profileImage: img('1544005313-94ddf0286df2', 400, 400),
    professionalTitle: 'Food & Recipes Editor',
    shortBio:
      'Maya develops cozy, crowd-pleasing recipes and party menus made for real kitchens and real weeknights.',
    longBio: [
      'Maya Reyes leads the food desk at Marigold & Maple, where she develops and tests every recipe until it works the first time in a home kitchen — no restaurant tricks, no hard-to-find ingredients.',
      'Before joining the team she spent a decade in recipe development and food styling, and she still believes the best dishes are the ones you can make for people you love on a Tuesday.',
    ],
    expertise: [
      { label: 'Recipes', href: '/recipes' },
      { label: 'Baking', href: '/recipes/desserts' },
      { label: 'Party Food', href: '/recipes/party-food' },
      { label: 'Seasonal Entertaining', href: '/recipes' },
    ],
    credentials: ['Culinary Arts, Institute of Culinary Education', '10+ years recipe development'],
    location: 'Portland, Oregon',
    website: 'https://mayacooks.example.com',
    email: 'maya@marigoldandmaple.com',
    socialLinks: [
      { platform: 'Instagram', href: '#' },
      { platform: 'Pinterest', href: '#' },
      { platform: 'YouTube', href: '#' },
      { platform: 'Website', href: '#' },
    ],
    yearsExperience: 12,
    recipeCount: 640,
    articleCount: 48,
    status: 'active',
    seo: {
      seoTitle: 'Maya Reyes — Food & Recipes Editor at Marigold & Maple',
      metaDescription:
        'Recipes, baking and seasonal entertaining from Maya Reyes, Food & Recipes Editor at Marigold & Maple.',
      canonicalUrl: 'https://marigoldandmaple.com/author/maya-reyes',
      robots: 'index,follow',
      ogImage: img('1544005313-94ddf0286df2', 1200, 630),
    },
  },

  'amanda-thompson': {
    id: 'au-amanda',
    name: authors.amanda.name,
    slug: 'amanda-thompson',
    profileImage: img('1438761681033-6461ffad8d80', 400, 400),
    professionalTitle: 'Weddings & Celebrations Editor',
    shortBio:
      'Amanda covers weddings, showers and celebrations — always chasing the details that make a gathering feel personal.',
    longBio: [
      'Amanda Thompson is our weddings and celebrations editor, covering everything from tablescapes and florals to real-couple details and budget-friendly styling.',
      'She has planned and styled celebrations for over eight years and loves proving that the most memorable details are the thoughtful ones, not the expensive ones.',
    ],
    expertise: [
      { label: 'Weddings', href: '/weddings' },
      { label: 'Wedding Decor', href: '/weddings/decor' },
      { label: 'Celebrations', href: '/parties' },
      { label: 'Tablescapes', href: '/weddings/tables' },
    ],
    credentials: ['Certified Event Planner', '8+ years styling weddings'],
    location: 'Charleston, South Carolina',
    socialLinks: [
      { platform: 'Instagram', href: '#' },
      { platform: 'Pinterest', href: '#' },
      { platform: 'TikTok', href: '#' },
    ],
    yearsExperience: 8,
    articleCount: 312,
    diyCount: 24,
    status: 'active',
    seo: {
      seoTitle: 'Amanda Thompson — Weddings & Celebrations Editor at Marigold & Maple',
      metaDescription:
        'Wedding ideas, tablescapes and celebration inspiration from Amanda Thompson, Weddings & Celebrations Editor at Marigold & Maple.',
      canonicalUrl: 'https://marigoldandmaple.com/author/amanda-thompson',
      robots: 'index,follow',
      ogImage: img('1438761681033-6461ffad8d80', 1200, 630),
    },
  },

  'alicia-butner': {
    id: 'au-alicia',
    name: authors.alicia.name,
    slug: 'alicia-butner',
    profileImage: img('1494790108377-be9c29b29330', 400, 400),
    professionalTitle: 'Home & Holidays Editor',
    shortBio:
      'Alicia shares handmade decor, seasonal crafts and cozy projects made for real homes and busy weekends.',
    longBio: [
      'Alicia Butner runs the home and holidays desk, where she designs handmade decor and step-by-step craft projects anyone can finish in an afternoon.',
      'A lifelong maker, she is happiest with a glue gun in hand and believes a home should feel warm and lived-in, not styled to perfection.',
    ],
    expertise: [
      { label: 'DIY & Crafts', href: '/diy' },
      { label: 'Holiday Crafts', href: '/diy/holiday-crafts' },
      { label: 'Home Decor', href: '/home-decor' },
      { label: 'Christmas', href: '/christmas' },
    ],
    location: 'Minneapolis, Minnesota',
    socialLinks: [
      { platform: 'Instagram', href: '#' },
      { platform: 'Pinterest', href: '#' },
      { platform: 'YouTube', href: '#' },
    ],
    yearsExperience: 9,
    diyCount: 274,
    articleCount: 130,
    status: 'active',
    seo: {
      seoTitle: 'Alicia Butner — Home & Holidays Editor at Marigold & Maple',
      metaDescription:
        'DIY projects, seasonal crafts and cozy home decor from Alicia Butner, Home & Holidays Editor at Marigold & Maple.',
      canonicalUrl: 'https://marigoldandmaple.com/author/alicia-butner',
      robots: 'index,follow',
      ogImage: img('1494790108377-be9c29b29330', 1200, 630),
    },
  },

  'jordan-blake': {
    id: 'au-jordan',
    name: authors.jordan.name,
    slug: 'jordan-blake',
    profileImage: img('1500648767791-00dcc994a43e', 400, 400),
    professionalTitle: 'Beauty & Lifestyle Writer',
    shortBio:
      'Jordan writes about nails, makeup and self-care, with a soft spot for seasonal looks anyone can recreate at home.',
    longBio: [
      'Jordan Blake covers beauty and lifestyle, translating runway and salon trends into looks that work for real budgets and real mornings.',
      'From seasonal manicures to five-minute self-care rituals, Jordan believes beauty should feel like a treat, never a chore.',
    ],
    expertise: [
      { label: 'Nails', href: '/nails' },
      { label: 'Makeup', href: '/makeup' },
      { label: 'Self Care', href: '/self-care' },
      { label: 'Seasonal Beauty', href: '/beauty' },
    ],
    location: 'Los Angeles, California',
    socialLinks: [
      { platform: 'Instagram', href: '#' },
      { platform: 'Pinterest', href: '#' },
      { platform: 'X', href: '#' },
      { platform: 'TikTok', href: '#' },
    ],
    yearsExperience: 6,
    articleCount: 198,
    status: 'active',
    seo: {
      seoTitle: 'Jordan Blake — Beauty & Lifestyle Writer at Marigold & Maple',
      metaDescription:
        'Nail ideas, makeup and self-care inspiration from Jordan Blake, Beauty & Lifestyle Writer at Marigold & Maple.',
      canonicalUrl: 'https://marigoldandmaple.com/author/jordan-blake',
      robots: 'index,follow',
      ogImage: img('1500648767791-00dcc994a43e', 1200, 630),
    },
  },
}

export function getAuthorProfile(slug: string): AuthorProfile | undefined {
  return authorProfiles[slug]
}

/* -------------------------------------------------------------------------
   Aggregate an author's published content from real content relationships
   across every content type, tagging each card so the profile can filter.
   ------------------------------------------------------------------------- */
function toCard(
  a: Article,
  contentType: ContentType,
  extra?: { categories?: string[]; occasions?: string[]; seasons?: string[] },
): ContentCard {
  return {
    ...a,
    contentType,
    categories: extra?.categories ?? [a.category],
    occasions: extra?.occasions ?? [],
    seasons: extra?.seasons ?? [],
  }
}

export function contentForAuthor(name: string): ContentCard[] {
  const cards: ContentCard[] = []

  /* Full articles */
  for (const a of Object.values(articlesBySlug)) {
    if (a.author.name !== name) continue
    cards.push(
      toCard(
        {
          id: a.id,
          title: a.title,
          category: a.subcategory || a.category,
          href: `/article/${a.slug}`,
          image: a.featuredImage,
          author: a.author,
          date: a.publishedDate,
          readTime: a.readTime,
        },
        a.contentType.includes('Guide') ? 'Guide' : 'Article',
        { categories: [a.category, a.subcategory], occasions: a.occasions, seasons: a.seasons },
      ),
    )
  }

  /* Full recipes */
  for (const r of Object.values(recipesBySlug)) {
    if (r.author.name !== name) continue
    cards.push(
      toCard(
        {
          id: r.id,
          title: r.title,
          category: r.subcategory || r.category,
          href: `/recipe/${r.slug}`,
          image: r.featuredImage,
          author: r.author,
          date: r.publishedDate,
          readTime: r.totalTime,
        },
        'Recipe',
        { categories: [r.category, r.subcategory ?? ''], occasions: r.occasions, seasons: r.seasons },
      ),
    )
  }

  /* Full DIY projects */
  for (const d of Object.values(diyBySlug)) {
    if (d.author.name !== name) continue
    cards.push(
      toCard(
        {
          id: d.id,
          title: d.title,
          category: d.subcategory || d.category,
          href: `/diy/${d.slug}`,
          image: d.featuredImage,
          author: d.author,
          date: d.publishedDate,
          readTime: d.timeRequired,
        },
        'DIY',
        { categories: [d.category, d.subcategory ?? ''], occasions: d.occasions, seasons: d.seasons },
      ),
    )
  }

  /* Content rows (homepage/category seed data) */
  const rowRecipeIds = new Set(recipeRow.map((r) => r.id))
  const rows: Article[] = [
    ...trending,
    ...beauty,
    ...weddings,
    ...celebrations,
    ...recipeRow,
    ...seasonalSpotlight.articles,
  ]
  for (const a of rows) {
    if (a.author.name !== name) continue
    const type: ContentType = rowRecipeIds.has(a.id) ? 'Recipe' : 'Ideas'
    cards.push(toCard(a, type))
  }

  return cards
}

/* Distinct topics the author actually publishes in (for "Explore … Topics") */
const topicHref: Record<string, string> = {
  Christmas: '/christmas',
  Weddings: '/weddings',
  'Wedding Decor': '/weddings/decor',
  Nails: '/nails',
  Beauty: '/beauty',
  'Self Care': '/self-care',
  'DIY & Crafts': '/diy',
  'Christmas Crafts': '/diy/christmas-crafts',
  'Holiday Crafts': '/diy/holiday-crafts',
  Desserts: '/recipes/desserts',
  Drinks: '/recipes/drinks',
  Dinner: '/recipes/dinner',
  Cookies: '/recipes/desserts',
  'Party Food': '/recipes/party-food',
  Food: '/recipes',
  'Party Decor': '/parties',
  Birthdays: '/birthdays',
  'Baby Showers': '/baby-showers',
  Inspiration: '/ideas',
}

export function topicsForAuthor(cards: ContentCard[]): { label: string; href: string }[] {
  const seen = new Map<string, string>()
  for (const c of cards) {
    for (const cat of c.categories) {
      if (!cat) continue
      if (!seen.has(cat)) seen.set(cat, topicHref[cat] ?? `/ideas`)
    }
  }
  return [...seen.entries()].map(([label, href]) => ({ label, href }))
}
