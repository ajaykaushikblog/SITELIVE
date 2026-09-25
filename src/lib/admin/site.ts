/* =========================================================================
   Phase 16 — Site management data architecture (front-end prototype).

   Homepage, navigation, mega menus, footer, collections and seasonal
   campaigns are all DATA, not code. Editors add/remove/reorder sections,
   nav items and collections without a developer creating a new component
   for each one. The public site keeps using its existing universal
   components — these models describe what those components should render.

   Everything here is illustrative placeholder data for UI development.
   Real persistence, scheduling, auth and content queries arrive in the
   backend phase. No fake analytics — placeholders are labelled.
   ========================================================================= */

import { contentItems, taxonomyByKind, type ContentTypeId } from './cms'
import { SITE_URL_FALLBACK } from './cms'

/* -------------------------------------------------------------------------
   1. Homepage sections
   ------------------------------------------------------------------------- */

/** Reusable section renderers. One component per TYPE, never per section. */
export type SectionType =
  | 'featured'
  | 'article-grid'
  | 'editorial-feature'
  | 'trending'
  | 'latest'
  | 'seasonal'
  | 'category-collection'
  | 'occasion-collection'
  | 'recipe-collection'
  | 'diy-collection'
  | 'author-collection'
  | 'manual-collection'
  | 'newsletter'
  | 'advertisement'
  | 'sponsored'

export const sectionTypes: { id: SectionType; label: string; hint: string }[] = [
  { id: 'featured', label: 'Featured Content', hint: 'Hero-scale primary story with supporting stories.' },
  { id: 'article-grid', label: 'Article Grid', hint: 'A responsive grid of cards from any source.' },
  { id: 'editorial-feature', label: 'Large Editorial Feature', hint: 'One oversized editorial story.' },
  { id: 'trending', label: 'Trending Content', hint: 'Auto: most-saved / most-viewed (placeholder).' },
  { id: 'latest', label: 'Latest Content', hint: 'Auto: newest published items.' },
  { id: 'seasonal', label: 'Seasonal Collection', hint: 'Date-driven seasonal campaign block.' },
  { id: 'category-collection', label: 'Category Collection', hint: 'Content from a category taxonomy term.' },
  { id: 'occasion-collection', label: 'Occasion Collection', hint: 'Content from an occasion taxonomy term.' },
  { id: 'recipe-collection', label: 'Recipe Collection', hint: 'Recipes from any source.' },
  { id: 'diy-collection', label: 'DIY Collection', hint: 'DIY & tutorials from any source.' },
  { id: 'author-collection', label: 'Author Collection', hint: 'Content by a chosen author.' },
  { id: 'manual-collection', label: 'Manual Collection', hint: 'Hand-picked items in a chosen order.' },
  { id: 'newsletter', label: 'Newsletter', hint: 'Existing newsletter signup block.' },
  { id: 'advertisement', label: 'Advertisement', hint: 'Centralized ad slot (Phase 8).' },
  { id: 'sponsored', label: 'Sponsored Content', hint: 'Native sponsored block (Phase 8).' },
]

export function sectionTypeDef(id: SectionType) {
  return sectionTypes.find((t) => t.id === id) ?? sectionTypes[0]
}

/** Where a section pulls content from. Manual overrides automatic ordering. */
export type SourceMode =
  | 'automatic'
  | 'manual'
  | 'category'
  | 'subcategory'
  | 'occasion'
  | 'season'
  | 'tag'
  | 'collection'

export const sourceModes: { id: SourceMode; label: string }[] = [
  { id: 'automatic', label: 'Automatic' },
  { id: 'manual', label: 'Manual' },
  { id: 'category', label: 'Category' },
  { id: 'subcategory', label: 'Subcategory' },
  { id: 'occasion', label: 'Occasion' },
  { id: 'season', label: 'Season' },
  { id: 'tag', label: 'Tag' },
  { id: 'collection', label: 'Collection' },
]

export type SectionLayout = 'grid-4' | 'grid-3' | 'grid-2' | 'carousel' | 'hero-split' | 'list'
export const sectionLayouts: { id: SectionLayout; label: string }[] = [
  { id: 'grid-4', label: 'Grid — 4 across' },
  { id: 'grid-3', label: 'Grid — 3 across' },
  { id: 'grid-2', label: 'Grid — 2 across' },
  { id: 'carousel', label: 'Carousel' },
  { id: 'hero-split', label: 'Hero split' },
  { id: 'list', label: 'List' },
]

