/* =========================================================================
   Universal Advertisement & Monetization system — configuration layer.

   This is the single source of truth for ad slots, formats, and the
   affiliate / sponsored sample content. Front-end only: real AdSense,
   affiliate networks and analytics get wired to these shapes later.
   No fake earnings / CPC / RPM values live here — performance metrics are
   intentionally left null so the UI renders honest "—" placeholders.
   ========================================================================= */

/* ---- Display formats (reserved dimensions prevent layout shift) ---- */

export type AdFormat =
  | 'leaderboard'
  | 'billboard'
  | 'rectangle'
  | 'half-page'
  | 'mobile'
  | 'in-feed'

export const adFormats: Record<AdFormat, { w: number; h: number; label: string }> = {
  leaderboard: { w: 728, h: 90, label: '728 × 90' },
  billboard: { w: 970, h: 250, label: '970 × 250' },
  rectangle: { w: 300, h: 250, label: '300 × 250' },
  'half-page': { w: 300, h: 600, label: '300 × 600' },
  mobile: { w: 320, h: 100, label: '320 × 100' },
  'in-feed': { w: 640, h: 200, label: 'Responsive · In-feed' },
}

/* ---- Slot taxonomy ---- */

export type AdType = 'display' | 'affiliate' | 'sponsored' | 'native'
export type AdDevice = 'all' | 'desktop' | 'mobile'
export type AdStatus = 'active' | 'inactive' | 'scheduled'

export type AdSlotConfig = {
  id: string
  name: string
  placement: string
  type: AdType
  device: AdDevice
  format: AdFormat
  status: AdStatus
  startDate: string | null
  endDate: string | null
  /** Third-party ad code (AdSense unit, etc.) — empty = house placeholder. */
  code: string
  image: string | null
  destinationUrl: string | null
  label: string
}

/* Reusable slot registry. Placements are generic (article_mid, category_top…)
   so the same slot ids serve thousands of pages without per-page hard-coding. */
export const adSlots: Record<string, AdSlotConfig> = {
  header_top: slot('header_top', 'Header Top Banner', 'Below global header', 'display', 'all', 'leaderboard'),
  homepage_mid: slot('homepage_mid', 'Homepage Mid Billboard', 'Between homepage sections', 'display', 'all', 'billboard'),
  homepage_sponsored: slot('homepage_sponsored', 'Homepage Sponsored Feature', 'Native homepage placement', 'sponsored', 'all', 'in-feed'),
  article_top: slot('article_top', 'Article Top', 'Before article content', 'display', 'all', 'leaderboard'),
  article_mid: slot('article_mid', 'Article Mid', 'Mid-article, between sections', 'display', 'all', 'rectangle'),
  article_bottom: slot('article_bottom', 'Article Bottom', 'After article content', 'display', 'all', 'leaderboard'),
  sidebar_sticky: slot('sidebar_sticky', 'Sticky Sidebar', 'Desktop sticky sidebar rail', 'display', 'desktop', 'half-page'),
  category_top: slot('category_top', 'Category Top Banner', 'Top of category / occasion page', 'display', 'all', 'billboard'),
  category_mid: slot('category_mid', 'Category Mid', 'Between category content rows', 'display', 'all', 'leaderboard'),
  category_grid: slot('category_grid', 'Category In-Grid', 'Woven into content grid', 'display', 'all', 'rectangle'),
  related_content: slot('related_content', 'Related Content', 'Before related content block', 'display', 'all', 'leaderboard'),
  mobile_inline_1: slot('mobile_inline_1', 'Mobile Inline 1', 'First mobile inline unit', 'display', 'mobile', 'mobile'),
  mobile_inline_2: slot('mobile_inline_2', 'Mobile Inline 2', 'Second mobile inline unit', 'display', 'mobile', 'mobile'),
  footer: slot('footer', 'Footer Banner', 'Above global footer', 'display', 'all', 'leaderboard'),
}

