import {
  type Article,
  type Author,
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
   Universal site-wide search index.
   Search is a lens over the SAME publishing system — every content type
   (articles, recipes, DIY, guides, ideas) is aggregated into one uniform
   SearchDoc so a single query mixes results naturally. Facets are derived
   from the live corpus, never hard-coded, so the filters always reflect
   whatever taxonomy the content actually uses. Everything here is designed
   to scale: the index build, faceting, ranking and pagination all work the
   same at 40 documents or 40,000.
   ========================================================================= */

export type SearchContentType = 'Article' | 'Recipe' | 'DIY' | 'Guide' | 'Ideas'

export type SearchDoc = {
  id: string
  title: string
  slug: string
  href: string
  excerpt?: string
  featuredImage: string
  contentType: SearchContentType
  category: string
  subcategory?: string
  occasions: string[]
  seasons: string[]
  tags: string[]
  styles: string[]
  audiences: string[]
  author: Author
  publishedDate: string
  updatedDate?: string
  readTime?: string
  status: 'published' | 'draft'
  featured: boolean
  popularScore: number
  savedCount: number
  /* precomputed for fast, allocation-free matching */
  _ts: number
  _hay: string
}

/* A small, stable hash so synthesized signals (popularity / saves) are
   deterministic per document rather than reshuffling on every render. */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 0xffffffff
}

const clean = (arr: (string | undefined)[]) =>
  [...new Set(arr.filter((v): v is string => !!v && v.trim().length > 0))]

