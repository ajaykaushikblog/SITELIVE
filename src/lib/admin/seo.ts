/* =========================================================================
   Universal technical SEO — data architecture (front-end prototype).

   Powers the SEO Control Center: dashboard, health score, per-item SEO editor,
   canonicals, robots, sitemaps, indexing, IndexNow, redirects, 404s, orphans,
   internal linking, structured data, image SEO, Open Graph and audit.

   All counts/statuses here are realistic placeholders for the interface. No
   live crawler, search-engine API, sitemap generator or database is connected
   — that arrives in the production/backend phase.
   ========================================================================= */

import { contentItems, contentType, taxonomyByKind, adminAuthors, SITE_URL_FALLBACK } from './cms'

/* ---- Validation helpers (guidance ranges, not ranking guarantees) ---- */
export type ValidationState = 'empty' | 'short' | 'good' | 'long'

export const TITLE_RANGE = { min: 30, max: 60 }
export const META_RANGE = { min: 120, max: 160 }

export function validateLength(value: string, range: { min: number; max: number }): ValidationState {
  const len = value.trim().length
  if (len === 0) return 'empty'
  if (len < range.min) return 'short'
  if (len > range.max) return 'long'
  return 'good'
}

export const validationMeta: Record<ValidationState, { label: string; tone: string; bar: string }> = {
  empty: { label: 'Empty', tone: 'text-error', bar: 'bg-error' },
  short: { label: 'Too short', tone: 'text-warning', bar: 'bg-warning' },
  good: { label: 'Recommended', tone: 'text-success', bar: 'bg-success' },
  long: { label: 'Too long', tone: 'text-warning', bar: 'bg-warning' },
}

/* ---- Dashboard cards (illustrative) ---- */
export const seoDashboardCards: { label: string; value: string; tone?: 'default' | 'warn' }[] = [
  { label: 'Total published pages', value: '3,640' },
  { label: 'Indexable pages', value: '3,612' },
  { label: 'Noindex pages', value: '606' },
  { label: 'Pages in sitemap', value: '3,588' },
  { label: 'Missing SEO titles', value: '18', tone: 'warn' },
  { label: 'Missing meta descriptions', value: '34', tone: 'warn' },
  { label: 'Missing canonicals', value: '12', tone: 'warn' },
  { label: 'Missing image alt text', value: '52', tone: 'warn' },
  { label: 'Schema issues', value: '5', tone: 'warn' },
  { label: 'Broken links', value: '7', tone: 'warn' },
  { label: 'Orphan pages', value: '9', tone: 'warn' },
  { label: '404 errors', value: '18', tone: 'warn' },
  { label: 'Redirects', value: '46' },
]

/* ---- Health score categories (status only, no fake ranking score) ---- */
export type HealthLevel = 'healthy' | 'attention' | 'warning'
export const seoHealthCategories: { label: string; level: HealthLevel; note: string }[] = [
  { label: 'Technical SEO', level: 'healthy', note: 'Crawlability & response codes look good' },
  { label: 'On-Page SEO', level: 'attention', note: '34 pages missing meta descriptions' },
  { label: 'Indexing', level: 'healthy', note: 'Robots directives consistent' },
  { label: 'Structured Data', level: 'warning', note: '5 schema validation issues' },
  { label: 'Images', level: 'attention', note: '52 images missing alt text' },
  { label: 'Internal Linking', level: 'attention', note: '9 orphan pages detected' },
  { label: 'Sitemaps', level: 'healthy', note: 'All sitemaps generated & valid' },
  { label: 'Redirects', level: 'healthy', note: 'No loops or chains found' },
]

export const healthLevelMeta: Record<HealthLevel, { label: string; tone: string }> = {
  healthy: { label: 'Healthy', tone: 'bg-success/15 text-success' },
  attention: { label: 'Needs attention', tone: 'bg-warning/15 text-warning' },
  warning: { label: 'Warning', tone: 'bg-error/12 text-error' },
}