function slot(
  id: string,
  name: string,
  placement: string,
  type: AdType,
  device: AdDevice,
  format: AdFormat,
): AdSlotConfig {
  return {
    id,
    name,
    placement,
    type,
    device,
    format,
    status: 'active',
    startDate: null,
    endDate: null,
    code: '',
    image: null,
    destinationUrl: null,
    label: 'Advertisement',
  }
}

export function getSlot(id: string): AdSlotConfig | undefined {
  return adSlots[id]
}

export const allSlots = (): AdSlotConfig[] => Object.values(adSlots)

/* ---- Affiliate products (sample content; wired to a real feed later) ---- */

export type AffiliateProduct = {
  id: string
  name: string
  merchant: string
  price: string
  image: string
  description?: string
  rating?: number
  href: string
}

export const affiliateDisclosure =
  'This post may contain affiliate links. We may earn a commission if you purchase through our links, at no extra cost to you.'

export const sampleAffiliateProducts: AffiliateProduct[] = [
  {
    id: 'p1',
    name: 'Stoneware Berry Bowl Set',
    merchant: 'Amazon',
    price: '$38',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80',
    description: 'Hand-glazed ceramic bowls that photograph beautifully.',
    rating: 4.7,
    href: '#',
  },
  {
    id: 'p2',
    name: 'Linen Table Runner, Rust',
    merchant: 'West Elm',
    price: '$45',
    image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80',
    description: 'Warm, washed linen that anchors a seasonal tablescape.',
    rating: 4.9,
    href: '#',
  },
  {
    id: 'p3',
    name: 'Copper Measuring Cups',
    merchant: 'Amazon',
    price: '$29',
    image: 'https://images.unsplash.com/photo-1584990347449-a2d4c2c9b8f5?w=600&q=80',
    description: 'A baker’s staple with a warm metallic finish.',
    rating: 4.6,
    href: '#',
  },
]

/* ---- Sponsored content (sample) ---- */

export type SponsoredItem = {
  id: string
  brand: string
  logo?: string
  image: string
  title: string
  description: string
  cta: string
  href: string
}

export const sampleSponsored: SponsoredItem = {
  id: 's1',
  brand: 'Hearth & Hollow',
  image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&q=80',
  title: 'Layered Autumn Table Styling in Five Steps',
  description:
    'Presented by Hearth & Hollow — warm textures, seasonal botanicals, and heirloom ceramics for an effortless gathering.',
  cta: 'Explore the collection',
  href: '#',
}

/* ---- Admin dashboard helpers (real counts from config only) ---- */

export function slotSummary() {
  const all = allSlots()
  const by = (fn: (s: AdSlotConfig) => boolean) => all.filter(fn).length
  return {
    total: all.length,
    active: by((s) => s.status === 'active'),
    inactive: by((s) => s.status === 'inactive'),
    sponsored: by((s) => s.type === 'sponsored'),
    affiliate: by((s) => s.type === 'affiliate'),
    desktop: by((s) => s.device === 'desktop' || s.device === 'all'),
    mobile: by((s) => s.device === 'mobile' || s.device === 'all'),
  }
}

/* Analytics fields the future CMS will populate. value === null renders as a
   placeholder "—" — never invent fake performance numbers. */
export const analyticsFields: { key: string; label: string; hint: string; value: number | null }[] = [
  { key: 'impressions', label: 'Impressions', hint: 'Total ad views', value: null },
  { key: 'clicks', label: 'Clicks', hint: 'Total ad clicks', value: null },
  { key: 'ctr', label: 'CTR', hint: 'Click-through rate', value: null },
  { key: 'revenue', label: 'Est. Revenue', hint: 'Display network est.', value: null },
  { key: 'rpm', label: 'RPM', hint: 'Revenue per mille', value: null },
  { key: 'affiliateClicks', label: 'Affiliate Clicks', hint: 'Outbound product clicks', value: null },
  { key: 'affiliateRevenue', label: 'Affiliate Revenue', hint: 'Commission earned', value: null },
  { key: 'sponsoredRevenue', label: 'Sponsored Revenue', hint: 'Placement fees', value: null },
]