function makeDoc(
  base: Omit<SearchDoc, '_ts' | '_hay' | 'popularScore' | 'savedCount'> &
    Partial<Pick<SearchDoc, 'popularScore' | 'savedCount'>>,
): SearchDoc {
  const seed = hash(base.id)
  const ts = Date.parse(base.publishedDate)
  const popularScore =
    base.popularScore ?? Math.round(40 + seed * 60 + (base.featured ? 12 : 0))
  const savedCount =
    base.savedCount ?? Math.round(120 + hash(base.id + 's') * 9800)
  const _hay = [
    base.title,
    base.excerpt,
    base.category,
    base.subcategory,
    ...base.occasions,
    ...base.seasons,
    ...base.tags,
    ...base.styles,
    ...base.audiences,
    base.contentType,
    base.author.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return { ...base, popularScore, savedCount, _ts: Number.isNaN(ts) ? 0 : ts, _hay }
}

/* ---- Build the unified index from every content source, once ---- */
function buildIndex(): SearchDoc[] {
  const docs: SearchDoc[] = []
  const seen = new Set<string>()

  const add = (d: SearchDoc) => {
    if (seen.has(d.id)) return
    seen.add(d.id)
    docs.push(d)
  }

  /* Full articles (may be guides / listicles) */
  for (const a of Object.values(articlesBySlug)) {
    const isGuide = /guide/i.test(a.contentType)
    add(
      makeDoc({
        id: a.id,
        title: a.title,
        slug: a.slug,
        href: `/article/${a.slug}`,
        excerpt: a.excerpt,
        featuredImage: a.featuredImage,
        contentType: isGuide ? 'Guide' : 'Article',
        category: a.category,
        subcategory: a.subcategory,
        occasions: clean(a.occasions),
        seasons: clean(a.seasons),
        tags: clean(a.tags),
        styles: clean(a.styles),
        audiences: clean(a.audiences),
        author: a.author,
        publishedDate: a.publishedDate,
        updatedDate: a.updatedDate,
        readTime: a.readTime,
        status: a.status,
        featured: a.featured,
      }),
    )
  }

  /* Full recipes */
  for (const r of Object.values(recipesBySlug)) {
    add(
      makeDoc({
        id: r.id,
        title: r.title,
        slug: r.slug,
        href: `/recipe/${r.slug}`,
        excerpt: r.description,
        featuredImage: r.featuredImage,
        contentType: 'Recipe',
        category: r.category,
        subcategory: r.subcategory,
        occasions: clean(r.occasions),
        seasons: clean(r.seasons),
        tags: clean(r.tags),
        styles: clean(r.styles),
        audiences: [],
        author: r.author,
        publishedDate: r.publishedDate,
        updatedDate: r.updatedDate,
        readTime: r.totalTime,
        status: r.status,
        featured: false,
        savedCount: r.rating ? r.rating.count * 6 : undefined,
      }),
    )
  }

  /* Full DIY projects */
  for (const d of Object.values(diyBySlug)) {
    add(
      makeDoc({
        id: d.id,
        title: d.title,
        slug: d.slug,
        href: `/diy/${d.slug}`,
        excerpt: d.description,
        featuredImage: d.featuredImage,
        contentType: 'DIY',
        category: d.category,
        subcategory: d.subcategory,
        occasions: clean(d.occasions),
        seasons: clean(d.seasons),
        tags: clean(d.tags),
        styles: clean(d.styles),
        audiences: clean(d.audiences),
        author: d.author,
        publishedDate: d.publishedDate,
        updatedDate: d.updatedDate,
        readTime: d.timeRequired,
        status: d.status,
        featured: false,
      }),
    )
  }

  /* Editorial content rows (homepage / category seed data) — these are
     real published cards that also belong in search results. */
  const recipeIds = new Set(recipeRow.map((r) => r.id))
  const rows: { items: Article[]; type?: SearchContentType }[] = [
    { items: trending },
    { items: beauty },
    { items: weddings },
    { items: celebrations },
    { items: recipeRow, type: 'Recipe' },
    { items: seasonalSpotlight.articles },
  ]
  for (const { items, type } of rows) {
    for (const a of items) {
      add(
        makeDoc({
          id: a.id,
          title: a.title,
          slug: a.href,
          href: a.href,
          excerpt: a.excerpt,
          featuredImage: a.image,
          contentType: type ?? (recipeIds.has(a.id) ? 'Recipe' : 'Ideas'),
          category: a.category,
          occasions: clean(a.taxonomy ?? []),
          seasons: [],
          tags: clean(a.taxonomy ?? []),
          styles: [],
          audiences: [],
          author: a.author,
          publishedDate: a.date,
          readTime: a.readTime,
          status: 'published',
          featured: false,
        }),
      )
    }
  }

  return docs
}

export const searchIndex: SearchDoc[] = buildIndex()

/* ------------------------------------------------------------------ */
/* Facets — derived from the live corpus so filters always match data */
/* ------------------------------------------------------------------ */

export type FacetKey =
  | 'contentType'
  | 'category'
  | 'subcategory'
  | 'occasion'
  | 'season'
  | 'style'
  | 'audience'
  | 'author'

export type Facet = { key: FacetKey; label: string; values: string[] }

const facetSelectors: Record<FacetKey, (d: SearchDoc) => string[]> = {
  contentType: (d) => [d.contentType],
  category: (d) => [d.category],
  subcategory: (d) => (d.subcategory ? [d.subcategory] : []),
  occasion: (d) => d.occasions,
  season: (d) => d.seasons,
  style: (d) => d.styles,
  audience: (d) => d.audiences,
  author: (d) => [d.author.name],
}

const facetLabels: Record<FacetKey, string> = {
  contentType: 'Content Type',
  category: 'Category',
  subcategory: 'Subcategory',
  occasion: 'Occasion',
  season: 'Season',
  style: 'Style',
  audience: 'Audience',
  author: 'Author',
}

/* content type keeps an editorial order; the rest are frequency-ranked */
const contentTypeOrder: SearchContentType[] = [
  'Article',
  'Recipe',
  'DIY',
  'Guide',
  'Ideas',
]

export function buildFacets(docs: SearchDoc[] = searchIndex): Facet[] {
  const keys: FacetKey[] = [
    'contentType',
    'category',
    'subcategory',
    'occasion',
    'season',
    'style',
    'audience',
    'author',
  ]
  return keys
    .map((key) => {
      const counts = new Map<string, number>()
      for (const d of docs) {
        for (const v of facetSelectors[key](d)) {
          if (!v) continue
          counts.set(v, (counts.get(v) ?? 0) + 1)
        }
      }
      let values = [...counts.keys()]
      if (key === 'contentType') {
        values.sort(
          (a, b) =>
            contentTypeOrder.indexOf(a as SearchContentType) -
            contentTypeOrder.indexOf(b as SearchContentType),
        )
      } else {
        values.sort((a, b) => (counts.get(b)! - counts.get(a)!) || a.localeCompare(b))
      }
      return { key, label: facetLabels[key], values }
    })
    .filter((f) => f.values.length > 0)
}

export const allFacets: Facet[] = buildFacets()

/* ------------------------------------------------------------------ */
/* Query + filter + sort                                              */
/* ------------------------------------------------------------------ */

export const sortOptions = [
  'Relevance',
  'Latest',
  'Most Popular',
  'Most Saved',
  "Editor's Picks",
] as const
export type SearchSort = (typeof sortOptions)[number]

export type SearchFilters = Partial<Record<FacetKey, string[]>>

/** Relevance score for a doc against tokenized query terms. */
function relevance(doc: SearchDoc, terms: string[]): number {
  if (terms.length === 0) return 0
  const title = doc.title.toLowerCase()
  let score = 0
  for (const t of terms) {
    if (!doc._hay.includes(t)) return -1 // every term must match somewhere
    if (title.includes(t)) score += title.startsWith(t) ? 6 : 4
    if (doc.category.toLowerCase().includes(t)) score += 3
    if (doc.occasions.some((o) => o.toLowerCase().includes(t))) score += 3
    if (doc.tags.some((tag) => tag.toLowerCase().includes(t))) score += 2
    score += 1 // matched in haystack
  }
  if (doc.featured) score += 1
  return score
}

function matchesFilters(doc: SearchDoc, filters: SearchFilters): boolean {
  for (const key of Object.keys(filters) as FacetKey[]) {
    const wanted = filters[key]
    if (!wanted || wanted.length === 0) continue
    const have = facetSelectors[key](doc)
    // multi-select within a facet is OR; across facets is AND
    if (!wanted.some((w) => have.includes(w))) return false
  }
  return true
}

export type SearchResult = {
  docs: SearchDoc[]
  total: number
  facets: Facet[]
}

export function searchContent(
  query: string,
  filters: SearchFilters = {},
  sort: SearchSort = 'Relevance',
): SearchResult {
  const terms = query.toLowerCase().split(/\s+/).map((t) => t.trim()).filter(Boolean)

  let docs = searchIndex.filter((d) => d.status === 'published')

  // text query
  const scored = new Map<string, number>()
  if (terms.length > 0) {
    docs = docs.filter((d) => {
      const s = relevance(d, terms)
      if (s < 0) return false
      scored.set(d.id, s)
      return true
    })
  }

  // facet filters
  docs = docs.filter((d) => matchesFilters(d, filters))

  // facets are computed from the query+filter narrowed set so counts stay honest
  const facets = buildFacets(docs)

  // sort
  const byDate = (a: SearchDoc, b: SearchDoc) => b._ts - a._ts
  const arr = [...docs]
  switch (sort) {
    case 'Latest':
      arr.sort(byDate)
      break
    case 'Most Popular':
      arr.sort((a, b) => b.popularScore - a.popularScore || byDate(a, b))
      break
    case 'Most Saved':
      arr.sort((a, b) => b.savedCount - a.savedCount || byDate(a, b))
      break
    case "Editor's Picks":
      arr.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || b.popularScore - a.popularScore,
      )
      break
    case 'Relevance':
    default:
      if (terms.length > 0) {
        arr.sort((a, b) => (scored.get(b.id)! - scored.get(a.id)!) || byDate(a, b))
      } else {
        // no query → relevance falls back to a curated blend
        arr.sort(
          (a, b) => Number(b.featured) - Number(a.featured) || b.popularScore - a.popularScore,
        )
      }
      break
  }

  return { docs: arr, total: arr.length, facets }
}