/* ---- Universal SEO audit rows (content + taxonomy + author pages) ---- */
export type IndexStatus = 'index' | 'noindex'
export type CanonicalState = 'self' | 'custom' | 'missing' | 'duplicate'
export type AuditHealth = 'healthy' | 'warning' | 'error'

export type SeoAuditRow = {
  id: string
  url: string
  title: string
  contentType: string
  index: IndexStatus
  canonical: CanonicalState
  inSitemap: boolean
  hasTitle: boolean
  hasMeta: boolean
  schema: string
  altOk: boolean
  internalLinks: number
  health: AuditHealth
  author?: string
  category?: string
}

const rowHealth = (r: Omit<SeoAuditRow, 'health'>): AuditHealth => {
  if (!r.hasTitle || !r.hasMeta || r.canonical === 'missing' || r.canonical === 'duplicate') return 'error'
  if (!r.altOk || r.internalLinks < 2) return 'warning'
  return 'healthy'
}

function build(partial: Omit<SeoAuditRow, 'health'>): SeoAuditRow {
  return { ...partial, health: rowHealth(partial) }
}

export const seoAuditRows: SeoAuditRow[] = [
  // Content items
  ...contentItems
    .filter((c) => c.status !== 'trash')
    .map((c) =>
      build({
        id: c.id,
        url: `${contentType(c.type).routePrefix}/${c.slug}`,
        title: c.title,
        contentType: contentType(c.type).label,
        index: c.status === 'published' ? 'index' : 'noindex',
        canonical: c.seoHealth === 'missing' ? 'missing' : 'self',
        inSitemap: c.status === 'published' && c.seoHealth !== 'missing',
        hasTitle: true,
        hasMeta: c.seoHealth !== 'missing',
        schema: c.type === 'recipe' ? 'Recipe' : c.type === 'diy' ? 'HowTo' : c.type === 'listicle' ? 'ItemList' : 'Article',
        altOk: c.seoHealth === 'good',
        internalLinks: c.seoHealth === 'good' ? 6 : c.seoHealth === 'warning' ? 2 : 0,
        author: c.author,
        category: c.category,
      }),
    ),
  // Taxonomy landing pages
  ...taxonomyByKind.category.map((t) =>
    build({
      id: `tax-${t.id}`,
      url: `/${t.slug}`,
      title: `${t.name} — Marigold & Maple`,
      contentType: 'Category',
      index: t.indexable ? 'index' : 'noindex',
      canonical: 'self',
      inSitemap: t.indexable,
      hasTitle: true,
      hasMeta: true,
      schema: 'CollectionPage',
      altOk: true,
      internalLinks: 12,
      category: t.name,
    }),
  ),
  // Author pages
  ...adminAuthors.map((a) =>
    build({
      id: `author-${a.slug}`,
      url: `/author/${a.slug}`,
      title: `${a.name} — Author`,
      contentType: 'Author',
      index: a.status === 'active' ? 'index' : 'noindex',
      canonical: 'self',
      inSitemap: a.status === 'active',
      hasTitle: true,
      hasMeta: true,
      schema: 'ProfilePage',
      altOk: true,
      internalLinks: 8,
      author: a.name,
    }),
  ),
]

export const auditHealthMeta: Record<AuditHealth, { label: string; tone: string }> = {
  healthy: { label: 'Healthy', tone: 'bg-success/15 text-success' },
  warning: { label: 'Warning', tone: 'bg-warning/15 text-warning' },
  error: { label: 'Error', tone: 'bg-error/12 text-error' },
}

/* ---- Redirects ---- */
export type RedirectType = '301' | '302'
export type Redirect = {
  id: string
  source: string
  destination: string
  type: RedirectType
  status: 'active' | 'disabled'
  warning?: 'loop' | 'chain' | 'to-404' | 'to-redirect'
  created: string
  updated: string
}

