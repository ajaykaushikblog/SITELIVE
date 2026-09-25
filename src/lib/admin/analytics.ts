/* =========================================================================
   Phase 18 — Universal Analytics, Site Health & Reporting data architecture.

   Descriptive reporting + monitoring structures for a large editorial site.
   This layer is deliberately SEPARATE from any provider integration: no
   analytics service, search-engine API, revenue tracker, Core Web Vitals
   feed, email provider or crawler is connected. Every number below is
   illustrative EXAMPLE data (deterministically seeded so it stays stable) and
   is labelled as such throughout the UI. Reporting is website-level and
   aggregated only — no individual visitor profiles or personal attributes.
   ========================================================================= */

import { contentItems, taxonomyByKind, contentType, type ContentItem } from './cms'
import { affiliateProducts, sponsoredCampaigns, adSlotList, networkName } from './monetization'

export const ANALYTICS_NOTE =
  'Example data. No analytics, search-engine, revenue or monitoring provider is connected yet — figures are illustrative until integrations are added.'

/* ---- Deterministic pseudo-random so example figures never jump around ---- */
function seeded(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}
function between(seed: string, min: number, max: number) {
  return Math.round(min + seeded(seed) * (max - min))
}

/* ------------------------------------------------------------------ */
/* Core reusable structures (spec §35)                                 */
/* ------------------------------------------------------------------ */
export type ComparisonDirection = 'increased' | 'decreased' | 'unchanged'
export type AnalyticsMetric = {
  metric: string
  value: string
  period: string
  comparison: { direction: ComparisonDirection; delta: string } | null
}

export type ChartType = 'line' | 'bar' | 'area' | 'table'
export type Report = {
  id: string
  name: string
  dateRange: string
  metrics: string[]
  dimensions: string[]
  filters: string[]
  visualization: ChartType
}

export type HealthStatus = 'healthy' | 'warning' | 'attention'
export type HealthCheck = {
  id: string
  category: string
  status: HealthStatus
  message: string
  lastChecked: string
}

export type AlertStatus = 'active' | 'paused'
export type Alert = {
  id: string
  name: string
  condition: string
  threshold: string
  frequency: string
  status: AlertStatus
}

export const healthStatusMeta: Record<HealthStatus, { label: string; tone: string; dot: string }> = {
  healthy: { label: 'Healthy', tone: 'bg-success/15 text-success', dot: 'bg-success' },
  warning: { label: 'Warning', tone: 'bg-warning/15 text-warning', dot: 'bg-warning' },
  attention: { label: 'Needs Attention', tone: 'bg-error/12 text-error', dot: 'bg-error' },
}

/* ------------------------------------------------------------------ */
/* Date ranges                                                         */
/* ------------------------------------------------------------------ */
export const dateRanges = ['Today', '7 Days', '30 Days', '90 Days', '12 Months', 'Custom Range'] as const
export type DateRangeId = (typeof dateRanges)[number]

/** A human label for the concrete window a preset represents (illustrative). */
export function rangeLabel(id: DateRangeId): string {
  switch (id) {
    case 'Today':
      return 'Sep 24, 2026'
    case '7 Days':
      return 'Sep 18 – Sep 24, 2026'
    case '30 Days':
      return 'Aug 26 – Sep 24, 2026'
    case '90 Days':
      return 'Jun 26 – Sep 24, 2026'
    case '12 Months':
      return 'Oct 2025 – Sep 2026'
    default:
      return 'Custom range'
  }
}

/** Scale example totals up for longer windows so they feel coherent. */
export function rangeScale(id: DateRangeId): number {
  return { Today: 1, '7 Days': 7, '30 Days': 30, '90 Days': 90, '12 Months': 365, 'Custom Range': 30 }[id]
}

