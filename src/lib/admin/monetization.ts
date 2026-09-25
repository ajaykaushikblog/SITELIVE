/* =========================================================================
   Phase 17 — Universal Monetization & Affiliate data architecture.

   ONE centralized model powers display ads, ad networks, affiliate products,
   affiliate links, affiliate networks, product collections, sponsored
   campaigns, placements, monetization rules and reporting — across the whole
   CMS, not tied to individual articles. Reuses the Phase 8 ad slot registry
   in `../ads`.

   IMPORTANT: No ad network, affiliate network, payment or analytics provider
   is connected. All revenue / impression / click figures are illustrative
   EXAMPLE data and are labelled as such in the UI. Real integrations,
   tracking, persistence and auth arrive in the backend phase.
   ========================================================================= */

import { allSlots, type AdSlotConfig } from '../ads'
import { taxonomyByKind } from './cms'

/** Shown wherever illustrative numbers appear. */
export const PLACEHOLDER_NOTE =
  'Example / placeholder data. No ad network, affiliate network or analytics provider is connected yet.'

/* -------------------------------------------------------------------------
   Connection states (no fake "connected" states)
   ------------------------------------------------------------------------- */
export type ConnectionStatus = 'not-connected' | 'connected' | 'needs-configuration' | 'disabled'
export const connectionMeta: Record<ConnectionStatus, { label: string; tone: string }> = {
  'not-connected': { label: 'Not Connected', tone: 'bg-muted text-muted-foreground' },
  connected: { label: 'Connected', tone: 'bg-success/15 text-success' },
  'needs-configuration': { label: 'Needs Configuration', tone: 'bg-warning/15 text-warning' },
  disabled: { label: 'Disabled', tone: 'bg-error/12 text-error' },
}

/* -------------------------------------------------------------------------
   1. Ad networks
   ------------------------------------------------------------------------- */
export type AdNetworkType = 'display' | 'video' | 'native' | 'direct'
export type AdNetwork = {
  id: string
  name: string
  type: AdNetworkType
  accountId: string
  status: ConnectionStatus
  isDefault: boolean
  notes?: string
}

export const adNetworks: AdNetwork[] = [
  { id: 'net-adsense', name: 'Google AdSense', type: 'display', accountId: '', status: 'not-connected', isDefault: true, notes: 'Primary display network — connect a publisher ID in the backend phase.' },
  { id: 'net-display', name: 'Other Display Network', type: 'display', accountId: '', status: 'needs-configuration', isDefault: false },
  { id: 'net-direct', name: 'Direct Sponsor', type: 'direct', accountId: '', status: 'not-connected', isDefault: false, notes: 'House / directly-sold placements.' },
]

/* -------------------------------------------------------------------------
   2. Affiliate networks (merchant-agnostic — never hard-coded to Amazon)
   ------------------------------------------------------------------------- */
export type AffiliateNetwork = {
  id: string
  name: string
  networkId: string
  accountRef: string
  status: ConnectionStatus
  isDefault: boolean
  notes?: string
}

export const affiliateNetworks: AffiliateNetwork[] = [
  { id: 'aff-amazon', name: 'Amazon Associates', networkId: 'amazon', accountRef: '', status: 'not-connected', isDefault: true },
  { id: 'aff-impact', name: 'Impact', networkId: 'impact', accountRef: '', status: 'not-connected', isDefault: false },
  { id: 'aff-cj', name: 'CJ (Commission Junction)', networkId: 'cj', accountRef: '', status: 'not-connected', isDefault: false },
  { id: 'aff-shareasale', name: 'ShareASale', networkId: 'shareasale', accountRef: '', status: 'not-connected', isDefault: false },
  { id: 'aff-direct', name: 'Direct Affiliate', networkId: 'direct', accountRef: '', status: 'needs-configuration', isDefault: false, notes: 'Directly negotiated merchant partnerships.' },
]

/* -------------------------------------------------------------------------
   3. Affiliate products (central library)
   ------------------------------------------------------------------------- */
export type ProductStatus = 'active' | 'inactive' | 'expired'
export const productStatusMeta: Record<ProductStatus, { label: string; tone: string }> = {
  active: { label: 'Active', tone: 'bg-success/15 text-success' },
  inactive: { label: 'Inactive', tone: 'bg-muted text-muted-foreground' },
  expired: { label: 'Expired', tone: 'bg-error/12 text-error' },
}