export const redirects: Redirect[] = [
  { id: 'r-1', source: '/christmas-nail-designs', destination: '/article/christmas-nail-ideas', type: '301', status: 'active', created: 'Nov 2, 2025', updated: 'Nov 2, 2025' },
  { id: 'r-2', source: '/old/garlic-pasta', destination: '/recipe/creamy-garlic-pasta', type: '301', status: 'active', created: 'Oct 18, 2025', updated: 'Oct 18, 2025' },
  { id: 'r-3', source: '/summer-nails', destination: '/nails', type: '301', status: 'active', created: 'Sep 1, 2025', updated: 'Sep 1, 2025' },
  { id: 'r-4', source: '/holiday-guide', destination: '/christmas', type: '302', status: 'active', created: 'Aug 22, 2025', updated: 'Oct 1, 2025' },
  { id: 'r-5', source: '/deleted-post', destination: '/article/removed-article', type: '301', status: 'active', warning: 'to-404', created: 'Jul 12, 2025', updated: 'Jul 12, 2025' },
  { id: 'r-6', source: '/xmas', destination: '/holiday-guide', type: '301', status: 'active', warning: 'to-redirect', created: 'Jun 5, 2025', updated: 'Jun 5, 2025' },
]

export const redirectWarningMeta: Record<NonNullable<Redirect['warning']>, string> = {
  loop: 'Redirect loop',
  chain: 'Redirect chain',
  'to-404': 'Points to 404',
  'to-redirect': 'Points to another redirect',
}

/* ---- 404 monitoring ---- */
export type NotFoundHit = {
  id: string
  url: string
  first: string
  last: string
  hits: number
  suggestion: string | null
  status: 'new' | 'ignored' | 'resolved'
}

export const notFoundHits: NotFoundHit[] = [
  { id: 'n-1', url: '/christmas-cookies-recipe', first: 'Dec 1, 2025', last: '2 hours ago', hits: 214, suggestion: '/recipe/christmas-sugar-cookies', status: 'new' },
  { id: 'n-2', url: '/halloween-nails-2024', first: 'Oct 14, 2025', last: 'Yesterday', hits: 96, suggestion: '/nails', status: 'new' },
  { id: 'n-3', url: '/wedding-diy', first: 'Sep 8, 2025', last: '3 days ago', hits: 61, suggestion: '/diy/wedding-centerpiece', status: 'new' },
  { id: 'n-4', url: '/author/old-name', first: 'Aug 2, 2025', last: '1 week ago', hits: 22, suggestion: null, status: 'ignored' },
  { id: 'n-5', url: '/recipes/pumpkin', first: 'Oct 1, 2025', last: '5 days ago', hits: 44, suggestion: '/recipes', status: 'resolved' },
]

/* ---- Orphan pages ---- */
export type OrphanPage = {
  id: string
  url: string
  title: string
  type: string
  published: string
  internalLinks: number
  suggestion: string
  status: 'flagged' | 'ignored'
}

export const orphanPages: OrphanPage[] = [
  { id: 'o-1', url: '/diy/wedding-centerpiece', title: 'Modern Wedding Centerpiece with Dried Florals', type: 'DIY', published: 'Sep 18, 2025', internalLinks: 0, suggestion: 'Weddings hub, related DIY', status: 'flagged' },
  { id: 'o-2', url: '/article/watercolor-invitations', title: 'A Beginner’s Guide to Watercolor Wedding Invitations', type: 'DIY', published: 'Aug 22, 2025', internalLinks: 1, suggestion: 'Weddings stationery cluster', status: 'flagged' },
  { id: 'o-3', url: '/recipe/halloween-punch', title: 'Spooky-Cute Halloween Punch', type: 'Recipe', published: 'Oct 20, 2025', internalLinks: 1, suggestion: 'Halloween entertaining round-ups', status: 'flagged' },
]

/* ---- Sitemaps ---- */
export type SitemapCategory = {
  id: string
  name: string
  urls: number
  excluded: number
  errors: number
  lastGenerated: string
}