/* ------------------------------------------------------------------ */
/* 2–3. Traffic overview + sources                                     */
/* ------------------------------------------------------------------ */
export function trafficMetrics(range: DateRangeId): AnalyticsMetric[] {
  const s = rangeScale(range)
  const period = rangeLabel(range)
  const cmp = (dir: ComparisonDirection, delta: string) => ({ direction: dir, delta })
  return [
    { metric: 'Page Views', value: (between('pv', 1400, 3200) * s).toLocaleString(), period, comparison: cmp('increased', '+8.4%') },
    { metric: 'Sessions', value: (between('se', 900, 2100) * s).toLocaleString(), period, comparison: cmp('increased', '+6.1%') },
    { metric: 'Users', value: (between('us', 700, 1700) * s).toLocaleString(), period, comparison: cmp('increased', '+5.2%') },
    { metric: 'New Users', value: (between('nu', 400, 1100) * s).toLocaleString(), period, comparison: cmp('increased', '+9.0%') },
    { metric: 'Returning Users', value: (between('ru', 200, 700) * s).toLocaleString(), period, comparison: cmp('decreased', '-1.3%') },
    { metric: 'Avg. Engagement Time', value: '1m 52s', period, comparison: cmp('unchanged', '0%') },
    { metric: 'Pages / Session', value: '2.4', period, comparison: cmp('increased', '+2.0%') },
  ]
}

export type TrafficSource = { source: string; visits: number; pct: number; direction: ComparisonDirection }
export function trafficSources(range: DateRangeId): TrafficSource[] {
  const s = rangeScale(range)
  const raw = [
    { source: 'Organic Search', weight: 46, dir: 'increased' as const },
    { source: 'Pinterest', weight: 28, dir: 'increased' as const },
    { source: 'Direct', weight: 11, dir: 'unchanged' as const },
    { source: 'Social', weight: 7, dir: 'decreased' as const },
    { source: 'Referral', weight: 4, dir: 'unchanged' as const },
    { source: 'Email', weight: 3, dir: 'increased' as const },
    { source: 'Other', weight: 1, dir: 'unchanged' as const },
  ]
  const base = between('src', 1200, 2400) * s
  return raw.map((r) => ({ source: r.source, visits: Math.round((base * r.weight) / 100), pct: r.weight, direction: r.dir }))
}

export type LandingPage = { title: string; href: string; views: number }
export function topLandingPages(range: DateRangeId): LandingPage[] {
  const s = rangeScale(range)
  return contentItems
    .filter((c) => c.status === 'published')
    .slice(0, 6)
    .map((c) => ({ title: c.title, href: `${contentType(c.type).routePrefix}/${c.slug}`, views: between(c.id + 'lp', 120, 900) * s }))
    .sort((a, b) => b.views - a.views)
}

/** A stable example series for the trend chart (length points). */
export function trendSeries(seed: string, points: number, min: number, max: number): number[] {
  return Array.from({ length: points }, (_, i) => between(`${seed}-${i}`, min, max))
}

/* ------------------------------------------------------------------ */
/* 4–5. Content performance                                            */
/* ------------------------------------------------------------------ */
export type ContentPerfRow = {
  item: ContentItem
  views: number
  sessions: number
  engagement: string
}
export function contentPerformance(range: DateRangeId): ContentPerfRow[] {
  const s = rangeScale(range)
  return contentItems.map((c) => {
    const views = between(c.id + 'v', 40, 720) * s
    return {
      item: c,
      views,
      sessions: Math.round(views * 0.72),
      engagement: `${between(c.id + 'e', 40, 130)}s`,
    }
  })
}

/* ------------------------------------------------------------------ */
/* 6. Category performance                                             */
/* ------------------------------------------------------------------ */
export type DimensionPerfRow = { name: string; published: number; views: number; sessions: number; engagement: string; pins: number; affiliateClicks: number }
export function dimensionPerformance(kind: 'category' | 'subcategory' | 'occasion' | 'season', range: DateRangeId): DimensionPerfRow[] {
  const s = rangeScale(range)
  return taxonomyByKind[kind].slice(0, 10).map((t) => ({
    name: t.name,
    published: t.count,
    views: between(t.id + 'v', 200, 2600) * s,
    sessions: between(t.id + 's', 150, 2000) * s,
    engagement: `${between(t.id + 'e', 50, 140)}s`,
    pins: between(t.id + 'p', 10, 400),
    affiliateClicks: between(t.id + 'a', 5, 180) * s,
  }))
}