export type AffiliateProduct = {
  id: string
  name: string
  description: string
  image: string
  merchant: string
  networkId: string
  category: string
  price: number
  currency: string
  affiliateUrl: string
  productUrl: string
  ctaText: string
  disclosure: string
  status: ProductStatus
  updated: string
  /** where this product is placed (usage tracking) */
  usage: { articles: string[]; recipes: string[]; diy: string[]; collections: string[]; homepage: number }
}

const pimg = (id: string) => `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&q=70`

export const DEFAULT_PRODUCT_DISCLOSURE =
  'This post may contain affiliate links. We may earn a commission if you purchase through our links, at no extra cost to you.'

export const affiliateProducts: AffiliateProduct[] = [
  { id: 'ap-1', name: 'Stoneware Berry Bowl Set', description: 'Hand-glazed ceramic bowls that photograph beautifully.', image: pimg('1578749556568-bc2c40e68b61'), merchant: 'Amazon', networkId: 'aff-amazon', category: 'Kitchen', price: 38, currency: 'USD', affiliateUrl: 'https://amzn.to/example-berry-bowl', productUrl: 'https://example.com/berry-bowl', ctaText: 'Shop now', disclosure: DEFAULT_PRODUCT_DISCLOSURE, status: 'active', updated: 'Dec 2, 2025', usage: { articles: ['c-1004'], recipes: ['c-1013'], diy: [], collections: ['pc-1'], homepage: 1 } },
  { id: 'ap-2', name: 'Linen Table Runner, Rust', description: 'Warm, washed linen that anchors a seasonal tablescape.', image: pimg('1600166898405-da9535204843'), merchant: 'West Elm', networkId: 'aff-impact', category: 'Home Decor', price: 45, currency: 'USD', affiliateUrl: 'https://impact.example/linen-runner', productUrl: 'https://westelm.com/linen-runner', ctaText: 'View at West Elm', disclosure: DEFAULT_PRODUCT_DISCLOSURE, status: 'active', updated: 'Nov 28, 2025', usage: { articles: ['c-1004'], recipes: [], diy: [], collections: ['pc-2'], homepage: 0 } },
  { id: 'ap-3', name: 'Copper Measuring Cups', description: 'A baker’s staple with a warm metallic finish.', image: pimg('1584990347449-a2d4c2c9b8f5'), merchant: 'Amazon', networkId: 'aff-amazon', category: 'Kitchen', price: 29, currency: 'USD', affiliateUrl: 'https://amzn.to/example-copper-cups', productUrl: 'https://example.com/copper-cups', ctaText: 'Shop now', disclosure: DEFAULT_PRODUCT_DISCLOSURE, status: 'active', updated: 'Nov 20, 2025', usage: { articles: [], recipes: ['c-1007'], diy: [], collections: ['pc-1'], homepage: 0 } },
  { id: 'ap-4', name: 'Macramé Cord, Natural 4mm', description: 'Soft cotton cord for wall hangings and ornaments.', image: pimg('1519681393784-d120267933ba'), merchant: 'Etsy', networkId: 'aff-direct', category: 'DIY Supplies', price: 18, currency: 'USD', affiliateUrl: 'https://etsy.example/macrame-cord', productUrl: 'https://etsy.com/macrame-cord', ctaText: 'Get the supplies', disclosure: DEFAULT_PRODUCT_DISCLOSURE, status: 'active', updated: 'Nov 15, 2025', usage: { articles: [], recipes: [], diy: ['c-1003'], collections: ['pc-3'], homepage: 0 } },
  { id: 'ap-5', name: 'Warm White Fairy Lights', description: '33ft of gentle, batter­y-powered ambience.', image: pimg('1513297887119-d46091b24bfa'), merchant: 'Target', networkId: 'aff-cj', category: 'Home Decor', price: 22, currency: 'USD', affiliateUrl: 'https://cj.example/fairy-lights', productUrl: 'https://target.com/fairy-lights', ctaText: 'Shop at Target', disclosure: DEFAULT_PRODUCT_DISCLOSURE, status: 'active', updated: 'Oct 30, 2025', usage: { articles: ['c-1005'], recipes: [], diy: ['c-1012'], collections: ['pc-4'], homepage: 0 } },
  { id: 'ap-6', name: 'Gel Nail Starter Kit', description: 'Everything for an at-home salon manicure.', image: pimg('1604654894610-df63bc536371'), merchant: 'Sephora', networkId: 'aff-impact', category: 'Beauty', price: 65, currency: 'USD', affiliateUrl: 'https://impact.example/gel-kit', productUrl: 'https://sephora.com/gel-kit', ctaText: 'Shop the kit', disclosure: DEFAULT_PRODUCT_DISCLOSURE, status: 'inactive', updated: 'Oct 12, 2025', usage: { articles: ['c-1001'], recipes: [], diy: [], collections: ['pc-5'], homepage: 0 } },
  { id: 'ap-7', name: 'Dried Floral Bundle', description: 'Preserved botanicals for centerpieces & décor.', image: pimg('1487070183336-b863922373d4'), merchant: 'Afloral', networkId: 'aff-shareasale', category: 'Weddings', price: 34, currency: 'USD', affiliateUrl: 'https://shareasale.example/dried-florals', productUrl: 'https://afloral.com/dried-florals', ctaText: 'Shop florals', disclosure: DEFAULT_PRODUCT_DISCLOSURE, status: 'expired', updated: 'Aug 20, 2025', usage: { articles: [], recipes: [], diy: ['c-1006'], collections: ['pc-4'], homepage: 0 } },
  { id: 'ap-8', name: 'Cast Iron Skillet, 12"', description: 'Pre-seasoned and built to last a lifetime.', image: pimg('1544025162-d76694265947'), merchant: 'Lodge', networkId: 'aff-cj', category: 'Kitchen', price: 40, currency: 'USD', affiliateUrl: 'https://cj.example/cast-iron', productUrl: 'https://lodge.com/cast-iron', ctaText: 'Shop now', disclosure: DEFAULT_PRODUCT_DISCLOSURE, status: 'active', updated: 'Oct 5, 2025', usage: { articles: [], recipes: ['c-1013', 'c-1002'], diy: [], collections: ['pc-1'], homepage: 0 } },
]