export type StyleVariant = 'default' | 'soft' | 'seasonal' | 'inverted'
export const styleVariants: { id: StyleVariant; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'soft', label: 'Soft background' },
  { id: 'seasonal', label: 'Seasonal accent' },
  { id: 'inverted', label: 'Inverted (dark)' },
]

/** Editorial placement priority — never a numeric "quality score". */
export type EditorialPriority = 'normal' | 'high' | 'featured'
export const editorialPriorities: EditorialPriority[] = ['normal', 'high', 'featured']

/** Scheduling status shared by homepage sections and seasonal campaigns. */
export type ScheduleStatus = 'draft' | 'scheduled' | 'active' | 'expired' | 'disabled'
export const scheduleStatusMeta: Record<ScheduleStatus, { label: string; tone: string }> = {
  draft: { label: 'Draft', tone: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Scheduled', tone: 'bg-primary/12 text-primary' },
  active: { label: 'Active', tone: 'bg-success/15 text-success' },
  expired: { label: 'Expired', tone: 'bg-secondary text-secondary-foreground' },
  disabled: { label: 'Disabled', tone: 'bg-error/12 text-error' },
}

export type HomepageSection = {
  id: string
  name: string
  type: SectionType
  heading: string
  description?: string
  source: SourceMode
  /** taxonomy term id, collection id, or author slug depending on `source` */
  sourceRef?: string
  /** hand-picked content ids used when source === 'manual' */
  contentIds: string[]
  itemCount: number
  layout: SectionLayout
  variant: StyleVariant
  priority: EditorialPriority
  enabled: boolean
  order: number
  startDate?: string
  endDate?: string
  status: ScheduleStatus
}

/* Seed homepage — mirrors the current public homepage, but now editable. */
export const homepageSections: HomepageSection[] = [
  { id: 'hs-1', name: 'Featured Story', type: 'featured', heading: 'Featured', description: 'Primary hero + supporting stories.', source: 'manual', contentIds: ['c-1001', 'c-1004', 'c-1005'], itemCount: 3, layout: 'hero-split', variant: 'default', priority: 'featured', enabled: true, order: 0, status: 'active' },
  { id: 'hs-2', name: 'Trending Now', type: 'trending', heading: 'Trending Now', source: 'automatic', contentIds: [], itemCount: 4, layout: 'grid-4', variant: 'default', priority: 'high', enabled: true, order: 1, status: 'active' },
  { id: 'hs-3', name: 'Homepage Billboard Ad', type: 'advertisement', heading: 'Advertisement', source: 'automatic', sourceRef: 'homepage_mid', contentIds: [], itemCount: 1, layout: 'list', variant: 'soft', priority: 'normal', enabled: true, order: 2, status: 'active' },
  { id: 'hs-4', name: 'Seasonal Spotlight', type: 'seasonal', heading: 'Cozy Fall Inspiration', description: 'Swaps automatically as campaigns activate.', source: 'collection', sourceRef: 'col-1', contentIds: [], itemCount: 4, layout: 'grid-4', variant: 'seasonal', priority: 'high', enabled: true, order: 3, startDate: '2026-09-01', endDate: '2026-11-27', status: 'active' },
  { id: 'hs-5', name: 'Browse by Category', type: 'category-collection', heading: 'Browse by Category', source: 'category', contentIds: [], itemCount: 6, layout: 'grid-3', variant: 'default', priority: 'normal', enabled: true, order: 4, status: 'active' },
  { id: 'hs-6', name: 'Recipes & Food', type: 'recipe-collection', heading: 'Recipes & Food', source: 'category', sourceRef: 't-recipes', contentIds: [], itemCount: 4, layout: 'grid-4', variant: 'default', priority: 'normal', enabled: true, order: 5, status: 'active' },
  { id: 'hs-7', name: 'Beauty & Nails', type: 'article-grid', heading: 'Beauty & Nails', source: 'category', sourceRef: 't-nails', contentIds: [], itemCount: 4, layout: 'grid-4', variant: 'default', priority: 'normal', enabled: true, order: 6, status: 'active' },
  { id: 'hs-8', name: 'Sponsored Feature', type: 'sponsored', heading: 'Sponsored', source: 'automatic', contentIds: [], itemCount: 1, layout: 'list', variant: 'soft', priority: 'normal', enabled: true, order: 7, status: 'active' },
  { id: 'hs-9', name: 'Weddings & Celebrations', type: 'occasion-collection', heading: 'Weddings & Celebrations', source: 'occasion', sourceRef: 'o-weddings', contentIds: [], itemCount: 4, layout: 'grid-4', variant: 'default', priority: 'normal', enabled: true, order: 8, status: 'active' },
  { id: 'hs-10', name: 'DIY & Crafts', type: 'diy-collection', heading: 'DIY & Crafts', source: 'category', sourceRef: 't-diy', contentIds: [], itemCount: 4, layout: 'grid-4', variant: 'default', priority: 'normal', enabled: false, order: 9, status: 'draft' },
  { id: 'hs-11', name: 'Newsletter', type: 'newsletter', heading: 'Get seasonal ideas every Sunday', source: 'automatic', contentIds: [], itemCount: 1, layout: 'list', variant: 'inverted', priority: 'normal', enabled: true, order: 10, status: 'active' },
]

/* -------------------------------------------------------------------------
   2. Featured hero
   ------------------------------------------------------------------------- */
export type HeroStory = {
  id: string
  /** content item id (article/recipe/diy/guide) OR empty for a custom card */
  contentId?: string
  customHeading?: string
  customDescription?: string
  image?: string
  cta?: string
  ctaHref?: string
  startDate?: string
  endDate?: string
  enabled: boolean
}

export const heroConfig: { primary: HeroStory; supporting: HeroStory[] } = {
  primary: { id: 'hero-p', contentId: 'c-1001', cta: 'Read the guide', enabled: true, startDate: '2026-09-01', endDate: '2026-12-31' },
  supporting: [
    { id: 'hero-s1', contentId: 'c-1004', enabled: true },
    { id: 'hero-s2', contentId: 'c-1005', enabled: true },
    { id: 'hero-s3', contentId: 'c-1015', enabled: true },
  ],
}

/* -------------------------------------------------------------------------
   3. Seasonal campaigns
   ------------------------------------------------------------------------- */
export type CampaignKind = 'season' | 'occasion'
export type SeasonalCampaign = {
  id: string
  name: string
  kind: CampaignKind
  heading: string
  description?: string
  source: SourceMode
  sourceRef?: string
  image?: string
  cta?: string
  ctaHref?: string
  startDate: string
  endDate: string
  priority: number // lower = shown first when several are active
  enabled: boolean
  status: ScheduleStatus
}

export const seasonalCampaigns: SeasonalCampaign[] = [
  { id: 'sc-fall', name: 'Fall Inspiration', kind: 'season', heading: 'Cozy Fall Inspiration', description: 'Warm recipes, decor and crafts.', source: 'season', sourceRef: 'se-fall', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=70', cta: 'Explore fall', ctaHref: '/fall', startDate: '2026-09-01', endDate: '2026-11-27', priority: 2, enabled: true, status: 'active' },
  { id: 'sc-halloween', name: 'Halloween Ideas', kind: 'occasion', heading: 'Spooky-Cute Halloween Ideas', description: 'Parties, costumes and treats.', source: 'occasion', sourceRef: 'o-halloween', image: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=1200&q=70', cta: 'Shop Halloween', ctaHref: '/halloween', startDate: '2026-09-15', endDate: '2026-10-31', priority: 1, enabled: true, status: 'active' },
  { id: 'sc-thanksgiving', name: 'Thanksgiving Recipes', kind: 'occasion', heading: 'Thanksgiving, Made Easy', description: 'Menus, hosting and tablescapes.', source: 'occasion', sourceRef: 'o-thanksgiving', image: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=1200&q=70', cta: 'Plan the feast', ctaHref: '/thanksgiving', startDate: '2026-11-01', endDate: '2026-11-27', priority: 3, enabled: true, status: 'scheduled' },
  { id: 'sc-christmas', name: 'Christmas', kind: 'occasion', heading: 'The Season of Sparkle', description: 'Recipes, decor, gifts and DIY.', source: 'occasion', sourceRef: 'o-christmas', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=1200&q=70', cta: 'Explore Christmas', ctaHref: '/christmas', startDate: '2026-11-28', endDate: '2026-12-26', priority: 1, enabled: false, status: 'draft' },
  { id: 'sc-valentines', name: "Valentine's Day", kind: 'occasion', heading: 'Sweet Valentine’s Ideas', source: 'occasion', sourceRef: 'o-valentines', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1200&q=70', cta: 'Get inspired', ctaHref: '/valentines-day', startDate: '2027-01-20', endDate: '2027-02-14', priority: 2, enabled: false, status: 'draft' },
]

/* -------------------------------------------------------------------------
   4. Collections
   ------------------------------------------------------------------------- */
export type CollectionType = 'editorial' | 'seasonal' | 'occasion' | 'campaign' | 'evergreen'
export const collectionTypes: { id: CollectionType; label: string }[] = [
  { id: 'editorial', label: 'Editorial' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'occasion', label: 'Occasion' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'evergreen', label: 'Evergreen' },
]

export type CollectionStatus = 'draft' | 'scheduled' | 'published' | 'archived'
export const collectionStatusMeta: Record<CollectionStatus, { label: string; tone: string }> = {
  draft: { label: 'Draft', tone: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Scheduled', tone: 'bg-primary/12 text-primary' },
  published: { label: 'Published', tone: 'bg-success/15 text-success' },
  archived: { label: 'Archived', tone: 'bg-secondary text-secondary-foreground' },
}

export type Collection = {
  id: string
  name: string
  slug: string
  description: string
  coverImage: string
  contentIds: string[] // manually ordered; a content item may be in many collections
  type: CollectionType
  startDate?: string
  endDate?: string
  status: CollectionStatus
  /** SEO — connects to Phase 12. Temporary campaigns should stay noindex. */
  seo: { title?: string; description?: string; canonical?: string; indexable: boolean; inSitemap: boolean }
  pinterest: { pinReady: boolean; pinTitle?: string; pinDescription?: string }
}

const cover = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&h=630&fit=crop&q=70`

export const collections: Collection[] = [
  { id: 'col-1', name: 'Cozy Fall Ideas', slug: 'cozy-fall-ideas', description: 'A warm, gathered edit of autumn recipes, decor and easy makes for the whole season.', coverImage: cover('1509440159596-0249088772ff'), contentIds: ['c-1004', 'c-1005', 'c-1013', 'c-1012', 'c-1015'], type: 'seasonal', startDate: '2026-09-01', endDate: '2026-11-27', status: 'published', seo: { indexable: true, inSitemap: true, title: 'Cozy Fall Ideas — Recipes, Decor & DIY' }, pinterest: { pinReady: true, pinTitle: 'Cozy Fall Ideas' } },
  { id: 'col-2', name: 'Easy Christmas Recipes', slug: 'easy-christmas-recipes', description: 'Crowd-pleasing holiday bakes and dinners that come together without the stress.', coverImage: cover('1481391319762-47dff72954d9'), contentIds: ['c-1007', 'c-1002'], type: 'occasion', startDate: '2026-11-28', endDate: '2026-12-26', status: 'scheduled', seo: { indexable: false, inSitemap: false }, pinterest: { pinReady: true } },
  { id: 'col-3', name: 'Wedding Inspiration', slug: 'wedding-inspiration', description: 'Timeless ideas for the big day — decor, florals, stationery and more.', coverImage: cover('1519225421980-715cb0215aed'), contentIds: ['c-1006', 'c-1014'], type: 'evergreen', status: 'published', seo: { indexable: true, inSitemap: true }, pinterest: { pinReady: false } },
  { id: 'col-4', name: '25 Nail Ideas', slug: '25-nail-ideas', description: 'A scroll-worthy gallery of manicures for every occasion and season.', coverImage: cover('1607779097040-26e80aa78e66'), contentIds: ['c-1001', 'c-1009'], type: 'editorial', status: 'published', seo: { indexable: true, inSitemap: true }, pinterest: { pinReady: true } },
  { id: 'col-5', name: 'Weekend DIY Projects', slug: 'weekend-diy-projects', description: 'Approachable makes you can finish in a single weekend.', coverImage: cover('1512389142860-9c449e58a543'), contentIds: ['c-1003', 'c-1012'], type: 'evergreen', status: 'draft', seo: { indexable: false, inSitemap: false }, pinterest: { pinReady: false } },
]

export function getCollection(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug && c.status === 'published')
}

/** Resolve a collection's content ids to seed content items, in order. */
export function collectionContent(c: Collection) {
  return c.contentIds
    .map((id) => contentItems.find((i) => i.id === id))
    .filter((i): i is NonNullable<typeof i> => Boolean(i))
}

/* -------------------------------------------------------------------------
   5. Navigation (desktop / mobile / footer)
   ------------------------------------------------------------------------- */
export type NavDestinationType =
  | 'home'
  | 'category'
  | 'subcategory'
  | 'occasion'
  | 'collection'
  | 'article'
  | 'recipe'
  | 'diy'
  | 'author'
  | 'external'

export const navDestinationTypes: { id: NavDestinationType; label: string }[] = [
  { id: 'home', label: 'Homepage' },
  { id: 'category', label: 'Category' },
  { id: 'subcategory', label: 'Subcategory' },
  { id: 'occasion', label: 'Occasion' },
  { id: 'collection', label: 'Collection' },
  { id: 'article', label: 'Article' },
  { id: 'recipe', label: 'Recipe' },
  { id: 'diy', label: 'DIY' },
  { id: 'author', label: 'Author' },
  { id: 'external', label: 'External URL' },
]

export type MegaGroup = {
  id: string
  label: string
  /** taxonomy term ids (dynamic) or explicit links */
  items: { id: string; label: string; destinationType: NavDestinationType; ref?: string; url?: string }[]
}

export type NavMenu = {
  id: string
  featured?: { heading: string; image?: string; cta?: string; contentId?: string }
  groups?: MegaGroup[]
}

export type NavItem = {
  id: string
  label: string
  destinationType: NavDestinationType
  /** taxonomy/collection/content id, author slug, or explicit path/url */
  ref?: string
  url?: string
  parentId?: string
  order: number
  enabled: boolean
  /** attached mega menu (desktop) */
  menu?: NavMenu
}

export type NavArea = 'desktop' | 'mobile' | 'footer'

export const desktopNav: NavItem[] = [
  { id: 'n-home', label: 'Home', destinationType: 'home', order: 0, enabled: true },
  {
    id: 'n-occasions', label: 'Occasions', destinationType: 'occasion', ref: 'o-christmas', order: 1, enabled: true,
    menu: {
      id: 'm-occasions',
      featured: { heading: 'This Week: Cozy Fall Ideas', image: cover('1509440159596-0249088772ff'), cta: 'See the collection', contentId: 'c-1004' },
      groups: [
        { id: 'g-occ-1', label: 'Fall & Winter', items: [
          { id: 'i1', label: 'Christmas', destinationType: 'occasion', ref: 'o-christmas' },
          { id: 'i2', label: 'Halloween', destinationType: 'occasion', ref: 'o-halloween' },
          { id: 'i3', label: 'Thanksgiving', destinationType: 'occasion', ref: 'o-thanksgiving' },
        ] },
        { id: 'g-occ-2', label: 'Spring & Summer', items: [
          { id: 'i4', label: "Valentine's Day", destinationType: 'occasion', ref: 'o-valentines' },
          { id: 'i5', label: 'Weddings', destinationType: 'occasion', ref: 'o-weddings' },
          { id: 'i6', label: 'Birthdays', destinationType: 'occasion', ref: 'o-birthdays' },
        ] },
      ],
    },
  },
  { id: 'n-recipes', label: 'Recipes', destinationType: 'category', ref: 't-recipes', order: 2, enabled: true },
  { id: 'n-diy', label: 'DIY & Crafts', destinationType: 'category', ref: 't-diy', order: 3, enabled: true },
  { id: 'n-home-decor', label: 'Home Decor', destinationType: 'category', ref: 't-home-decor', order: 4, enabled: true },
  { id: 'n-weddings', label: 'Weddings', destinationType: 'category', ref: 't-weddings', order: 5, enabled: true },
  { id: 'n-collections', label: 'Collections', destinationType: 'collection', ref: 'col-1', order: 6, enabled: true },
  { id: 'n-broken', label: 'Old Gift Guide', destinationType: 'article', ref: 'c-9999', order: 7, enabled: false },
]

export const mobileNav: NavItem[] = [
  { id: 'mn-search', label: 'Search', destinationType: 'external', url: '/search', order: 0, enabled: true },
  { id: 'mn-home', label: 'Home', destinationType: 'home', order: 1, enabled: true },
  { id: 'mn-occasions', label: 'Occasions', destinationType: 'occasion', ref: 'o-christmas', order: 2, enabled: true },
  { id: 'mn-recipes', label: 'Recipes', destinationType: 'category', ref: 't-recipes', order: 3, enabled: true },
  { id: 'mn-diy', label: 'DIY & Crafts', destinationType: 'category', ref: 't-diy', order: 4, enabled: true },
  { id: 'mn-weddings', label: 'Weddings', destinationType: 'category', ref: 't-weddings', order: 5, enabled: true },
  { id: 'mn-collections', label: 'Collections', destinationType: 'collection', ref: 'col-1', order: 6, enabled: true },
  { id: 'mn-subscribe', label: 'Subscribe', destinationType: 'external', url: '/#newsletter', order: 7, enabled: true },
]

/* -------------------------------------------------------------------------
   6. Footer
   ------------------------------------------------------------------------- */
export type FooterColumn = { id: string; title: string; links: { id: string; label: string; url: string }[] }
export const footerConfig: {
  columns: FooterColumn[]
  social: { id: string; label: string; url: string }[]
  legal: { id: string; label: string; url: string }[]
  newsletterEnabled: boolean
  copyright: string
} = {
  columns: [
    { id: 'fc-explore', title: 'Explore', links: [
      { id: 'fl-1', label: 'Recipes', url: '/recipes' },
      { id: 'fl-2', label: 'DIY & Crafts', url: '/diy' },
      { id: 'fl-3', label: 'Home Decor', url: '/home-decor' },
      { id: 'fl-4', label: 'Weddings', url: '/weddings' },
    ] },
    { id: 'fc-occasions', title: 'Occasions', links: [
      { id: 'fl-5', label: 'Christmas', url: '/christmas' },
      { id: 'fl-6', label: 'Halloween', url: '/halloween' },
      { id: 'fl-7', label: 'Thanksgiving', url: '/thanksgiving' },
      { id: 'fl-8', label: 'Valentine’s Day', url: '/valentines-day' },
    ] },
    { id: 'fc-company', title: 'Company', links: [
      { id: 'fl-9', label: 'About', url: '/about' },
      { id: 'fl-10', label: 'Contact', url: '/contact' },
      { id: 'fl-11', label: 'Write for us', url: '/contribute' },
    ] },
  ],
  social: [
    { id: 'fs-pin', label: 'Pinterest', url: 'https://pinterest.com' },
    { id: 'fs-ig', label: 'Instagram', url: 'https://instagram.com' },
    { id: 'fs-fb', label: 'Facebook', url: 'https://facebook.com' },
  ],
  legal: [
    { id: 'flg-1', label: 'Privacy Policy', url: '/privacy' },
    { id: 'flg-2', label: 'Terms', url: '/terms' },
    { id: 'flg-3', label: 'Affiliate Disclosure', url: '/disclosure' },
  ],
  newsletterEnabled: true,
  copyright: '© 2026 Marigold & Maple. All rights reserved.',
}

/* -------------------------------------------------------------------------
   7. Navigation validation (Healthy / Warning / Error)
   ------------------------------------------------------------------------- */
export type NavHealth = 'healthy' | 'warning' | 'error'
export type NavIssue = { itemId: string; label: string; issue: string; health: NavHealth }

/** Resolve a destination to a public path, or null if it can't resolve. */
export function resolveNavPath(item: NavItem): string | null {
  switch (item.destinationType) {
    case 'home':
      return '/'
    case 'external':
      return item.url && item.url.trim() ? item.url : null
    case 'category':
    case 'subcategory':
    case 'occasion': {
      const kind = item.destinationType === 'occasion' ? 'occasion' : item.destinationType
      const term = taxonomyByKind[kind as 'category' | 'subcategory' | 'occasion']?.find((t) => t.id === item.ref)
      return term ? `/${term.slug}` : null
    }
    case 'collection': {
      const c = collections.find((x) => x.id === item.ref)
      return c ? `/collections/${c.slug}` : null
    }
    case 'article':
    case 'recipe':
    case 'diy': {
      const ci = contentItems.find((x) => x.id === item.ref)
      return ci ? `${routePrefix(ci.type)}/${ci.slug}` : null
    }
    case 'author':
      return item.ref ? `/author/${item.ref}` : null
    default:
      return null
  }
}

function routePrefix(t: ContentTypeId) {
  return t === 'recipe' ? '/recipe' : t === 'diy' ? '/diy' : '/article'
}

/** Run validation checks across a nav area. */
export function validateNav(items: NavItem[]): NavIssue[] {
  const issues: NavIssue[] = []
  const seen = new Map<string, number>()
  for (const item of items) {
    if (!item.label.trim()) issues.push({ itemId: item.id, label: '(no label)', issue: 'Missing label', health: 'error' })

    const path = resolveNavPath(item)
    if (path === null) {
      const isRefType = !['home', 'external'].includes(item.destinationType)
      issues.push({
        itemId: item.id,
        label: item.label || '(no label)',
        issue: isRefType ? 'Missing or deleted destination reference' : 'Invalid URL',
        health: 'error',
      })
    } else if (item.destinationType === 'external' && item.url && !/^https?:\/\/|^\/|^#/.test(item.url)) {
      issues.push({ itemId: item.id, label: item.label, issue: 'Invalid URL format', health: 'error' })
    }

    // content that is not published → warn about a hidden destination
    if (['article', 'recipe', 'diy'].includes(item.destinationType)) {
      const ci = contentItems.find((x) => x.id === item.ref)
      if (ci && ci.status !== 'published') {
        issues.push({ itemId: item.id, label: item.label, issue: `Destination is ${ci.status}, not public`, health: 'warning' })
      }
    }
    if (!item.enabled) {
      issues.push({ itemId: item.id, label: item.label || '(no label)', issue: 'Item is hidden (disabled)', health: 'warning' })
    }

    const key = `${item.label.toLowerCase()}|${path ?? ''}`
    seen.set(key, (seen.get(key) ?? 0) + 1)
  }
  for (const [key, n] of seen) {
    if (n > 1 && key.split('|')[0]) {
      issues.push({ itemId: 'dup', label: key.split('|')[0], issue: `Duplicate navigation item (${n}×)`, health: 'warning' })
    }
  }
  return issues
}

/* -------------------------------------------------------------------------
   8. Homepage history (placeholder — no real version store yet)
   ------------------------------------------------------------------------- */
export type HomepageVersion = { id: string; version: string; editor: string; when: string; changes: string; current?: boolean }
export const homepageHistory: HomepageVersion[] = [
  { id: 'v-5', version: 'v5', editor: 'Amanda Thompson', when: 'Today, 9:14 AM', changes: 'Enabled Halloween seasonal section; reordered Trending above Seasonal.', current: true },
  { id: 'v-4', version: 'v4', editor: 'Jordan Blake', when: 'Yesterday, 4:02 PM', changes: 'Added "Beauty & Nails" article grid.' },
  { id: 'v-3', version: 'v3', editor: 'Maya Reyes', when: 'Sep 18, 2026', changes: 'Scheduled Thanksgiving campaign; disabled DIY grid.' },
  { id: 'v-2', version: 'v2', editor: 'Amanda Thompson', when: 'Sep 2, 2026', changes: 'Swapped hero to Christmas Nail Ideas.' },
  { id: 'v-1', version: 'v1', editor: 'System', when: 'Aug 1, 2026', changes: 'Initial homepage layout.' },
]

/* -------------------------------------------------------------------------
   Shared helpers
   ------------------------------------------------------------------------- */
export const SITE_URL = SITE_URL_FALLBACK

/** Immutable reorder — move item at index up (−1) or down (+1). */
export function move<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = index + dir
  if (next < 0 || next >= list.length) return list
  const out = list.slice()
  ;[out[index], out[next]] = [out[next], out[index]]
  return out
}

export function contentLabel(id: string): string {
  return contentItems.find((i) => i.id === id)?.title ?? '(deleted content)'
}