/* ------------------------------------------------------------------ */
/* 7. Author performance                                              */
/* ------------------------------------------------------------------ */
export type AuthorPerfRow = { name: string; published: number; views: number; sessions: number; engagement: string; pins: number }
export function authorPerformance(range: DateRangeId): AuthorPerfRow[] {
  const s = rangeScale(range)
  const names = Array.from(new Set(contentItems.map((c) => c.author)))
  return names.map((name) => {
    const own = contentItems.filter((c) => c.author === name)
    return {
      name,
      published: own.filter((c) => c.status === 'published').length,
      views: between(name + 'v', 300, 3200) * s,
      sessions: between(name + 's', 200, 2400) * s,
      engagement: `${between(name + 'e', 60, 150)}s`,
      pins: own.reduce((n, c) => n + c.pinCount, 0),
    }
  })
}

/* ------------------------------------------------------------------ */
/* 8. Search performance                                              */
/* ------------------------------------------------------------------ */
export type SearchQueryRow = { query: string; volume: number; clicks: number; exitRate: string }
export const popularSearches: SearchQueryRow[] = [
  { query: 'christmas nail ideas', volume: 1840, clicks: 1210, exitRate: '18%' },
  { query: 'easy dinner recipes', volume: 1520, clicks: 990, exitRate: '22%' },
  { query: 'diy ornaments', volume: 980, clicks: 640, exitRate: '25%' },
  { query: 'thanksgiving table', volume: 760, clicks: 480, exitRate: '20%' },
  { query: 'halloween party', volume: 690, clicks: 410, exitRate: '28%' },
]
export const noResultSearches: SearchQueryRow[] = [
  { query: 'gingerbread house kit', volume: 210, clicks: 0, exitRate: '100%' },
  { query: 'new year tablescape', volume: 168, clicks: 0, exitRate: '100%' },
  { query: 'easter nail art', volume: 142, clicks: 0, exitRate: '100%' },
]
/** Editorial interpretation — clearly distinct from raw analytics. */
export const contentOpportunities: { topic: string; note: string }[] = [
  { topic: 'Gingerbread house kit', note: 'Readers searched for this but found nothing — a buying guide could fill the gap.' },
  { topic: 'New Year tablescape', note: 'No matching content; adjacent to existing Thanksgiving tablescape guide.' },
  { topic: 'Easter nail art', note: 'Seasonal opportunity ahead of spring.' },
]

/* ------------------------------------------------------------------ */
/* 9–10. Pinterest + social                                            */
/* ------------------------------------------------------------------ */
export function pinterestMetrics(range: DateRangeId): AnalyticsMetric[] {
  const s = rangeScale(range)
  const period = rangeLabel(range)
  return [
    { metric: 'Impressions', value: (between('pi-imp', 2000, 6000) * s).toLocaleString(), period, comparison: { direction: 'increased', delta: '+12%' } },
    { metric: 'Saves', value: (between('pi-save', 300, 1200) * s).toLocaleString(), period, comparison: { direction: 'increased', delta: '+7%' } },
    { metric: 'Outbound Clicks', value: (between('pi-click', 200, 900) * s).toLocaleString(), period, comparison: { direction: 'increased', delta: '+9%' } },
    { metric: 'Engagement Rate', value: '4.1%', period, comparison: { direction: 'unchanged', delta: '0%' } },
  ]
}
export type PinRow = { title: string; template: string; saves: number; clicks: number }
export function topPins(range: DateRangeId): PinRow[] {
  const s = rangeScale(range)
  const templates = ['standard', 'recipe', 'holiday', 'diy', 'listicle']
  return contentItems.filter((c) => c.pinCount > 0).slice(0, 6).map((c, i) => ({
    title: c.title,
    template: templates[i % templates.length],
    saves: between(c.id + 'ps', 20, 400) * s,
    clicks: between(c.id + 'pc', 10, 260) * s,
  }))
}

