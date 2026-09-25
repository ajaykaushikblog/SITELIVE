/* =========================================================================
   Universal CMS admin — data architecture (front-end prototype).

   ONE universal content model powers every content type (article, recipe,
   DIY, listicle, guide, product guide) and connects to the shared taxonomy,
   media, author, SEO, Pinterest, social, monetization and publishing layers.
   New content types and taxonomies can be added without rebuilding the CMS.

   All figures here are illustrative placeholder data for UI development —
   NOT real analytics. Real database/auth/API arrive in the backend phase.
   ========================================================================= */

import { authorProfiles } from '../authorProfiles'
import { pinTemplates, type PinTemplateId } from '../pinterest'

/** Canonical site origin used across SEO tooling (kept in sync with pinterest.ts SITE_URL). */
export const SITE_URL_FALLBACK = 'https://marigoldandmaple.com'

/* ---- Content types (extensible registry) ---- */
export type ContentTypeId = 'article' | 'recipe' | 'diy' | 'listicle' | 'guide' | 'product-guide'

export type ContentTypeDef = {
  id: ContentTypeId
  label: string
  plural: string
  /** public route prefix this type publishes to */
  routePrefix: string
  editorPath: string
}

export const contentTypes: ContentTypeDef[] = [
  { id: 'article', label: 'Article', plural: 'Articles', routePrefix: '/article', editorPath: 'article' },
  { id: 'recipe', label: 'Recipe', plural: 'Recipes', routePrefix: '/recipe', editorPath: 'recipe' },
  { id: 'diy', label: 'DIY / Tutorial', plural: 'DIY & Tutorials', routePrefix: '/diy', editorPath: 'diy' },
  { id: 'listicle', label: 'Listicle / Ideas', plural: 'Listicles', routePrefix: '/ideas', editorPath: 'listicle' },
  { id: 'guide', label: 'Guide', plural: 'Guides', routePrefix: '/guide', editorPath: 'guide' },
  { id: 'product-guide', label: 'Product Guide', plural: 'Product Guides', routePrefix: '/shop', editorPath: 'product-guide' },
]

export function contentType(id: ContentTypeId): ContentTypeDef {
  return contentTypes.find((t) => t.id === id) ?? contentTypes[0]
}

/* ---- Status system ---- */
export type ContentStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'unpublished' | 'trash'

export const statusOrder: ContentStatus[] = [
  'draft',
  'review',
  'scheduled',
  'published',
  'unpublished',
  'trash',
]

export const statusMeta: Record<ContentStatus, { label: string; tone: string }> = {
  draft: { label: 'Draft', tone: 'bg-muted text-muted-foreground' },
  review: { label: 'In Review', tone: 'bg-warning/15 text-warning' },
  scheduled: { label: 'Scheduled', tone: 'bg-primary/12 text-primary' },
  published: { label: 'Published', tone: 'bg-success/15 text-success' },
  unpublished: { label: 'Unpublished', tone: 'bg-secondary text-secondary-foreground' },
  trash: { label: 'Trash', tone: 'bg-error/12 text-error' },
}

/* ---- SEO health per item (UI signal, not a live scan) ---- */
export type SeoHealth = 'good' | 'warning' | 'missing'