export const sitemapCategories: SitemapCategory[] = [
  { id: 'sm-posts', name: 'Posts Sitemap', urls: 1840, excluded: 96, errors: 0, lastGenerated: '2 hours ago' },
  { id: 'sm-recipes', name: 'Recipes Sitemap', urls: 962, excluded: 22, errors: 0, lastGenerated: '2 hours ago' },
  { id: 'sm-diy', name: 'DIY Sitemap', urls: 512, excluded: 14, errors: 1, lastGenerated: '2 hours ago' },
  { id: 'sm-cats', name: 'Categories Sitemap', urls: 42, excluded: 3, errors: 0, lastGenerated: '2 hours ago' },
  { id: 'sm-occasions', name: 'Occasions Sitemap', urls: 28, excluded: 2, errors: 0, lastGenerated: '2 hours ago' },
  { id: 'sm-authors', name: 'Authors Sitemap', urls: 12, excluded: 1, errors: 0, lastGenerated: '2 hours ago' },
  { id: 'sm-images', name: 'Images Sitemap', urls: 4218, excluded: 52, errors: 0, lastGenerated: '2 hours ago' },
]

export const sitemapEligibility = {
  included: ['Public', 'Canonical', 'Indexable', 'HTTP 200', 'Non-redirect', 'Non-duplicate'],
  excluded: ['Noindex pages', 'Redirects', 'Deleted content', 'Private content', 'Internal search', 'Duplicate URLs'],
}

export const sitemapValidation: { label: string; count: number; level: AuditHealth }[] = [
  { label: 'Invalid URLs', count: 0, level: 'healthy' },
  { label: 'Duplicate URLs', count: 0, level: 'healthy' },
  { label: 'Redirect URLs', count: 2, level: 'warning' },
  { label: 'Noindex URLs', count: 0, level: 'healthy' },
  { label: 'Missing canonicals', count: 1, level: 'warning' },
  { label: 'Broken URLs', count: 1, level: 'error' },
]

/* ---- robots.txt ---- */
export const defaultRobotsTxt = `# Marigold & Maple — robots.txt (production configuration draft)
User-agent: *
Allow: /

# Private & system areas
Disallow: /admin/
Disallow: /login/
Disallow: /account/
Disallow: /api/

# Internal search & arbitrary filters
Disallow: /search
Disallow: /*?s=
Disallow: /*?filter=

# Do not block assets required to render pages
Allow: /assets/
Allow: *.css
Allow: *.js

Sitemap: ${SITE_URL_FALLBACK}/sitemap_index.xml`

/* ---- Indexing / search engines ---- */
export type ConnectionState = 'not-connected' | 'connected' | 'needs-config' | 'error'
export const connectionMeta: Record<ConnectionState, { label: string; tone: string }> = {
  'not-connected': { label: 'Not connected', tone: 'bg-muted text-muted-foreground' },
  connected: { label: 'Connected', tone: 'bg-success/15 text-success' },
  'needs-config': { label: 'Needs configuration', tone: 'bg-warning/15 text-warning' },
  error: { label: 'Error', tone: 'bg-error/12 text-error' },
}

export const searchEngines: { id: string; name: string; tool: string; state: ConnectionState }[] = [
  { id: 'gsc', name: 'Google', tool: 'Google Search Console', state: 'not-connected' },
  { id: 'bing', name: 'Bing', tool: 'Bing Webmaster Tools', state: 'not-connected' },
  { id: 'yandex', name: 'Yandex', tool: 'Yandex Webmaster', state: 'not-connected' },
]

export const indexNowEvents: { id: string; url: string; event: 'Published' | 'Updated' | 'Deleted'; when: string }[] = [
  { id: 'in-1', url: '/article/christmas-nail-ideas', event: 'Published', when: '2 hours ago' },
  { id: 'in-2', url: '/recipe/creamy-garlic-pasta', event: 'Updated', when: '5 hours ago' },
  { id: 'in-3', url: '/article/summer-nail-trends-old', event: 'Deleted', when: '4 days ago' },
]