export type SocialRow = { platform: string; shares: number; clicks: number; engagement: string; referral: number }
export function socialPerformance(range: DateRangeId): SocialRow[] {
  const s = rangeScale(range)
  return ['Facebook', 'Instagram', 'X', 'Other'].map((platform) => ({
    platform,
    shares: between(platform + 'sh', 40, 600) * s,
    clicks: between(platform + 'cl', 20, 400) * s,
    engagement: `${between(platform + 'en', 1, 6)}.${between(platform + 'en2', 0, 9)}%`,
    referral: between(platform + 're', 10, 300) * s,
  }))
}

/* ------------------------------------------------------------------ */
/* 11–13. Ads / affiliate / sponsored (connected to Phase 17)          */
/* ------------------------------------------------------------------ */
export type AdPerfRow = { slot: string; device: string; pageType: string; impressions: number; clicks: number; ctr: string; rpm: string }
export function adPerformance(range: DateRangeId): AdPerfRow[] {
  const s = rangeScale(range)
  return adSlotList().map((slot) => {
    const impressions = between(slot.id + 'i', 400, 6000) * s
    const clicks = between(slot.id + 'c', 5, 90) * s
    return {
      slot: slot.name,
      device: slot.device,
      pageType: slot.placement,
      impressions,
      clicks,
      ctr: `${((clicks / impressions) * 100).toFixed(2)}%`,
      rpm: `$${(seeded(slot.id) * 6 + 1).toFixed(2)}`,
    }
  })
}

export type AffiliatePerfRow = { product: string; merchant: string; category: string; clicks: number; conversion: string }
export function affiliatePerformance(range: DateRangeId): AffiliatePerfRow[] {
  const s = rangeScale(range)
  return affiliateProducts.map((p) => ({
    product: p.name,
    merchant: p.merchant,
    category: p.category,
    clicks: between(p.id + 'c', 10, 500) * s,
    conversion: `${(seeded(p.id) * 5 + 0.5).toFixed(1)}%`,
  }))
}
export { networkName }

export type SponsoredPerfRow = { campaign: string; brand: string; impressions: number; clicks: number; ctr: string; start: string; end: string }
export function sponsoredPerformance(): SponsoredPerfRow[] {
  return sponsoredCampaigns.map((c) => ({
    campaign: c.campaign,
    brand: c.brand,
    impressions: c.exampleImpressions,
    clicks: c.exampleClicks,
    ctr: c.exampleImpressions ? `${((c.exampleClicks / c.exampleImpressions) * 100).toFixed(2)}%` : '—',
    start: c.startDate,
    end: c.endDate,
  }))
}

/* ------------------------------------------------------------------ */
/* 14. Newsletter                                                      */
/* ------------------------------------------------------------------ */
export function newsletterMetrics(range: DateRangeId): AnalyticsMetric[] {
  const s = rangeScale(range)
  const period = rangeLabel(range)
  return [
    { metric: 'Subscribers', value: (between('nl-sub', 8000, 9000) + s * 5).toLocaleString(), period, comparison: { direction: 'increased', delta: '+1.8%' } },
    { metric: 'New Subscribers', value: (between('nl-new', 20, 120) * s).toLocaleString(), period, comparison: { direction: 'increased', delta: '+4.0%' } },
    { metric: 'Unsubscribes', value: (between('nl-un', 2, 20) * s).toLocaleString(), period, comparison: { direction: 'decreased', delta: '-0.5%' } },
    { metric: 'Open Rate', value: '38.2%', period, comparison: { direction: 'unchanged', delta: '0%' } },
    { metric: 'Click Rate', value: '6.4%', period, comparison: { direction: 'increased', delta: '+0.7%' } },
    { metric: 'Referral Traffic', value: (between('nl-ref', 100, 500) * s).toLocaleString(), period, comparison: { direction: 'increased', delta: '+3.1%' } },
  ]
}