export function getProduct(id: string) {
  return affiliateProducts.find((p) => p.id === id)
}

/** Total placements for a product across the CMS. */
export function productPlacementCount(p: AffiliateProduct) {
  return p.usage.articles.length + p.usage.recipes.length + p.usage.diy.length + p.usage.collections.length + p.usage.homepage
}

/* -------------------------------------------------------------------------
   4. Affiliate links (destination ↔ affiliate destination kept separate)
   ------------------------------------------------------------------------- */
export type LinkStatus = 'active' | 'disabled'
export type AffiliateLink = {
  id: string
  destinationUrl: string
  affiliateUrl: string
  merchant: string
  productId?: string
  trackingParams: string
  disclosure: string
  status: LinkStatus
  updated: string
  usageCount: number
  /** placeholder click count (labelled example data) */
  exampleClicks: number
}

export const affiliateLinks: AffiliateLink[] = [
  { id: 'al-1', destinationUrl: 'https://example.com/berry-bowl', affiliateUrl: 'https://amzn.to/example-berry-bowl', merchant: 'Amazon', productId: 'ap-1', trackingParams: 'tag=marigold-20', disclosure: DEFAULT_PRODUCT_DISCLOSURE, status: 'active', updated: 'Dec 2, 2025', usageCount: 3, exampleClicks: 412 },
  { id: 'al-2', destinationUrl: 'https://westelm.com/linen-runner', affiliateUrl: 'https://impact.example/linen-runner', merchant: 'West Elm', productId: 'ap-2', trackingParams: 'irclickid=xyz', disclosure: DEFAULT_PRODUCT_DISCLOSURE, status: 'active', updated: 'Nov 28, 2025', usageCount: 1, exampleClicks: 188 },
  { id: 'al-3', destinationUrl: 'https://etsy.com/macrame-cord', affiliateUrl: 'https://etsy.example/macrame-cord', merchant: 'Etsy', productId: 'ap-4', trackingParams: '', disclosure: DEFAULT_PRODUCT_DISCLOSURE, status: 'active', updated: 'Nov 15, 2025', usageCount: 2, exampleClicks: 96 },
  { id: 'al-4', destinationUrl: 'https://afloral.com/dried-florals', affiliateUrl: 'https://shareasale.example/dried-florals', merchant: 'Afloral', productId: 'ap-7', trackingParams: 'sscid=abc', disclosure: DEFAULT_PRODUCT_DISCLOSURE, status: 'disabled', updated: 'Aug 20, 2025', usageCount: 1, exampleClicks: 41 },
  { id: 'al-5', destinationUrl: 'https://sephora.com/gel-kit', affiliateUrl: 'https://impact.example/gel-kit', merchant: 'Sephora', productId: 'ap-6', trackingParams: 'irclickid=def', disclosure: DEFAULT_PRODUCT_DISCLOSURE, status: 'disabled', updated: 'Oct 12, 2025', usageCount: 1, exampleClicks: 73 },
]