/* ------------------------------------------------------------------ */
/* Suggestions, popular & trending searches                          */
/* ------------------------------------------------------------------ */

/* A suggestion vocabulary drawn from real taxonomy terms across the corpus,
   ranked by how often they appear so the most useful completions surface. */
const suggestionVocab: { term: string; weight: number }[] = (() => {
  const counts = new Map<string, number>()
  for (const d of searchIndex) {
    for (const term of [
      d.category,
      d.subcategory,
      ...d.occasions,
      ...d.seasons,
      ...d.tags,
      ...d.styles,
    ]) {
      if (!term) continue
      counts.set(term, (counts.get(term) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([term, weight]) => ({ term, weight }))
    .sort((a, b) => b.weight - a.weight)
})()

export function suggest(query: string, limit = 6): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const starts: string[] = []
  const contains: string[] = []
  for (const { term } of suggestionVocab) {
    const t = term.toLowerCase()
    if (t === q) continue
    if (t.startsWith(q)) starts.push(term)
    else if (t.includes(q)) contains.push(term)
    if (starts.length >= limit) break
  }
  return [...starts, ...contains].slice(0, limit)
}

/* Popular / trending searches are editorially configurable (they'd come
   from analytics in production) — not derived from any user's history. */
export const popularSearches = [
  'Christmas',
  'Fall Recipes',
  'Wedding Tables',
  'Nail Ideas',
  'DIY Ornaments',
  'Party Games',
]

export const trendingSearches = [
  'Christmas Cookies',
  'Dusty Blue Weddings',
  'Halloween Punch',
  'Macrame',
  'Self Care',
]

/* Browse fallbacks for the empty state */
export const popularCategoriesForEmpty = allFacets.find((f) => f.key === 'category')?.values.slice(0, 8) ?? []
export const popularOccasionsForEmpty = allFacets.find((f) => f.key === 'occasion')?.values.slice(0, 8) ?? []

export function trendingDocs(limit = 6): SearchDoc[] {
  return [...searchIndex]
    .filter((d) => d.status === 'published')
    .sort((a, b) => b.popularScore - a.popularScore)
    .slice(0, limit)
}