/* ------------------------------------------------------------------ */
/* 23–24. Devices + geography (aggregated only)                        */
/* ------------------------------------------------------------------ */
export type DeviceRow = { device: string; sessions: number; views: number; engagement: string }
export function deviceReport(range: DateRangeId): DeviceRow[] {
  const s = rangeScale(range)
  return [
    { device: 'Mobile', pct: 62 },
    { device: 'Desktop', pct: 30 },
    { device: 'Tablet', pct: 8 },
  ].map((d) => ({
    device: d.device,
    sessions: Math.round((between('dev', 1200, 2400) * s * d.pct) / 100),
    views: Math.round((between('devv', 2400, 4800) * s * d.pct) / 100),
    engagement: `${between(d.device + 'e', 60, 140)}s`,
  }))
}

export type GeoRow = { country: string; sessions: number; pct: number }
export function geoReport(range: DateRangeId): GeoRow[] {
  const s = rangeScale(range)
  const raw = [
    { country: 'United States', pct: 58 },
    { country: 'United Kingdom', pct: 12 },
    { country: 'Canada', pct: 9 },
    { country: 'Australia', pct: 7 },
    { country: 'Germany', pct: 4 },
    { country: 'Other', pct: 10 },
  ]
  const base = between('geo', 1500, 3000) * s
  return raw.map((r) => ({ country: r.country, sessions: Math.round((base * r.pct) / 100), pct: r.pct }))
}

/* ------------------------------------------------------------------ */
/* 25–26. Report builder + saved reports                               */
/* ------------------------------------------------------------------ */
export const availableMetrics = ['Page Views', 'Sessions', 'Users', 'Engagement', 'Pinterest Saves', 'Affiliate Clicks', 'Ad Impressions', 'Estimated Revenue']
export const availableDimensions = ['Content', 'Category', 'Occasion', 'Author', 'Device', 'Traffic Source', 'Date']
export const availableFilters = ['Content type', 'Status', 'Category', 'Author', 'Date range']

export const savedReports: Report[] = [
  { id: 'rp-1', name: 'Monthly Traffic', dateRange: '30 Days', metrics: ['Page Views', 'Sessions', 'Users'], dimensions: ['Date'], filters: [], visualization: 'line' },
  { id: 'rp-2', name: 'Pinterest Performance', dateRange: '90 Days', metrics: ['Pinterest Saves'], dimensions: ['Content'], filters: ['Content type'], visualization: 'bar' },
  { id: 'rp-3', name: 'Affiliate Performance', dateRange: '30 Days', metrics: ['Affiliate Clicks', 'Estimated Revenue'], dimensions: ['Content'], filters: [], visualization: 'table' },
  { id: 'rp-4', name: 'SEO Health', dateRange: '30 Days', metrics: [], dimensions: [], filters: [], visualization: 'table' },
  { id: 'rp-5', name: 'Content Performance', dateRange: '30 Days', metrics: ['Page Views', 'Engagement'], dimensions: ['Content', 'Author'], filters: ['Content type'], visualization: 'table' },
  { id: 'rp-6', name: 'Site Health', dateRange: 'Today', metrics: [], dimensions: [], filters: [], visualization: 'table' },
]