/* -------------------------------------------------------------------------
   5. Product collections (groups of affiliate products)
   ------------------------------------------------------------------------- */
export type ProductCollectionStatus = 'active' | 'scheduled' | 'draft' | 'expired'
export type ProductCollection = {
  id: string
  name: string
  description: string
  coverImage: string
  productIds: string[]
  status: ProductCollectionStatus
  startDate?: string
  endDate?: string
}

const cov = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&h=630&fit=crop&q=70`

export const productCollections: ProductCollection[] = [
  { id: 'pc-1', name: 'Kitchen Essentials', description: 'Everyday tools our food editors reach for.', coverImage: cov('1556910103-1c02745aae4d'), productIds: ['ap-1', 'ap-3', 'ap-8'], status: 'active' },
  { id: 'pc-2', name: 'Home Decor Favorites', description: 'Warm, textural pieces for any room.', coverImage: cov('1586023492125-27b2c045efd7'), productIds: ['ap-2', 'ap-5'], status: 'active' },
  { id: 'pc-3', name: 'DIY Tools & Supplies', description: 'Craft supplies for weekend makes.', coverImage: cov('1512389142860-9c449e58a543'), productIds: ['ap-4'], status: 'active' },
  { id: 'pc-4', name: 'Christmas Gift Ideas', description: 'Curated presents for everyone on your list.', coverImage: cov('1481391319762-47dff72954d9'), productIds: ['ap-5', 'ap-7'], status: 'scheduled', startDate: '2026-11-28', endDate: '2026-12-24' },
  { id: 'pc-5', name: 'Beauty Favorites', description: 'At-home beauty picks worth the shelf space.', coverImage: cov('1607779097040-26e80aa78e66'), productIds: ['ap-6'], status: 'draft' },
]

/* -------------------------------------------------------------------------
   6. Sponsored campaigns
   ------------------------------------------------------------------------- */
export type SponsoredStatus = 'draft' | 'scheduled' | 'active' | 'expired' | 'disabled'
export const sponsoredStatusMeta: Record<SponsoredStatus, { label: string; tone: string }> = {
  draft: { label: 'Draft', tone: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Scheduled', tone: 'bg-primary/12 text-primary' },
  active: { label: 'Active', tone: 'bg-success/15 text-success' },
  expired: { label: 'Expired', tone: 'bg-secondary text-secondary-foreground' },
  disabled: { label: 'Disabled', tone: 'bg-error/12 text-error' },
}

export const DEFAULT_SPONSORED_DISCLOSURE = 'Sponsored — paid partnership.'

export type SponsoredCampaign = {
  id: string
  brand: string
  campaign: string
  logo?: string
  image: string
  title: string
  description: string
  cta: string
  destinationUrl: string
  disclosure: string
  placement: PlacementType
  startDate: string
  endDate: string
  status: SponsoredStatus
  /** labelled example metrics */
  exampleImpressions: number
  exampleClicks: number
}

export const sponsoredCampaigns: SponsoredCampaign[] = [
  { id: 'sp-1', brand: 'Hearth & Hollow', campaign: 'Autumn Table 2026', image: cov('1513694203232-719a280e022f'), title: 'Layered Autumn Table Styling in Five Steps', description: 'Warm textures, seasonal botanicals and heirloom ceramics for an effortless gathering.', cta: 'Explore the collection', destinationUrl: 'https://example.com/hearth-hollow', disclosure: DEFAULT_SPONSORED_DISCLOSURE, placement: 'homepage', startDate: '2026-09-01', endDate: '2026-11-01', status: 'active', exampleImpressions: 128400, exampleClicks: 2140 },
  { id: 'sp-2', brand: 'Bright Kitchen Co.', campaign: 'Holiday Baking', image: cov('1481391319762-47dff72954d9'), title: 'Bake Brighter This Holiday Season', description: 'Tools and mixes for stress-free holiday baking.', cta: 'Shop the range', destinationUrl: 'https://example.com/bright-kitchen', disclosure: DEFAULT_SPONSORED_DISCLOSURE, placement: 'article', startDate: '2026-11-15', endDate: '2026-12-26', status: 'scheduled', exampleImpressions: 0, exampleClicks: 0 },
  { id: 'sp-3', brand: 'Petal & Vine', campaign: 'Spring Weddings', image: cov('1519225421980-715cb0215aed'), title: 'Effortless Wedding Florals', description: 'Sustainable dried and preserved florals for the modern couple.', cta: 'Discover florals', destinationUrl: 'https://example.com/petal-vine', disclosure: DEFAULT_SPONSORED_DISCLOSURE, placement: 'category', startDate: '2026-02-01', endDate: '2026-05-01', status: 'expired', exampleImpressions: 96200, exampleClicks: 1510 },
]

/* -------------------------------------------------------------------------
   7. Placements (where monetization appears)
   ------------------------------------------------------------------------- */
export type PlacementType = 'homepage' | 'category' | 'article' | 'recipe' | 'diy' | 'search' | 'collection'
export const placementTypes: PlacementType[] = ['homepage', 'category', 'article', 'recipe', 'diy', 'search', 'collection']

export type ContentPosition = 'top' | 'middle' | 'bottom' | 'sidebar' | 'inline' | 'related'
export const contentPositions: ContentPosition[] = ['top', 'middle', 'bottom', 'sidebar', 'inline', 'related']

export type Placement = {
  id: string
  pageType: PlacementType
  position: ContentPosition
  /** ad slot id from the Phase 8 registry */
  slotId: string
  enabled: boolean
}

export const placements: Placement[] = [
  { id: 'pl-1', pageType: 'homepage', position: 'middle', slotId: 'homepage_mid', enabled: true },
  { id: 'pl-2', pageType: 'homepage', position: 'bottom', slotId: 'footer', enabled: true },
  { id: 'pl-3', pageType: 'article', position: 'top', slotId: 'article_top', enabled: true },
  { id: 'pl-4', pageType: 'article', position: 'middle', slotId: 'article_mid', enabled: true },
  { id: 'pl-5', pageType: 'article', position: 'bottom', slotId: 'article_bottom', enabled: true },
  { id: 'pl-6', pageType: 'article', position: 'sidebar', slotId: 'sidebar_sticky', enabled: true },
  { id: 'pl-7', pageType: 'category', position: 'top', slotId: 'category_top', enabled: true },
  { id: 'pl-8', pageType: 'category', position: 'inline', slotId: 'category_grid', enabled: true },
  { id: 'pl-9', pageType: 'recipe', position: 'top', slotId: 'article_top', enabled: true },
  { id: 'pl-10', pageType: 'diy', position: 'top', slotId: 'article_top', enabled: false },
  { id: 'pl-11', pageType: 'collection', position: 'middle', slotId: 'category_mid', enabled: true },
  { id: 'pl-12', pageType: 'search', position: 'inline', slotId: 'mobile_inline_1', enabled: false },
]

/* -------------------------------------------------------------------------
   8. Monetization rules (configurable — never hard-coded per category)
   ------------------------------------------------------------------------- */
export type RuleField = 'contentType' | 'category' | 'subcategory' | 'occasion' | 'season' | 'tag' | 'style' | 'audience'
export type RuleActionType = 'show-product-collection' | 'show-ad-config' | 'show-sponsored' | 'disable-ads' | 'recommend-products'

export const ruleFields: { id: RuleField; label: string }[] = [
  { id: 'contentType', label: 'Content type' },
  { id: 'category', label: 'Category' },
  { id: 'subcategory', label: 'Subcategory' },
  { id: 'occasion', label: 'Occasion' },
  { id: 'season', label: 'Season' },
  { id: 'tag', label: 'Tag' },
  { id: 'style', label: 'Style' },
  { id: 'audience', label: 'Audience' },
]

export const ruleActionTypes: { id: RuleActionType; label: string }[] = [
  { id: 'show-product-collection', label: 'Show product collection' },
  { id: 'recommend-products', label: 'Recommend products (by signals)' },
  { id: 'show-ad-config', label: 'Use ad configuration' },
  { id: 'show-sponsored', label: 'Show sponsored placement' },
  { id: 'disable-ads', label: 'Disable ads' },
]

export type RuleCondition = { field: RuleField; value: string }
export type RuleAction = { type: RuleActionType; value?: string }
export type MonetizationRule = {
  id: string
  name: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  status: 'active' | 'disabled'
}

export const monetizationRules: MonetizationRule[] = [
  { id: 'mr-1', name: 'Recipes → kitchen products', conditions: [{ field: 'contentType', value: 'recipe' }], actions: [{ type: 'show-product-collection', value: 'pc-1' }], status: 'active' },
  { id: 'mr-2', name: 'DIY → tools & supplies', conditions: [{ field: 'category', value: 'DIY' }], actions: [{ type: 'show-product-collection', value: 'pc-3' }], status: 'active' },
  { id: 'mr-3', name: 'Christmas → gift ideas', conditions: [{ field: 'occasion', value: 'Christmas' }], actions: [{ type: 'show-product-collection', value: 'pc-4' }], status: 'active' },
  { id: 'mr-4', name: 'Articles → standard ad config', conditions: [{ field: 'contentType', value: 'article' }], actions: [{ type: 'show-ad-config', value: 'standard' }], status: 'active' },
  { id: 'mr-5', name: 'Weddings → sponsored florals', conditions: [{ field: 'occasion', value: 'Weddings' }], actions: [{ type: 'show-sponsored', value: 'sp-3' }], status: 'disabled' },
]

/* Recommendation-engine matching signals (future-ready, not personalized) */
export const recommendationSignals: RuleField[] = ['category', 'subcategory', 'occasion', 'season', 'tag', 'style', 'audience']

/* -------------------------------------------------------------------------
   9. Disclosures (centralized)
   ------------------------------------------------------------------------- */
export const disclosureSettings = {
  global: 'This post may contain affiliate links. We may earn a commission if you purchase through our links, at no extra cost to you.',
  product: DEFAULT_PRODUCT_DISCLOSURE,
  sponsored: 'This content is sponsored. Marigold & Maple only partners with brands we trust.',
}

/* -------------------------------------------------------------------------
   10. Reporting — labelled EXAMPLE metrics (no real analytics connected)
   ------------------------------------------------------------------------- */
export type Metric = { key: string; label: string; hint: string; example: string }

export const dashboardMetrics: Metric[] = [
  { key: 'revenue', label: 'Estimated Revenue', hint: 'Display + affiliate + sponsored', example: '$—' },
  { key: 'impressions', label: 'Ad Impressions', hint: 'Total ad views', example: '—' },
  { key: 'clicks', label: 'Ad Clicks', hint: 'Total ad clicks', example: '—' },
  { key: 'ctr', label: 'CTR', hint: 'Click-through rate', example: '—' },
  { key: 'rpm', label: 'RPM', hint: 'Revenue per mille', example: '$—' },
  { key: 'affClicks', label: 'Affiliate Clicks', hint: 'Outbound product clicks', example: '—' },
  { key: 'affRevenue', label: 'Affiliate Revenue', hint: 'Commission earned', example: '$—' },
  { key: 'sponRevenue', label: 'Sponsored Revenue', hint: 'Placement fees', example: '$—' },
]

export const dateRanges = ['Today', '7 days', '30 days', '90 days', 'Custom'] as const
export type DateRange = (typeof dateRanges)[number]

/** Rows are descriptive; metrics render as "—" placeholders (no fake numbers). */
export type RevenueByContentRow = { id: string; title: string; type: string }

/* -------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------- */
export function merchantList(): string[] {
  return Array.from(new Set(affiliateProducts.map((p) => p.merchant))).sort()
}
export function productCategoryList(): string[] {
  return Array.from(new Set(affiliateProducts.map((p) => p.category))).sort()
}
export function networkName(id: string): string {
  return affiliateNetworks.find((n) => n.id === id)?.name ?? id
}
export function adSlotList(): AdSlotConfig[] {
  return allSlots()
}
export function taxonomyValues(field: RuleField): string[] {
  switch (field) {
    case 'contentType':
      return ['article', 'recipe', 'diy', 'listicle', 'guide', 'product-guide']
    case 'category':
      return taxonomyByKind.category.map((t) => t.name)
    case 'subcategory':
      return taxonomyByKind.subcategory.map((t) => t.name)
    case 'occasion':
      return taxonomyByKind.occasion.map((t) => t.name)
    case 'season':
      return taxonomyByKind.season.map((t) => t.name)
    case 'tag':
      return taxonomyByKind.tag.map((t) => t.name)
    case 'style':
      return taxonomyByKind.style.map((t) => t.name)
    case 'audience':
      return taxonomyByKind.audience.map((t) => t.name)
    default:
      return []
  }
}

export function move<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = index + dir
  if (next < 0 || next >= list.length) return list
  const out = list.slice()
  ;[out[index], out[next]] = [out[next], out[index]]
  return out
}
