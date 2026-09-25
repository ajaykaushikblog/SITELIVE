/* =========================================================================
   Phase 13 — Advanced Media Library data architecture (front-end prototype).

   A single universal media model powers the whole library: editorial images,
   Pinterest assets, galleries, variants, collections, usage tracking, image
   SEO and optimization signals. Designed to scale to thousands of files —
   the seed below is a representative demo slice, and `mediaTotals` reflects
   the (much larger) illustrative corpus.

   All figures are placeholder UI data. Real storage, uploads, image
   processing, CDN, transformation and duplicate detection are connected in
   the production/backend phase. Nothing here performs actual file work.
   ========================================================================= */

import { pinTemplates, PIN_SPEC, getTemplate, type PinTemplateId } from '../pinterest'
import { SITE_URL_FALLBACK } from './cms'

/* ---- Core media types ---- */
export type MediaKind = 'image' | 'video' | 'pdf' | 'document'
export type MediaFormat = 'JPEG' | 'PNG' | 'WEBP' | 'AVIF' | 'SVG' | 'MP4' | 'PDF'
export type MediaRole = 'standard' | 'pinterest' | 'social'
export type OptimizationState = 'optimized' | 'needs-optimization' | 'processing'
export type AltState = 'good' | 'short' | 'missing' | 'decorative'

/** Where a media item is referenced across the site. Each entry can deep-link. */
export type MediaUsageRef = {
  kind: 'article' | 'recipe' | 'diy' | 'guide' | 'listicle' | 'category' | 'author' | 'pin'
  label: string
  href: string
}

/** A responsive/derived rendition of an original upload (concept only). */
export type MediaVariant = {
  id: 'original' | 'thumbnail' | 'small' | 'medium' | 'large' | 'mobile' | 'pinterest' | 'social'
  label: string
  width: number
  height: number
  /** rough projected weight in KB for the rendition (illustrative) */
  sizeKB: number
}

export type PinterestAssetMeta = {
  pinTitle: string
  pinDescription: string
  template: PinTemplateId
  isPrimary: boolean
  destination: string
}

export type MediaItem = {
  id: string
  filename: string
  kind: MediaKind
  format: MediaFormat
  role: MediaRole
  url: string
  /** editable metadata */
  title: string
  alt: string
  decorative: boolean
  caption: string
  description: string
  tags: string[]
  collections: string[]
  /** intrinsic file facts */
  width: number
  height: number
  sizeKB: number
  uploaded: string
  modified: string
  /** optimization concept */
  optimization: OptimizationState
  optimizedKB: number | null
  /** usage & pinterest */
  usage: MediaUsageRef[]
  pinterest?: PinterestAssetMeta
}