/* ------------------------------------------------------------------ */
/* 29. Alerts                                                          */
/* ------------------------------------------------------------------ */
export const alerts: Alert[] = [
  { id: 'al-1', name: 'Sudden traffic change', condition: 'Sessions change vs. previous period', threshold: '±25%', frequency: 'Daily', status: 'active' },
  { id: 'al-2', name: 'Broken links increase', condition: 'New broken links detected', threshold: '> 5', frequency: 'Daily', status: 'active' },
  { id: 'al-3', name: '404 increase', condition: 'New 404 URLs', threshold: '> 10', frequency: 'Daily', status: 'active' },
  { id: 'al-4', name: 'Sitemap error', condition: 'Sitemap generation error', threshold: 'Any', frequency: 'On change', status: 'active' },
  { id: 'al-5', name: 'Missing metadata', condition: 'Published pages missing title/description', threshold: '> 0', frequency: 'Weekly', status: 'paused' },
  { id: 'al-6', name: 'Performance degradation', condition: 'LCP above target', threshold: '> 2.5s', frequency: 'Daily', status: 'paused' },
]
export const alertConditions = ['Sudden traffic change', 'Broken links increase', '404 increase', 'Sitemap error', 'Missing metadata', 'Image errors', 'Affiliate link errors', 'Ad integration issue', 'Performance degradation']

/* ------------------------------------------------------------------ */
/* 30. Activity log                                                    */
/* ------------------------------------------------------------------ */
export type ActivityEntry = { id: string; user: string; action: string; area: string; timestamp: string; result: 'success' | 'warning' | 'failed' }
export const activityLog: ActivityEntry[] = [
  { id: 'ac-1', user: 'Amanda Thompson', action: 'Published article', area: 'Content', timestamp: 'Sep 24, 2026 · 10:42', result: 'success' },
  { id: 'ac-2', user: 'Jordan Blake', action: 'Updated homepage', area: 'Site', timestamp: 'Sep 24, 2026 · 09:18', result: 'success' },
  { id: 'ac-3', user: 'Maya Reyes', action: 'Changed SEO metadata', area: 'SEO', timestamp: 'Sep 23, 2026 · 17:05', result: 'success' },
  { id: 'ac-4', user: 'Alicia Butler', action: 'Uploaded media', area: 'Media', timestamp: 'Sep 23, 2026 · 15:30', result: 'success' },
  { id: 'ac-5', user: 'Amanda Thompson', action: 'Created redirect', area: 'SEO', timestamp: 'Sep 23, 2026 · 11:12', result: 'warning' },
  { id: 'ac-6', user: 'Maya Reyes', action: 'Updated affiliate product', area: 'Monetization', timestamp: 'Sep 22, 2026 · 14:48', result: 'success' },
  { id: 'ac-7', user: 'Jordan Blake', action: 'Deleted draft', area: 'Content', timestamp: 'Sep 22, 2026 · 09:03', result: 'failed' },
]