/* ---- Structured data control center ---- */
export type SchemaStatus = 'valid' | 'missing' | 'warning' | 'error'
export const schemaStatusMeta: Record<SchemaStatus, { label: string; tone: string }> = {
  valid: { label: 'Valid', tone: 'bg-success/15 text-success' },
  missing: { label: 'Missing', tone: 'bg-muted text-muted-foreground' },
  warning: { label: 'Warning', tone: 'bg-warning/15 text-warning' },
  error: { label: 'Error', tone: 'bg-error/12 text-error' },
}

export const schemaTypesStatus: { type: string; scope: string; count: number; status: SchemaStatus }[] = [
  { type: 'WebSite', scope: 'Site-wide', count: 1, status: 'valid' },
  { type: 'Organization', scope: 'Site-wide', count: 1, status: 'valid' },
  { type: 'Article', scope: 'Articles & listicles', count: 1980, status: 'valid' },
  { type: 'Recipe', scope: 'Recipes', count: 962, status: 'valid' },
  { type: 'HowTo', scope: 'DIY & tutorials', count: 512, status: 'warning' },
  { type: 'BreadcrumbList', scope: 'All pages', count: 3640, status: 'valid' },
  { type: 'Person', scope: 'Authors', count: 12, status: 'valid' },
  { type: 'ProfilePage', scope: 'Author pages', count: 12, status: 'valid' },
  { type: 'Product', scope: 'Product guides', count: 48, status: 'missing' },
]

/* ---- Image SEO ---- */
export const imageSeoChecks: { label: string; count: number; level: AuditHealth }[] = [
  { label: 'Missing alt text', count: 52, level: 'error' },
  { label: 'Missing dimensions', count: 8, level: 'warning' },
  { label: 'Oversized images', count: 23, level: 'warning' },
  { label: 'Non-descriptive filenames', count: 61, level: 'warning' },
  { label: 'Inefficient formats (JPEG/PNG)', count: 140, level: 'warning' },
  { label: 'Missing captions', count: 96, level: 'healthy' },
]

/* ---- SEO settings sections ---- */
export const seoSettingsSections = [
  'Global SEO',
  'Indexing',
  'Robots',
  'Sitemaps',
  'Canonical',
  'Structured Data',
  'Open Graph',
  'Pinterest',
  'IndexNow',
  'Redirects',
  'Internal Search',
  'Images',
]

/* ---- SEO change log ---- */
export const seoChangeLog: {
  id: string
  user: string
  page: string
  change: string
  from: string
  to: string
  when: string
}[] = [
  { id: 'sc-1', user: 'Jordan Blake', page: '/article/christmas-nail-ideas', change: 'SEO title changed', from: 'Christmas Nail Ideas', to: '25 Elegant Christmas Nail Ideas for the Holidays', when: '2 hours ago' },
  { id: 'sc-2', user: 'Maya Reyes', page: '/recipe/creamy-garlic-pasta', change: 'Canonical changed', from: '(auto)', to: '/recipe/creamy-garlic-pasta', when: '5 hours ago' },
  { id: 'sc-3', user: 'Alicia Butler', page: '/diy/wedding-centerpiece', change: 'Noindex enabled', from: 'index, follow', to: 'noindex, follow', when: 'Yesterday' },
  { id: 'sc-4', user: 'Amanda Thompson', page: '/christmas', change: 'Robots updated', from: 'index, follow', to: 'index, follow, max-image-preview:large', when: '2 days ago' },
  { id: 'sc-5', user: 'Jordan Blake', page: '/christmas-nail-designs', change: 'Redirect created', from: '—', to: '301 → /article/christmas-nail-ideas', when: '3 days ago' },
  { id: 'sc-6', user: 'Maya Reyes', page: '/recipe/christmas-sugar-cookies', change: 'Schema updated', from: 'Article', to: 'Recipe', when: '4 days ago' },
]