const media = (id: string, w = 400, h = 400) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=70`

/* ---- Reusable tag & collection registries (shared, not per-category) ---- */
export const mediaTags = [
  'Christmas', 'Halloween', 'Thanksgiving', 'Wedding', 'Recipe', 'Nails', 'DIY',
  'Home Decor', 'Food', 'Pinterest', 'Hero Image', 'Product', 'Beauty', 'Autumn',
]

export type MediaCollection = { id: string; name: string; count: number; cover: string }

export const mediaCollections: MediaCollection[] = [
  { id: 'col-xmas-26', name: 'Christmas 2026', count: 212, cover: media('1607779097040-26e80aa78e66') },
  { id: 'col-hw', name: 'Halloween Campaign', count: 138, cover: media('1509557965875-b88c97052f0e') },
  { id: 'col-wed', name: 'Wedding Inspiration', count: 96, cover: media('1519225421980-715cb0215aed') },
  { id: 'col-pin', name: 'Pinterest Assets', count: 340, cover: media('1522337660859-02fbefca4702') },
  { id: 'col-recipe', name: 'Recipe Photography', count: 512, cover: media('1621996346565-e3dbc353d2e5') },
  { id: 'col-home', name: 'Homepage Images', count: 42, cover: media('1586023492125-27b2c045efd7') },
]

/* ---- Seed media (demo slice; corpus is far larger) ---- */
export const mediaLibrary: MediaItem[] = [
  {
    id: 'm-1', filename: 'christmas-nails-hero.jpg', kind: 'image', format: 'JPEG', role: 'standard',
    url: media('1607779097040-26e80aa78e66'), title: 'Christmas nails hero',
    alt: 'Red and gold festive manicure on a marble surface with pine sprigs', decorative: false,
    caption: 'Classic red and gold festive nails.', description: 'Hero image for the Christmas nails listicle.',
    tags: ['Christmas', 'Nails', 'Hero Image'], collections: ['col-xmas-26'],
    width: 1600, height: 1067, sizeKB: 284, uploaded: 'Dec 1, 2025', modified: 'Dec 4, 2025',
    optimization: 'optimized', optimizedKB: 168,
    usage: [
      { kind: 'listicle', label: '25 Elegant Christmas Nail Ideas', href: '/christmas/christmas-nail-ideas' },
      { kind: 'article', label: 'Holiday Beauty Roundup', href: '/beauty/holiday-beauty' },
      { kind: 'pin', label: 'Christmas Nails — Primary Pin', href: '/admin/media/pinterest' },
    ],
  },
  {
    id: 'm-2', filename: 'christmas-nails-pin.jpg', kind: 'image', format: 'JPEG', role: 'pinterest',
    url: media('1522337660859-02fbefca4702', 1000, 1500), title: 'Christmas nails — Pinterest pin',
    alt: 'Vertical Pinterest graphic of red and gold Christmas nails with title text', decorative: false,
    caption: '', description: 'Primary vertical pin for the Christmas nails guide.',
    tags: ['Christmas', 'Nails', 'Pinterest'], collections: ['col-pin', 'col-xmas-26'],
    width: 1000, height: 1500, sizeKB: 342, uploaded: 'Dec 1, 2025', modified: 'Dec 2, 2025',
    optimization: 'optimized', optimizedKB: 210,
    usage: [{ kind: 'pin', label: '25 Elegant Christmas Nail Ideas', href: '/christmas/christmas-nail-ideas' }],
    pinterest: {
      pinTitle: '25 Elegant Christmas Nail Ideas', pinDescription: 'Festive, elegant Christmas nail designs — from classic red and gold to minimalist snowflakes.',
      template: 'beauty', isPrimary: true, destination: '/christmas/christmas-nail-ideas',
    },
  },
  {
    id: 'm-3', filename: 'garlic-pasta.jpg', kind: 'image', format: 'JPEG', role: 'standard',
    url: media('1621996346565-e3dbc353d2e5', 1500, 1000), title: 'Creamy garlic pasta',
    alt: 'Bowl of creamy garlic pasta topped with parsley and parmesan', decorative: false,
    caption: 'Weeknight creamy garlic pasta.', description: 'Featured image for the garlic pasta recipe.',
    tags: ['Recipe', 'Food'], collections: ['col-recipe'],
    width: 1500, height: 1000, sizeKB: 312, uploaded: 'Nov 27, 2025', modified: 'Nov 29, 2025',
    optimization: 'needs-optimization', optimizedKB: null,
    usage: [{ kind: 'recipe', label: 'Easy Creamy Garlic Pasta', href: '/recipe/creamy-garlic-pasta' }],
  },
  {
    id: 'm-4', filename: 'macrame-snowflake.jpg', kind: 'image', format: 'JPEG', role: 'standard',
    url: media('1512389142860-9c449e58a543'), title: 'Macramé snowflake',
    alt: 'snow', decorative: false,
    caption: '', description: '', tags: ['DIY', 'Christmas'], collections: ['col-xmas-26'],
    width: 1400, height: 1400, sizeKB: 221, uploaded: 'Nov 20, 2025', modified: 'Nov 22, 2025',
    optimization: 'optimized', optimizedKB: 140,
    usage: [{ kind: 'diy', label: 'Macramé Snowflake Ornaments', href: '/diy/macrame-snowflakes' }],
  },
  {
    id: 'm-5', filename: 'autumn-table.jpg', kind: 'image', format: 'WEBP', role: 'standard',
    url: media('1509440159596-0249088772ff', 1600, 900), title: 'Autumn tablescape',
    alt: 'Warm autumn table setting with candles, dried florals and amber glassware', decorative: false,
    caption: 'A cozy autumn tablescape.', description: 'Guide hero for autumn tablescape.',
    tags: ['Home Decor', 'Autumn', 'Thanksgiving'], collections: ['col-home'],
    width: 1600, height: 900, sizeKB: 356, uploaded: 'Oct 28, 2025', modified: 'Nov 1, 2025',
    optimization: 'optimized', optimizedKB: 190,
    usage: [
      { kind: 'guide', label: 'A Cozy Autumn Tablescape', href: '/home-decor/autumn-tablescape-guide' },
      { kind: 'category', label: 'Thanksgiving', href: '/thanksgiving' },
      { kind: 'article', label: 'Thanksgiving Hosting Checklist', href: '/article/thanksgiving-hosting-checklist' },
    ],
  },
  {
    id: 'm-6', filename: 'halloween-party.jpg', kind: 'image', format: 'JPEG', role: 'standard',
    url: media('1509557965875-b88c97052f0e', 1500, 1000), title: 'Halloween party spread',
    alt: 'Moody Halloween party table with black candles and dark florals', decorative: false,
    caption: '', description: '', tags: ['Halloween'], collections: ['col-hw'],
    width: 1500, height: 1000, sizeKB: 298, uploaded: 'Oct 8, 2025', modified: 'Oct 12, 2025',
    optimization: 'optimized', optimizedKB: 176,
    usage: [{ kind: 'listicle', label: '25 Halloween Party Ideas', href: '/halloween/halloween-party-ideas' }],
  },
  {
    id: 'm-7', filename: 'wedding-centerpiece.jpg', kind: 'image', format: 'PNG', role: 'standard',
    url: media('1519225421980-715cb0215aed', 1400, 1050), title: 'Dried floral centerpiece',
    alt: '', decorative: false,
    caption: '', description: '', tags: ['Wedding'], collections: ['col-wed'],
    width: 1400, height: 1050, sizeKB: 1240, uploaded: 'Sep 18, 2025', modified: 'Sep 20, 2025',
    optimization: 'needs-optimization', optimizedKB: null,
    usage: [{ kind: 'diy', label: 'Modern Wedding Centerpiece', href: '/diy/wedding-centerpiece' }],
  },
  {
    id: 'm-8', filename: 'sugar-cookies.jpg', kind: 'image', format: 'JPEG', role: 'standard',
    url: media('1481391319762-47dff72954d9', 1500, 1000), title: 'Christmas sugar cookies',
    alt: 'Decorated Christmas sugar cookies on a cooling rack', decorative: false,
    caption: '', description: '', tags: ['Recipe', 'Christmas', 'Food'], collections: ['col-recipe', 'col-xmas-26'],
    width: 1500, height: 1000, sizeKB: 331, uploaded: 'Nov 30, 2025', modified: 'Dec 1, 2025',
    optimization: 'processing', optimizedKB: null,
    usage: [{ kind: 'recipe', label: 'Classic Christmas Sugar Cookies', href: '/recipe/christmas-sugar-cookies' }],
  },
  {
    id: 'm-9', filename: 'neutral-living-room.jpg', kind: 'image', format: 'JPEG', role: 'standard',
    url: media('1586023492125-27b2c045efd7', 1600, 1067), title: 'Neutral living room',
    alt: 'Bright neutral living room with textured throws and warm wood accents', decorative: false,
    caption: '', description: '', tags: ['Home Decor', 'Hero Image'], collections: ['col-home'],
    width: 1600, height: 1067, sizeKB: 289, uploaded: 'Nov 15, 2025', modified: 'Dec 2, 2025',
    optimization: 'optimized', optimizedKB: 172,
    usage: [{ kind: 'guide', label: 'How to Style a Neutral Living Room', href: '/article/neutral-living-room' }],
  },
  {
    id: 'm-10', filename: 'IMG_4821.jpg', kind: 'image', format: 'JPEG', role: 'standard',
    url: media('1543589077-47d81606c1bf'), title: '',
    alt: '', decorative: false,
    caption: '', description: '', tags: [], collections: [],
    width: 3000, height: 3000, sizeKB: 2480, uploaded: 'Nov 26, 2025', modified: 'Nov 26, 2025',
    optimization: 'needs-optimization', optimizedKB: null,
    usage: [],
  },
  {
    id: 'm-11', filename: 'texture-paper-bg.png', kind: 'image', format: 'PNG', role: 'standard',
    url: media('1519014816548-bf5fe059798b'), title: 'Paper texture background',
    alt: '', decorative: true,
    caption: '', description: 'Decorative paper texture used behind section headers.',
    tags: ['Hero Image'], collections: [],
    width: 2000, height: 1333, sizeKB: 540, uploaded: 'Aug 2, 2025', modified: 'Aug 2, 2025',
    optimization: 'optimized', optimizedKB: 220,
    usage: [{ kind: 'category', label: 'Home Decor', href: '/home-decor' }],
  },
  {
    id: 'm-12', filename: 'old-summer-nails.jpg', kind: 'image', format: 'JPEG', role: 'standard',
    url: media('1490481651871-ab68de25d43d'), title: 'Summer nail trends (old)',
    alt: 'Pastel summer manicure', decorative: false,
    caption: '', description: '', tags: ['Nails'], collections: [],
    width: 1200, height: 1600, sizeKB: 264, uploaded: 'Jun 2, 2025', modified: 'Jun 2, 2025',
    optimization: 'optimized', optimizedKB: 150,
    usage: [],
  },
]

/** Illustrative corpus totals — the real library is far larger than the demo slice. */
export const mediaTotals = {
  total: 12840,
  images: 11920,
  videos: 214,
  documents: 706,
  pinterest: 3410,
  unused: 486,
  needsOptimization: 1290,
  missingAlt: 372,
}

/* =========================================================================
   Derived helpers — aspect ratio, alt-text + SEO scoring, filter/sort/search.
   ========================================================================= */

/** Greatest common divisor for ratio reduction. */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

const NAMED_RATIOS: { label: string; w: number; h: number }[] = [
  { label: '1:1', w: 1, h: 1 },
  { label: '4:3', w: 4, h: 3 },
  { label: '3:2', w: 3, h: 2 },
  { label: '2:3', w: 2, h: 3 },
  { label: '16:9', w: 16, h: 9 },
]

export function aspectRatio(width: number, height: number): { exact: string; named: string | null } {
  const d = gcd(width, height) || 1
  const rw = width / d
  const rh = height / d
  const target = width / height
  const named = NAMED_RATIOS.find((r) => Math.abs(r.w / r.h - target) < 0.02)
  return { exact: `${rw}:${rh}`, named: named ? named.label : null }
}

/** Pinterest asset detection — the canonical 1000×1500 / 2:3 vertical spec. */
export function isPinterestFormat(item: Pick<MediaItem, 'width' | 'height'>): boolean {
  const target = PIN_SPEC.width / PIN_SPEC.height // 2/3
  return Math.abs(item.width / item.height - target) < 0.02
}

/** Alt-text quality signal (accessibility + image SEO). */
export function altState(item: Pick<MediaItem, 'alt' | 'decorative'>): AltState {
  if (item.decorative) return 'decorative'
  const a = item.alt.trim()
  if (a.length === 0) return 'missing'
  if (a.length < 15) return 'short'
  return 'good'
}

export const altStateMeta: Record<AltState, { label: string; tone: string }> = {
  good: { label: 'Good alt text', tone: 'bg-success/15 text-success' },
  short: { label: 'Alt text too short', tone: 'bg-warning/15 text-warning' },
  missing: { label: 'Missing alt text', tone: 'bg-error/12 text-error' },
  decorative: { label: 'Decorative', tone: 'bg-secondary text-secondary-foreground' },
}

export const optimizationMeta: Record<OptimizationState, { label: string; tone: string }> = {
  optimized: { label: 'Optimized', tone: 'bg-success/15 text-success' },
  'needs-optimization': { label: 'Needs optimization', tone: 'bg-warning/15 text-warning' },
  processing: { label: 'Processing', tone: 'bg-primary/12 text-primary' },
}

/** Filename SEO check — lowercase, hyphenated, descriptive, no camera defaults. */
export function filenameFriendly(filename: string): boolean {
  const base = filename.replace(/\.[a-z0-9]+$/i, '')
  if (/^(img|dsc|image|photo|screenshot)[-_ ]?\d+/i.test(base)) return false
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(base)
}

/** SEO checks for a media item → interface indicator, not a ranking score. */
export type SeoCheck = { label: string; pass: boolean; hint: string }

export function imageSeoChecks(item: MediaItem): SeoCheck[] {
  const alt = altState(item)
  const kb = item.optimizedKB ?? item.sizeKB
  return [
    { label: 'SEO-friendly filename', pass: filenameFriendly(item.filename), hint: 'lowercase-hyphenated-keywords.jpg' },
    { label: 'Descriptive alt text', pass: alt === 'good' || alt === 'decorative', hint: 'Describes meaningful visual content' },
    { label: 'Sufficient dimensions', pass: Math.max(item.width, item.height) >= 1000, hint: 'At least 1000px on the long edge' },
    { label: 'Modern format', pass: item.format === 'WEBP' || item.format === 'AVIF', hint: 'Prefer WebP or AVIF' },
    { label: 'Reasonable file size', pass: kb <= 500, hint: 'Under 500 KB after optimization' },
  ]
}

export function seoScore(item: MediaItem): number {
  const checks = imageSeoChecks(item)
  return Math.round((checks.filter((c) => c.pass).length / checks.length) * 100)
}

/** Variant plan derived from an original (concept only — no files generated). */
export function variantPlan(item: MediaItem): MediaVariant[] {
  const ar = item.width / item.height
  const at = (w: number): MediaVariant['height'] => Math.round(w / ar)
  const kbAt = (w: number) => Math.max(6, Math.round((w * at(w)) / 9000))
  const rows: { id: MediaVariant['id']; label: string; w: number }[] = [
    { id: 'original', label: 'Original', w: item.width },
    { id: 'large', label: 'Large', w: 1600 },
    { id: 'medium', label: 'Medium', w: 1024 },
    { id: 'small', label: 'Small', w: 640 },
    { id: 'mobile', label: 'Mobile', w: 768 },
    { id: 'thumbnail', label: 'Thumbnail', w: 300 },
  ]
  const list: MediaVariant[] = rows
    .filter((r) => r.w <= item.width || r.id === 'original')
    .map((r) => ({ id: r.id, label: r.label, width: r.w, height: at(r.w), sizeKB: r.id === 'original' ? item.sizeKB : kbAt(r.w) }))
  // Fixed-spec renditions
  list.push({ id: 'pinterest', label: 'Pinterest', width: PIN_SPEC.width, height: PIN_SPEC.height, sizeKB: 210 })
  list.push({ id: 'social', label: 'Social (OG)', width: 1200, height: 630, sizeKB: 120 })
  return list
}

/* ---- Search / filter / sort ---- */
export type MediaFilter =
  | 'all' | 'image' | 'video' | 'pdf' | 'document'
  | 'pinterest' | 'unused' | 'used' | 'recent'

export const mediaFilters: { id: MediaFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Video' },
  { id: 'pdf', label: 'PDF' },
  { id: 'document', label: 'Documents' },
  { id: 'pinterest', label: 'Pinterest assets' },
  { id: 'used', label: 'Used' },
  { id: 'unused', label: 'Unused' },
  { id: 'recent', label: 'Recently uploaded' },
]

export type MediaSort = 'newest' | 'oldest' | 'name' | 'size' | 'dimensions' | 'most-used' | 'least-used'

export const mediaSorts: { id: MediaSort; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'name', label: 'Name' },
  { id: 'size', label: 'File size' },
  { id: 'dimensions', label: 'Dimensions' },
  { id: 'most-used', label: 'Most used' },
  { id: 'least-used', label: 'Least used' },
]

const RECENT_IDS = new Set(['m-1', 'm-2', 'm-8', 'm-9', 'm-10'])

export function usageCount(item: MediaItem): number {
  return item.usage.length
}

export function matchesFilter(item: MediaItem, filter: MediaFilter): boolean {
  switch (filter) {
    case 'all': return true
    case 'image': return item.kind === 'image'
    case 'video': return item.kind === 'video'
    case 'pdf': return item.kind === 'pdf'
    case 'document': return item.kind === 'document'
    case 'pinterest': return item.role === 'pinterest' || isPinterestFormat(item)
    case 'unused': return usageCount(item) === 0
    case 'used': return usageCount(item) > 0
    case 'recent': return RECENT_IDS.has(item.id)
  }
}

export function searchMatch(item: MediaItem, q: string): boolean {
  if (!q.trim()) return true
  const s = q.toLowerCase()
  const hay = [
    item.filename, item.title, item.alt, item.caption, item.description,
    ...item.tags, ...item.usage.map((u) => u.label),
  ].join(' ').toLowerCase()
  return hay.includes(s)
}

function toTime(date: string): number {
  const t = Date.parse(date)
  return Number.isNaN(t) ? 0 : t
}

export function sortMedia(items: MediaItem[], sort: MediaSort): MediaItem[] {
  const out = items.slice()
  switch (sort) {
    case 'newest': out.sort((a, b) => toTime(b.uploaded) - toTime(a.uploaded)); break
    case 'oldest': out.sort((a, b) => toTime(a.uploaded) - toTime(b.uploaded)); break
    case 'name': out.sort((a, b) => a.filename.localeCompare(b.filename)); break
    case 'size': out.sort((a, b) => b.sizeKB - a.sizeKB); break
    case 'dimensions': out.sort((a, b) => b.width * b.height - a.width * a.height); break
    case 'most-used': out.sort((a, b) => usageCount(b) - usageCount(a)); break
    case 'least-used': out.sort((a, b) => usageCount(a) - usageCount(b)); break
  }
  return out
}

export function queryMedia(opts: { search?: string; filter?: MediaFilter; sort?: MediaSort; tag?: string; collection?: string }): MediaItem[] {
  let out = mediaLibrary.filter(
    (m) =>
      searchMatch(m, opts.search ?? '') &&
      matchesFilter(m, opts.filter ?? 'all') &&
      (!opts.tag || m.tags.includes(opts.tag)) &&
      (!opts.collection || m.collections.includes(opts.collection)),
  )
  out = sortMedia(out, opts.sort ?? 'newest')
  return out
}

/* ---- Bulk actions (labels only; no persistence in the prototype) ---- */
export const bulkActions = [
  { id: 'tag-add', label: 'Add tags', danger: false },
  { id: 'tag-remove', label: 'Remove tags', danger: false },
  { id: 'collection', label: 'Move to collection', danger: false },
  { id: 'metadata', label: 'Update metadata', danger: false },
  { id: 'optimize', label: 'Optimize', danger: false },
  { id: 'delete', label: 'Delete', danger: true },
] as const

/* ---- Duplicate detection (placeholder groups — not a real hash match) ---- */
export type DuplicateGroup = { id: string; reason: string; items: MediaItem[] }

export const duplicateGroups: DuplicateGroup[] = [
  {
    id: 'dup-1',
    reason: 'Same visual content at different sizes',
    items: [mediaLibrary[0], mediaLibrary[9]].filter(Boolean),
  },
]

/* ---- Galleries (reusable across content types) ---- */
export type Gallery = {
  id: string
  name: string
  usedIn: string
  cover: string
  imageIds: string[]
}

export const galleries: Gallery[] = [
  { id: 'g-1', name: 'Christmas Nails — Steps', usedIn: 'Listicle', cover: media('1607779097040-26e80aa78e66'), imageIds: ['m-1', 'm-2', 'm-4'] },
  { id: 'g-2', name: 'Autumn Tablescape Gallery', usedIn: 'Guide', cover: media('1509440159596-0249088772ff', 1600, 900), imageIds: ['m-5', 'm-9', 'm-11'] },
  { id: 'g-3', name: 'Halloween Party Inspiration', usedIn: 'Listicle', cover: media('1509557965875-b88c97052f0e', 1500, 1000), imageIds: ['m-6', 'm-8'] },
]

/* ---- Media activity history ---- */
export type MediaActivity = {
  id: string
  user: string
  action: 'Uploaded' | 'Edited' | 'Replaced' | 'Deleted' | 'Used in content' | 'Metadata changed'
  media: string
  when: string
}

export const mediaActivity: MediaActivity[] = [
  { id: 'ma-1', user: 'Amanda Thompson', action: 'Uploaded', media: 'autumn-table.jpg', when: '2 hours ago' },
  { id: 'ma-2', user: 'Jordan Blake', action: 'Metadata changed', media: 'christmas-nails-hero.jpg', when: '4 hours ago' },
  { id: 'ma-3', user: 'Maya Reyes', action: 'Used in content', media: 'garlic-pasta.jpg', when: 'Yesterday' },
  { id: 'ma-4', user: 'Alicia Butler', action: 'Replaced', media: 'wedding-centerpiece.jpg', when: 'Yesterday' },
  { id: 'ma-5', user: 'Jordan Blake', action: 'Edited', media: 'christmas-nails-pin.jpg', when: '2 days ago' },
  { id: 'ma-6', user: 'Amanda Thompson', action: 'Deleted', media: 'draft-hero-old.jpg', when: '3 days ago' },
]

/* ---- Settings sections (future configuration; no provider assumptions) ---- */
export const settingsSections: { id: string; title: string; note: string; fields: string[] }[] = [
  { id: 'storage', title: 'Storage', note: 'Where uploaded files live. Provider is configured in the backend phase.', fields: ['Local disk', 'Object storage', 'CDN-backed bucket'] },
  { id: 'processing', title: 'Image Processing', note: 'Automatic rendition generation on upload.', fields: ['Generate variants on upload', 'Preserve original', 'Strip EXIF metadata'] },
  { id: 'cdn', title: 'CDN', note: 'Delivery and cache configuration.', fields: ['CDN base URL', 'Cache TTL', 'Signed URLs'] },
  { id: 'compression', title: 'Compression', note: 'Target formats and quality.', fields: ['Preferred format (WebP / AVIF)', 'Quality target', 'Lossless for graphics'] },
  { id: 'responsive', title: 'Responsive Images', note: 'srcset breakpoints served to the public site.', fields: ['Breakpoints', 'Retina (2x) renditions', 'Art-directed sources'] },
  { id: 'pinterest', title: 'Pinterest Assets', note: 'Vertical pin defaults.', fields: ['Default pin template', '1000 × 1500 enforcement', 'Auto-generate alternate pins'] },
  { id: 'limits', title: 'Upload Limits', note: 'Guardrails for editors.', fields: ['Max file size', 'Allowed formats', 'Max dimensions'] },
]

export { pinTemplates, PIN_SPEC, getTemplate, SITE_URL_FALLBACK }