/* ------------------------------------------------------------------ */
/* 31. System status                                                   */
/* ------------------------------------------------------------------ */
export type ServiceState = 'connected' | 'not-connected' | 'warning' | 'error'
export const serviceStateMeta: Record<ServiceState, { label: string; tone: string; dot: string }> = {
  connected: { label: 'Connected', tone: 'bg-success/15 text-success', dot: 'bg-success' },
  'not-connected': { label: 'Not Connected', tone: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
  warning: { label: 'Warning', tone: 'bg-warning/15 text-warning', dot: 'bg-warning' },
  error: { label: 'Error', tone: 'bg-error/12 text-error', dot: 'bg-error' },
}
export type SystemService = { name: string; state: ServiceState; note: string }
export const systemServices: SystemService[] = [
  { name: 'Database', state: 'not-connected', note: 'Front-end prototype — no database wired.' },
  { name: 'Media Storage', state: 'not-connected', note: 'Media library uses placeholder assets.' },
  { name: 'CDN', state: 'not-connected', note: 'Configured during production deploy.' },
  { name: 'Analytics', state: 'not-connected', note: 'Connect an analytics provider to populate reports.' },
  { name: 'Search', state: 'warning', note: 'Client-side search only; no search analytics.' },
  { name: 'Email', state: 'not-connected', note: 'Newsletter provider not connected.' },
  { name: 'Advertising', state: 'not-connected', note: 'Ad network not connected (Phase 17).' },
  { name: 'Affiliate Tracking', state: 'not-connected', note: 'Affiliate network not connected (Phase 17).' },
  { name: 'Pinterest Integration', state: 'not-connected', note: 'Pinterest API not connected.' },
  { name: 'IndexNow', state: 'not-connected', note: 'Instant indexing not configured.' },
]

/* ------------------------------------------------------------------ */
/* 15–22. Site health                                                  */
/* ------------------------------------------------------------------ */
export const healthCategories: HealthCheck[] = [
  { id: 'h-perf', category: 'Performance', status: 'warning', message: 'Core Web Vitals require a real measurement source.', lastChecked: '—' },
  { id: 'h-seo', category: 'SEO', status: 'warning', message: '3 published pages are missing a meta description.', lastChecked: 'Sep 24, 2026' },
  { id: 'h-index', category: 'Indexing', status: 'healthy', message: 'Indexing rules are configured; crawler data not connected.', lastChecked: '—' },
  { id: 'h-links', category: 'Links', status: 'attention', message: '2 broken links detected in published content.', lastChecked: 'Sep 24, 2026' },
  { id: 'h-images', category: 'Images', status: 'warning', message: '5 images are missing alt text.', lastChecked: 'Sep 24, 2026' },
  { id: 'h-security', category: 'Security', status: 'healthy', message: 'HTTPS enforced; no known issues.', lastChecked: 'Sep 24, 2026' },
  { id: 'h-avail', category: 'Availability', status: 'healthy', message: 'Site reachable. Uptime monitoring not connected.', lastChecked: '—' },
]

export type LinkStatus = 'healthy' | 'broken' | 'redirect' | 'unknown'
export const linkStatusMeta: Record<LinkStatus, { label: string; tone: string }> = {
  healthy: { label: 'Healthy', tone: 'bg-success/15 text-success' },
  broken: { label: 'Broken', tone: 'bg-error/12 text-error' },
  redirect: { label: 'Redirect', tone: 'bg-warning/15 text-warning' },
  unknown: { label: 'Unknown', tone: 'bg-muted text-muted-foreground' },
}
export type BrokenLink = { url: string; source: string; type: 'internal' | 'external' | 'affiliate'; status: LinkStatus; firstDetected: string; lastChecked: string }
export const brokenLinks: BrokenLink[] = [
  { url: 'https://afloral.com/dried-florals', source: '/diy/wedding-centerpiece', type: 'affiliate', status: 'broken', firstDetected: 'Sep 20, 2026', lastChecked: 'Sep 24, 2026' },
  { url: '/recipe/old-cranberry-sauce', source: '/thanksgiving', type: 'internal', status: 'broken', firstDetected: 'Sep 18, 2026', lastChecked: 'Sep 24, 2026' },
  { url: 'http://example.com/moved', source: '/article/autumn-tablescape-guide', type: 'external', status: 'redirect', firstDetected: 'Sep 15, 2026', lastChecked: 'Sep 24, 2026' },
  { url: '/diy/unknown-project', source: '/diy', type: 'internal', status: 'unknown', firstDetected: 'Sep 22, 2026', lastChecked: '—' },
]

export type NotFoundEntry = { url: string; hits: number; firstDetected: string; lastDetected: string; suggested: string; status: 'new' | 'ignored' | 'resolved' }
export const notFoundLog: NotFoundEntry[] = [
  { url: '/christmas/nail-ideas', hits: 142, firstDetected: 'Sep 10, 2026', lastDetected: 'Sep 24, 2026', suggested: '/christmas/christmas-nail-ideas', status: 'new' },
  { url: '/recipe/garlic-pasta', hits: 88, firstDetected: 'Sep 12, 2026', lastDetected: 'Sep 23, 2026', suggested: '/recipe/creamy-garlic-pasta', status: 'new' },
  { url: '/blog/old-post', hits: 34, firstDetected: 'Aug 30, 2026', lastDetected: 'Sep 20, 2026', suggested: '—', status: 'ignored' },
  { url: '/diy/snowflakes', hits: 21, firstDetected: 'Sep 5, 2026', lastDetected: 'Sep 19, 2026', suggested: '/diy/macrame-snowflakes', status: 'resolved' },
]

export type RedirectIssue = { type: string; detail: string; status: HealthStatus }
export const redirectIssues: RedirectIssue[] = [
  { type: 'Redirect chain', detail: '/old → /interim → /final (2 hops)', status: 'warning' },
  { type: 'Redirect loop', detail: 'None detected', status: 'healthy' },
  { type: 'Redirect to 404', detail: '/promo-2024 → /promo (target missing)', status: 'attention' },
  { type: 'Invalid destination', detail: 'None detected', status: 'healthy' },
  { type: 'Excessive redirects', detail: 'None over 3 hops', status: 'healthy' },
]

export type SitemapEntry = { name: string; urls: number; lastGenerated: string; status: HealthStatus }
export const sitemaps: SitemapEntry[] = [
  { name: 'Sitemap index', urls: 4218, lastGenerated: 'Sep 24, 2026', status: 'healthy' },
  { name: 'Posts', urls: 1840, lastGenerated: 'Sep 24, 2026', status: 'healthy' },
  { name: 'Recipes', urls: 980, lastGenerated: 'Sep 24, 2026', status: 'healthy' },
  { name: 'DIY', urls: 524, lastGenerated: 'Sep 24, 2026', status: 'healthy' },
  { name: 'Categories', urls: 118, lastGenerated: 'Sep 24, 2026', status: 'healthy' },
  { name: 'Occasions', urls: 46, lastGenerated: 'Sep 24, 2026', status: 'warning' },
  { name: 'Authors', urls: 12, lastGenerated: 'Sep 24, 2026', status: 'healthy' },
  { name: 'Images', urls: 6120, lastGenerated: 'Sep 24, 2026', status: 'warning' },
]

export type IndexingBucket = { label: string; count: number }
export const indexingBuckets: IndexingBucket[] = [
  { label: 'Indexable pages', count: 3980 },
  { label: 'Noindex pages', count: 186 },
  { label: 'Canonicalized pages', count: 142 },
  { label: 'Redirected pages', count: 64 },
  { label: 'Excluded pages', count: 47 },
]
export const indexingWarnings: { category: string; count: number; status: HealthStatus }[] = [
  { category: 'Missing canonical', count: 12, status: 'warning' },
  { category: 'Noindex', count: 186, status: 'healthy' },
  { category: 'Duplicate', count: 4, status: 'attention' },
  { category: 'Redirect', count: 64, status: 'healthy' },
  { category: 'Blocked', count: 2, status: 'warning' },
]

export const imageIssues: { category: string; count: number; status: HealthStatus }[] = [
  { category: 'Missing alt text', count: 5, status: 'warning' },
  { category: 'Oversized images', count: 3, status: 'warning' },
  { category: 'Missing dimensions', count: 8, status: 'warning' },
  { category: 'Unoptimized images', count: 14, status: 'warning' },
  { category: 'Missing Pinterest assets', count: 21, status: 'attention' },
  { category: 'Broken images', count: 1, status: 'attention' },
]

export type WebVital = { metric: string; abbr: string; example: string; target: string; status: HealthStatus }
export const webVitals: WebVital[] = [
  { metric: 'Largest Contentful Paint', abbr: 'LCP', example: '—', target: '≤ 2.5s', status: 'warning' },
  { metric: 'Interaction to Next Paint', abbr: 'INP', example: '—', target: '≤ 200ms', status: 'warning' },
  { metric: 'Cumulative Layout Shift', abbr: 'CLS', example: '—', target: '≤ 0.1', status: 'warning' },
  { metric: 'First Contentful Paint', abbr: 'FCP', example: '—', target: '≤ 1.8s', status: 'warning' },
  { metric: 'Page Load Time', abbr: 'Load', example: '—', target: '≤ 3.0s', status: 'warning' },
]