/* ---- Universal content item ---- */
export type ContentItem = {
  id: string
  title: string
  slug: string
  type: ContentTypeId
  status: ContentStatus
  author: string
  featuredImage: string
  category: string
  subcategories: string[]
  occasions: string[]
  seasons: string[]
  tags: string[]
  styles: string[]
  colors: string[]
  audiences: string[]
  publishedDate: string | null
  updatedDate: string
  views: number | null // null → no analytics connected yet
  seoHealth: SeoHealth
  pinCount: number
  featured: boolean
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=200&h=200&fit=crop&q=70`

/* Seed content — a representative spread across types, statuses and taxonomy.
   The registry is designed for thousands of rows; this is a demo slice. */
export const contentItems: ContentItem[] = [
  { id: 'c-1001', title: '25 Elegant Christmas Nail Ideas for the Holidays', slug: 'christmas-nail-ideas', type: 'listicle', status: 'published', author: 'Jordan Blake', featuredImage: img('1607779097040-26e80aa78e66'), category: 'Christmas', subcategories: ['Christmas Nails'], occasions: ['Christmas'], seasons: ['Winter'], tags: ['nails', 'holiday', 'manicure'], styles: ['Elegant', 'Minimalist'], colors: ['Red', 'Gold'], audiences: ['Beginners'], publishedDate: 'Dec 2, 2025', updatedDate: 'Dec 4, 2025', views: null, seoHealth: 'good', pinCount: 3, featured: true },
  { id: 'c-1002', title: 'Easy Creamy Garlic Pasta', slug: 'creamy-garlic-pasta', type: 'recipe', status: 'published', author: 'Maya Reyes', featuredImage: img('1621996346565-e3dbc353d2e5'), category: 'Recipes', subcategories: ['Dinner', 'Pasta'], occasions: ['Weeknight'], seasons: [], tags: ['pasta', 'quick', 'vegetarian'], styles: ['Comfort'], colors: [], audiences: ['Families'], publishedDate: 'Nov 28, 2025', updatedDate: 'Nov 29, 2025', views: null, seoHealth: 'good', pinCount: 1, featured: false },
  { id: 'c-1003', title: 'Macramé Snowflake Ornaments', slug: 'macrame-snowflakes', type: 'diy', status: 'published', author: 'Alicia Butler', featuredImage: img('1512389142860-9c449e58a543'), category: 'DIY', subcategories: ['Christmas Crafts'], occasions: ['Christmas'], seasons: ['Winter'], tags: ['macrame', 'ornament', 'craft'], styles: ['Rustic', 'Handmade'], colors: ['White'], audiences: ['Intermediate'], publishedDate: 'Nov 20, 2025', updatedDate: 'Nov 22, 2025', views: null, seoHealth: 'warning', pinCount: 2, featured: false },
  { id: 'c-1004', title: 'The Complete Guide to a Cozy Autumn Tablescape', slug: 'autumn-tablescape-guide', type: 'guide', status: 'published', author: 'Amanda Thompson', featuredImage: img('1509440159596-0249088772ff'), category: 'Home Decor', subcategories: ['Table Settings'], occasions: ['Thanksgiving'], seasons: ['Fall'], tags: ['tablescape', 'autumn', 'entertaining'], styles: ['Warm', 'Rustic'], colors: ['Amber', 'Brown'], audiences: ['Hosts'], publishedDate: 'Oct 30, 2025', updatedDate: 'Nov 1, 2025', views: null, seoHealth: 'good', pinCount: 4, featured: true },
  { id: 'c-1005', title: '25 Halloween Party Ideas Your Guests Will Love', slug: 'halloween-party-ideas', type: 'listicle', status: 'published', author: 'Amanda Thompson', featuredImage: img('1509557965875-b88c97052f0e'), category: 'Halloween', subcategories: ['Entertaining'], occasions: ['Halloween'], seasons: ['Fall'], tags: ['party', 'halloween', 'entertaining'], styles: ['Moody'], colors: ['Orange', 'Black'], audiences: ['Hosts'], publishedDate: 'Oct 10, 2025', updatedDate: 'Oct 12, 2025', views: null, seoHealth: 'good', pinCount: 5, featured: false },
  { id: 'c-1006', title: 'Modern Wedding Centerpiece with Dried Florals', slug: 'wedding-centerpiece', type: 'diy', status: 'published', author: 'Amanda Thompson', featuredImage: img('1519225421980-715cb0215aed'), category: 'Weddings', subcategories: ['Centerpieces'], occasions: ['Weddings'], seasons: [], tags: ['wedding', 'florals', 'centerpiece'], styles: ['Modern', 'Boho'], colors: ['Neutral'], audiences: ['Couples'], publishedDate: 'Sep 18, 2025', updatedDate: 'Sep 20, 2025', views: null, seoHealth: 'missing', pinCount: 0, featured: false },
  { id: 'c-1007', title: 'Classic Christmas Sugar Cookies', slug: 'christmas-sugar-cookies', type: 'recipe', status: 'scheduled', author: 'Maya Reyes', featuredImage: img('1481391319762-47dff72954d9'), category: 'Christmas', subcategories: ['Christmas Recipes', 'Baking'], occasions: ['Christmas'], seasons: ['Winter'], tags: ['cookies', 'baking', 'holiday'], styles: ['Classic'], colors: [], audiences: ['Families'], publishedDate: 'Dec 15, 2025', updatedDate: 'Dec 1, 2025', views: null, seoHealth: 'good', pinCount: 2, featured: false },
  { id: 'c-1008', title: 'Spooky-Cute Halloween Punch', slug: 'halloween-punch', type: 'recipe', status: 'scheduled', author: 'Maya Reyes', featuredImage: img('1541976076758-347942db1970'), category: 'Halloween', subcategories: ['Drinks'], occasions: ['Halloween'], seasons: ['Fall'], tags: ['drinks', 'halloween', 'punch'], styles: ['Playful'], colors: ['Green'], audiences: ['Hosts'], publishedDate: 'Oct 20, 2025', updatedDate: 'Oct 5, 2025', views: null, seoHealth: 'warning', pinCount: 1, featured: false },
  { id: 'c-1009', title: 'Minimalist Valentine’s Day Nail Art', slug: 'valentines-nail-art', type: 'listicle', status: 'draft', author: 'Jordan Blake', featuredImage: img('1522337660859-02fbefca4702'), category: 'Nails', subcategories: ['Seasonal Nails'], occasions: ["Valentine's Day"], seasons: ['Winter'], tags: ['nails', 'valentines', 'minimalist'], styles: ['Minimalist'], colors: ['Pink', 'Red'], audiences: ['Beginners'], publishedDate: null, updatedDate: 'Dec 3, 2025', views: null, seoHealth: 'missing', pinCount: 0, featured: false },
  { id: 'c-1010', title: 'The Best Gifts for Home Cooks (2026 Edition)', slug: 'gifts-for-home-cooks', type: 'product-guide', status: 'draft', author: 'Maya Reyes', featuredImage: img('1556910103-1c02745aae4d'), category: 'Gifts', subcategories: ['Gift Guides'], occasions: ['Christmas'], seasons: ['Winter'], tags: ['gifts', 'kitchen', 'shopping'], styles: [], colors: [], audiences: ['Shoppers'], publishedDate: null, updatedDate: 'Nov 30, 2025', views: null, seoHealth: 'warning', pinCount: 0, featured: false },
  { id: 'c-1011', title: 'How to Style a Neutral Living Room for Every Season', slug: 'neutral-living-room', type: 'guide', status: 'review', author: 'Alicia Butler', featuredImage: img('1586023492125-27b2c045efd7'), category: 'Home Decor', subcategories: ['Living Room'], occasions: [], seasons: ['All Year'], tags: ['interiors', 'neutral', 'styling'], styles: ['Modern', 'Minimalist'], colors: ['Neutral', 'Beige'], audiences: ['Homeowners'], publishedDate: null, updatedDate: 'Dec 2, 2025', views: null, seoHealth: 'good', pinCount: 1, featured: false },
  { id: 'c-1012', title: 'DIY Dried Orange Garland', slug: 'dried-orange-garland', type: 'diy', status: 'review', author: 'Alicia Butler', featuredImage: img('1543589077-47d81606c1bf'), category: 'DIY', subcategories: ['Holiday Crafts'], occasions: ['Christmas', 'Thanksgiving'], seasons: ['Fall', 'Winter'], tags: ['garland', 'natural', 'craft'], styles: ['Rustic'], colors: ['Orange'], audiences: ['Beginners'], publishedDate: null, updatedDate: 'Nov 26, 2025', views: null, seoHealth: 'good', pinCount: 2, featured: false },
  { id: 'c-1013', title: 'One-Pan Autumn Harvest Chicken', slug: 'autumn-harvest-chicken', type: 'recipe', status: 'published', author: 'Maya Reyes', featuredImage: img('1598515214211-89d3c73ae83b'), category: 'Recipes', subcategories: ['Dinner', 'One-Pan'], occasions: ['Weeknight'], seasons: ['Fall'], tags: ['chicken', 'dinner', 'sheet-pan'], styles: ['Comfort'], colors: [], audiences: ['Families'], publishedDate: 'Oct 5, 2025', updatedDate: 'Oct 6, 2025', views: null, seoHealth: 'good', pinCount: 1, featured: false },
  { id: 'c-1014', title: 'A Beginner’s Guide to Watercolor Wedding Invitations', slug: 'watercolor-invitations', type: 'diy', status: 'published', author: 'Amanda Thompson', featuredImage: img('1606800052052-a08af7148866'), category: 'Weddings', subcategories: ['Stationery'], occasions: ['Weddings'], seasons: [], tags: ['invitations', 'watercolor', 'diy'], styles: ['Artistic'], colors: ['Blush'], audiences: ['Couples'], publishedDate: 'Aug 22, 2025', updatedDate: 'Aug 24, 2025', views: null, seoHealth: 'warning', pinCount: 3, featured: false },
  { id: 'c-1015', title: 'Thanksgiving Hosting Checklist & Timeline', slug: 'thanksgiving-hosting-checklist', type: 'article', status: 'published', author: 'Amanda Thompson', featuredImage: img('1574672280600-4accfa5b6f98'), category: 'Thanksgiving', subcategories: ['Entertaining'], occasions: ['Thanksgiving'], seasons: ['Fall'], tags: ['thanksgiving', 'hosting', 'checklist'], styles: [], colors: [], audiences: ['Hosts'], publishedDate: 'Nov 1, 2025', updatedDate: 'Nov 3, 2025', views: null, seoHealth: 'good', pinCount: 2, featured: false },
  { id: 'c-1016', title: 'Birthday Party Themes for Every Age', slug: 'birthday-party-themes', type: 'listicle', status: 'published', author: 'Amanda Thompson', featuredImage: img('1464349095431-e9a21285b5f3'), category: 'Birthdays', subcategories: ['Party Themes'], occasions: ['Birthdays'], seasons: [], tags: ['birthday', 'party', 'themes'], styles: ['Playful'], colors: [], audiences: ['Parents'], publishedDate: 'Jul 14, 2025', updatedDate: 'Jul 15, 2025', views: null, seoHealth: 'good', pinCount: 4, featured: false },
  { id: 'c-1017', title: 'Old Draft — Summer Nail Trends', slug: 'summer-nail-trends-old', type: 'listicle', status: 'trash', author: 'Jordan Blake', featuredImage: img('1519014816548-bf5fe059798b'), category: 'Nails', subcategories: ['Seasonal Nails'], occasions: [], seasons: ['Summer'], tags: ['nails', 'summer'], styles: [], colors: [], audiences: [], publishedDate: null, updatedDate: 'Jun 2, 2025', views: null, seoHealth: 'missing', pinCount: 0, featured: false },
  { id: 'c-1018', title: 'How to Build a Capsule Holiday Wardrobe', slug: 'capsule-holiday-wardrobe', type: 'guide', status: 'unpublished', author: 'Alicia Butler', featuredImage: img('1490481651871-ab68de25d43d'), category: 'Beauty', subcategories: ['Style'], occasions: ['Christmas'], seasons: ['Winter'], tags: ['fashion', 'capsule', 'holiday'], styles: ['Minimalist'], colors: [], audiences: ['Shoppers'], publishedDate: 'Dec 10, 2024', updatedDate: 'Nov 15, 2025', views: null, seoHealth: 'warning', pinCount: 1, featured: false },
]

/* Illustrative totals — the real corpus is far larger than the demo slice. */
export const corpusTotals = {
  total: 4218,
  published: 3640,
  drafts: 214,
  scheduled: 38,
  review: 26,
  trash: 47,
}

/* ---- Taxonomy (universal + hierarchical) ---- */
export type TaxonomyKind =
  | 'category'
  | 'subcategory'
  | 'occasion'
  | 'season'
  | 'tag'
  | 'style'
  | 'color'
  | 'audience'

export type TaxonomyKindDef = { id: TaxonomyKind; label: string; plural: string; hierarchical: boolean }

export const taxonomyKinds: TaxonomyKindDef[] = [
  { id: 'category', label: 'Category', plural: 'Categories', hierarchical: true },
  { id: 'subcategory', label: 'Subcategory', plural: 'Subcategories', hierarchical: true },
  { id: 'occasion', label: 'Occasion', plural: 'Occasions', hierarchical: false },
  { id: 'season', label: 'Season', plural: 'Seasons', hierarchical: false },
  { id: 'tag', label: 'Tag', plural: 'Tags', hierarchical: false },
  { id: 'style', label: 'Style', plural: 'Styles', hierarchical: false },
  { id: 'color', label: 'Color', plural: 'Colors', hierarchical: false },
  { id: 'audience', label: 'Audience', plural: 'Audiences', hierarchical: false },
]

export type TaxonomyTerm = {
  id: string
  name: string
  slug: string
  description?: string
  parent?: string // parent term id, for hierarchical kinds
  count: number
  indexable: boolean
}

/* Hierarchical categories → subcategories, universal across occasions. */
export const taxonomyByKind: Record<TaxonomyKind, TaxonomyTerm[]> = {
  category: [
    { id: 't-christmas', name: 'Christmas', slug: 'christmas', description: 'Festive recipes, decor, crafts and gift ideas.', count: 412, indexable: true },
    { id: 't-halloween', name: 'Halloween', slug: 'halloween', description: 'Spooky-cute parties, costumes and treats.', count: 268, indexable: true },
    { id: 't-thanksgiving', name: 'Thanksgiving', slug: 'thanksgiving', description: 'Hosting, tablescapes and seasonal menus.', count: 190, indexable: true },
    { id: 't-weddings', name: 'Weddings', slug: 'weddings', description: 'Planning, decor and DIY for the big day.', count: 356, indexable: true },
    { id: 't-birthdays', name: 'Birthdays', slug: 'birthdays', description: 'Party themes, cakes and celebration ideas.', count: 142, indexable: true },
    { id: 't-recipes', name: 'Recipes', slug: 'recipes', description: 'Everyday and occasion cooking.', count: 980, indexable: true },
    { id: 't-diy', name: 'DIY', slug: 'diy', description: 'Crafts, tutorials and makes.', count: 524, indexable: true },
    { id: 't-nails', name: 'Nails', slug: 'nails', description: 'Manicures and nail art.', count: 288, indexable: true },
    { id: 't-home-decor', name: 'Home Decor', slug: 'home-decor', description: 'Interiors and styling.', count: 402, indexable: true },
    { id: 't-beauty', name: 'Beauty', slug: 'beauty', description: 'Makeup, skincare and style.', count: 231, indexable: true },
    { id: 't-gifts', name: 'Gifts', slug: 'gifts', description: 'Curated gift guides.', count: 175, indexable: true },
  ],
  subcategory: [
    { id: 's-xmas-recipes', name: 'Christmas Recipes', slug: 'christmas-recipes', parent: 't-christmas', count: 128, indexable: true },
    { id: 's-xmas-decor', name: 'Christmas Decor', slug: 'christmas-decor', parent: 't-christmas', count: 96, indexable: true },
    { id: 's-xmas-nails', name: 'Christmas Nails', slug: 'christmas-nails', parent: 't-christmas', count: 42, indexable: true },
    { id: 's-xmas-crafts', name: 'Christmas Crafts', slug: 'christmas-crafts', parent: 't-christmas', count: 88, indexable: true },
    { id: 's-xmas-gifts', name: 'Christmas Gifts', slug: 'christmas-gifts', parent: 't-christmas', count: 58, indexable: true },
    { id: 's-hw-entertaining', name: 'Halloween Entertaining', slug: 'halloween-entertaining', parent: 't-halloween', count: 64, indexable: true },
    { id: 's-wed-centerpieces', name: 'Centerpieces', slug: 'centerpieces', parent: 't-weddings', count: 47, indexable: true },
    { id: 's-rec-dinner', name: 'Dinner', slug: 'dinner', parent: 't-recipes', count: 312, indexable: true },
    { id: 's-rec-baking', name: 'Baking', slug: 'baking', parent: 't-recipes', count: 208, indexable: true },
  ],
  occasion: [
    { id: 'o-christmas', name: 'Christmas', slug: 'christmas', count: 412, indexable: true },
    { id: 'o-halloween', name: 'Halloween', slug: 'halloween', count: 268, indexable: true },
    { id: 'o-thanksgiving', name: 'Thanksgiving', slug: 'thanksgiving', count: 190, indexable: true },
    { id: 'o-weddings', name: 'Weddings', slug: 'weddings', count: 356, indexable: true },
    { id: 'o-birthdays', name: 'Birthdays', slug: 'birthdays', count: 142, indexable: true },
    { id: 'o-valentines', name: "Valentine's Day", slug: 'valentines-day', count: 118, indexable: true },
    { id: 'o-weeknight', name: 'Weeknight', slug: 'weeknight', count: 340, indexable: true },
  ],
  season: [
    { id: 'se-spring', name: 'Spring', slug: 'spring', count: 214, indexable: true },
    { id: 'se-summer', name: 'Summer', slug: 'summer', count: 256, indexable: true },
    { id: 'se-fall', name: 'Fall', slug: 'fall', count: 388, indexable: true },
    { id: 'se-winter', name: 'Winter', slug: 'winter', count: 402, indexable: true },
    { id: 'se-all', name: 'All Year', slug: 'all-year', count: 512, indexable: false },
  ],
  tag: [
    { id: 'tg-nails', name: 'nails', slug: 'nails', count: 288, indexable: false },
    { id: 'tg-baking', name: 'baking', slug: 'baking', count: 208, indexable: false },
    { id: 'tg-party', name: 'party', slug: 'party', count: 176, indexable: false },
    { id: 'tg-quick', name: 'quick', slug: 'quick', count: 144, indexable: false },
    { id: 'tg-craft', name: 'craft', slug: 'craft', count: 320, indexable: false },
  ],
  style: [
    { id: 'st-minimalist', name: 'Minimalist', slug: 'minimalist', count: 210, indexable: false },
    { id: 'st-rustic', name: 'Rustic', slug: 'rustic', count: 168, indexable: false },
    { id: 'st-modern', name: 'Modern', slug: 'modern', count: 194, indexable: false },
    { id: 'st-elegant', name: 'Elegant', slug: 'elegant', count: 152, indexable: false },
    { id: 'st-boho', name: 'Boho', slug: 'boho', count: 121, indexable: false },
  ],
  color: [
    { id: 'cl-red', name: 'Red', slug: 'red', count: 96, indexable: false },
    { id: 'cl-gold', name: 'Gold', slug: 'gold', count: 74, indexable: false },
    { id: 'cl-neutral', name: 'Neutral', slug: 'neutral', count: 168, indexable: false },
    { id: 'cl-green', name: 'Green', slug: 'green', count: 88, indexable: false },
    { id: 'cl-pink', name: 'Pink', slug: 'pink', count: 102, indexable: false },
  ],
  audience: [
    { id: 'au-beginners', name: 'Beginners', slug: 'beginners', count: 240, indexable: false },
    { id: 'au-families', name: 'Families', slug: 'families', count: 312, indexable: false },
    { id: 'au-hosts', name: 'Hosts', slug: 'hosts', count: 198, indexable: false },
    { id: 'au-couples', name: 'Couples', slug: 'couples', count: 156, indexable: false },
    { id: 'au-shoppers', name: 'Shoppers', slug: 'shoppers', count: 133, indexable: false },
  ],
}

/* ---- Media library ---- */
export type MediaItem = {
  id: string
  filename: string
  title: string
  alt: string
  caption?: string
  url: string
  width: number
  height: number
  type: 'JPEG' | 'PNG' | 'WEBP'
  sizeKB: number
  pinterestReady: boolean
  usage: { articles: number; recipes: number; diy: number; pins: number }
}

const media = (id: string) => `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&q=70`

export const mediaItems: MediaItem[] = [
  { id: 'm-1', filename: 'christmas-nails-hero.jpg', title: 'Christmas nails hero', alt: 'Red and gold festive manicure', url: media('1607779097040-26e80aa78e66'), width: 1600, height: 1067, type: 'JPEG', sizeKB: 284, pinterestReady: true, usage: { articles: 2, recipes: 0, diy: 0, pins: 3 } },
  { id: 'm-2', filename: 'garlic-pasta.jpg', title: 'Creamy garlic pasta', alt: 'Bowl of creamy garlic pasta with parsley', url: media('1621996346565-e3dbc353d2e5'), width: 1500, height: 1000, type: 'JPEG', sizeKB: 312, pinterestReady: true, usage: { articles: 0, recipes: 1, diy: 0, pins: 1 } },
  { id: 'm-3', filename: 'macrame-snowflake.jpg', title: 'Macramé snowflake', alt: 'White macramé snowflake ornament', url: media('1512389142860-9c449e58a543'), width: 1400, height: 1400, type: 'JPEG', sizeKB: 221, pinterestReady: false, usage: { articles: 0, recipes: 0, diy: 1, pins: 2 } },
  { id: 'm-4', filename: 'autumn-table.jpg', title: 'Autumn tablescape', alt: 'Warm autumn table setting with candles', url: media('1509440159596-0249088772ff'), width: 1600, height: 900, type: 'JPEG', sizeKB: 356, pinterestReady: true, usage: { articles: 3, recipes: 0, diy: 0, pins: 4 } },
  { id: 'm-5', filename: 'halloween-party.jpg', title: 'Halloween party spread', alt: 'Moody Halloween party table', url: media('1509557965875-b88c97052f0e'), width: 1500, height: 1000, type: 'JPEG', sizeKB: 298, pinterestReady: true, usage: { articles: 1, recipes: 0, diy: 0, pins: 5 } },
  { id: 'm-6', filename: 'wedding-centerpiece.jpg', title: 'Dried floral centerpiece', alt: 'Modern dried floral wedding centerpiece', url: media('1519225421980-715cb0215aed'), width: 1400, height: 1050, type: 'JPEG', sizeKB: 264, pinterestReady: false, usage: { articles: 0, recipes: 0, diy: 1, pins: 0 } },
  { id: 'm-7', filename: 'sugar-cookies.jpg', title: 'Christmas sugar cookies', alt: 'Decorated Christmas sugar cookies', url: media('1481391319762-47dff72954d9'), width: 1500, height: 1000, type: 'JPEG', sizeKB: 331, pinterestReady: true, usage: { articles: 0, recipes: 1, diy: 0, pins: 2 } },
  { id: 'm-8', filename: 'neutral-living-room.jpg', title: 'Neutral living room', alt: 'Bright neutral living room with textured throws', url: media('1586023492125-27b2c045efd7'), width: 1600, height: 1067, type: 'JPEG', sizeKB: 289, pinterestReady: false, usage: { articles: 1, recipes: 0, diy: 0, pins: 1 } },
]

export const mediaTotal = 1284

/* ---- Authors (reuse the existing public author profiles) ---- */
export type AdminAuthor = {
  slug: string
  name: string
  title: string
  image: string
  bio: string
  expertise: string[]
  website?: string
  articleCount: number
  status: 'active' | 'inactive'
}

export const adminAuthors: AdminAuthor[] = Object.values(authorProfiles).map((p) => ({
  slug: p.slug,
  name: p.name,
  title: p.professionalTitle,
  image: p.profileImage,
  bio: p.shortBio,
  expertise: p.expertise.map((e) => e.label),
  website: p.website,
  articleCount:
    (p.articleCount ?? 0) + (p.recipeCount ?? 0) + (p.diyCount ?? 0),
  status: p.status,
}))

/* ---- Activity log (illustrative) ---- */
export type Activity = {
  id: string
  user: string
  action: string
  target: string
  when: string
  tone: 'published' | 'edited' | 'created' | 'media' | 'seo' | 'trash'
}

export const activityLog: Activity[] = [
  { id: 'a-1', user: 'Jordan Blake', action: 'Published', target: '25 Elegant Christmas Nail Ideas', when: '2 hours ago', tone: 'published' },
  { id: 'a-2', user: 'Maya Reyes', action: 'Updated recipe', target: 'Easy Creamy Garlic Pasta', when: '5 hours ago', tone: 'edited' },
  { id: 'a-3', user: 'Alicia Butler', action: 'Submitted for review', target: 'How to Style a Neutral Living Room', when: 'Yesterday', tone: 'created' },
  { id: 'a-4', user: 'Amanda Thompson', action: 'Uploaded image', target: 'autumn-table.jpg', when: 'Yesterday', tone: 'media' },
  { id: 'a-5', user: 'Maya Reyes', action: 'Scheduled', target: 'Classic Christmas Sugar Cookies', when: '2 days ago', tone: 'created' },
  { id: 'a-6', user: 'Jordan Blake', action: 'Updated SEO metadata', target: 'Minimalist Valentine’s Day Nail Art', when: '3 days ago', tone: 'seo' },
  { id: 'a-7', user: 'Amanda Thompson', action: 'Moved to trash', target: 'Summer Nail Trends (old)', when: '4 days ago', tone: 'trash' },
  { id: 'a-8', user: 'Alicia Butler', action: 'Created draft', target: 'DIY Dried Orange Garland', when: '5 days ago', tone: 'created' },
]

/* ---- Site health (UI states, not live scans) ---- */
export type HealthState = 'healthy' | 'warning' | 'attention'
export type HealthCheck = { id: string; label: string; detail: string; state: HealthState; count: number }

export const healthChecks: HealthCheck[] = [
  { id: 'h-links', label: 'Broken links', detail: 'Internal & external link check', state: 'warning', count: 7 },
  { id: 'h-meta', label: 'Missing metadata', detail: 'Pages without meta description', state: 'attention', count: 34 },
  { id: 'h-alt', label: 'Missing alt text', detail: 'Images without alt attributes', state: 'attention', count: 52 },
  { id: 'h-canonical', label: 'Missing canonical', detail: 'Pages without canonical URL', state: 'warning', count: 12 },
  { id: 'h-orphan', label: 'Orphan pages', detail: 'Pages with no internal links', state: 'warning', count: 9 },
  { id: 'h-404', label: '404 errors', detail: 'Logged not-found responses', state: 'warning', count: 18 },
  { id: 'h-redirect', label: 'Redirect errors', detail: 'Redirect chains & loops', state: 'healthy', count: 0 },
  { id: 'h-sitemap', label: 'Sitemap', detail: 'XML sitemap generation', state: 'healthy', count: 0 },
  { id: 'h-robots', label: 'Robots configuration', detail: 'robots.txt directives', state: 'healthy', count: 0 },
  { id: 'h-schema', label: 'Schema issues', detail: 'Structured data validation', state: 'warning', count: 5 },
]

/* ---- Roles & permissions (UI only) ---- */
export type Role = 'Administrator' | 'Editor' | 'Author' | 'Contributor'
export const roles: Role[] = ['Administrator', 'Editor', 'Author', 'Contributor']

export const permissions = [
  'Manage content',
  'Publish content',
  'Manage taxonomy',
  'Manage media',
  'Manage authors',
  'Manage homepage',
  'Manage navigation',
  'Manage footer',
  'Manage newsletter',
  'Manage monetization',
  'Manage SEO',
  'View analytics',
  'Manage settings',
  'Manage integrations',
  'Manage users',
  'Manage system',
] as const

export const rolePermissions: Record<Role, Set<string>> = {
  Administrator: new Set(permissions),
  Editor: new Set([
    'Manage content',
    'Publish content',
    'Manage taxonomy',
    'Manage media',
    'Manage homepage',
    'Manage navigation',
    'Manage footer',
    'Manage newsletter',
    'Manage SEO',
    'View analytics',
  ]),
  Author: new Set(['Manage content', 'Manage media']),
  Contributor: new Set(['Manage content']),
}

/* ---- Content editors: reusable block palette ---- */
export type EditorBlockType =
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'gallery'
  | 'video'
  | 'quote'
  | 'list'
  | 'checklist'
  | 'table'
  | 'callout'
  | 'product'
  | 'affiliate'
  | 'sponsored'
  | 'ad'
  | 'recipe-embed'
  | 'related'
  | 'newsletter'

export const editorBlocks: { type: EditorBlockType; label: string; icon: string }[] = [
  { type: 'paragraph', label: 'Paragraph', icon: '¶' },
  { type: 'heading', label: 'Heading', icon: 'H' },
  { type: 'image', label: 'Image', icon: '▣' },
  { type: 'gallery', label: 'Gallery', icon: '▦' },
  { type: 'video', label: 'Video', icon: '▷' },
  { type: 'quote', label: 'Quote', icon: '❝' },
  { type: 'list', label: 'List', icon: '•' },
  { type: 'checklist', label: 'Checklist', icon: '☑' },
  { type: 'table', label: 'Table', icon: '⊞' },
  { type: 'callout', label: 'Callout', icon: '!' },
  { type: 'product', label: 'Product block', icon: '$' },
  { type: 'affiliate', label: 'Affiliate block', icon: '↗' },
  { type: 'sponsored', label: 'Sponsored block', icon: '✦' },
  { type: 'ad', label: 'Advertisement', icon: '▭' },
  { type: 'recipe-embed', label: 'Recipe embed', icon: '🍽' },
  { type: 'related', label: 'Related content', icon: '⇄' },
  { type: 'newsletter', label: 'Newsletter', icon: '✉' },
]

/* ---- SEO / Pinterest option lists reused by editors ---- */
export const robotsOptions = ['index, follow', 'noindex, follow', 'noindex, nofollow']
export const schemaTypes = ['Article', 'Recipe', 'HowTo', 'ItemList', 'Product', 'WebPage']
export const pinTemplateOptions: { id: PinTemplateId; label: string }[] = pinTemplates.map((t) => ({
  id: t.id,
  label: t.label,
}))

/* ---- Query helpers for the universal content table ---- */
export type ContentQuery = {
  search?: string
  type?: ContentTypeId | 'all'
  status?: ContentStatus | 'all'
  author?: string | 'all'
  category?: string | 'all'
  sort?: 'updated' | 'published' | 'title' | 'type'
}

export function queryContent(items: ContentItem[], q: ContentQuery): ContentItem[] {
  let out = items.slice()
  if (q.search) {
    const s = q.search.toLowerCase()
    out = out.filter(
      (i) =>
        i.title.toLowerCase().includes(s) ||
        i.slug.toLowerCase().includes(s) ||
        i.author.toLowerCase().includes(s) ||
        i.category.toLowerCase().includes(s),
    )
  }
  if (q.type && q.type !== 'all') out = out.filter((i) => i.type === q.type)
  if (q.status && q.status !== 'all') out = out.filter((i) => i.status === q.status)
  if (q.author && q.author !== 'all') out = out.filter((i) => i.author === q.author)
  if (q.category && q.category !== 'all') out = out.filter((i) => i.category === q.category)

  switch (q.sort) {
    case 'title':
      out.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'type':
      out.sort((a, b) => a.type.localeCompare(b.type))
      break
    case 'published':
      out.sort((a, b) => (b.publishedDate ?? '').localeCompare(a.publishedDate ?? ''))
      break
    default:
      break // 'updated' → keep seed order (most-recent-first)
  }
  return out
}
