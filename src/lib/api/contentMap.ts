import type { ApiContentItem } from './endpoints'
import type { ContentItem, ContentTypeId, ContentStatus } from '../admin/cms'

/* =========================================================================
   Mapping between the backend content row (ApiContentItem) and the admin's
   rich ContentItem view model. Keeps every consumer (table, editor, public
   pages) speaking the existing UI types while the data comes from PostgreSQL.
   ========================================================================= */

const fmtDate = (iso: string | null | undefined): string | null => {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Lightweight SEO signal derived from the fields we have (not a live scan). */
function deriveSeoHealth(a: ApiContentItem): ContentItem['seoHealth'] {
  const hasExcerpt = (a.excerpt ?? '').trim().length > 0
  const hasImage = (a.featuredImage ?? '').trim().length > 0
  if (hasExcerpt && hasImage) return 'good'
  if (hasExcerpt || hasImage) return 'warning'
  return 'missing'
}

export function apiToContentItem(a: ApiContentItem): ContentItem {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    type: a.type as ContentTypeId,
    status: a.status as ContentStatus,
    author: a.authorName ?? '',
    featuredImage: a.featuredImage ?? '',
    category: a.category ?? '',
    subcategories: a.subcategories ?? [],
    occasions: a.occasions ?? [],
    seasons: a.seasons ?? [],
    tags: a.tags ?? [],
    styles: a.styles ?? [],
    colors: a.colors ?? [],
    audiences: a.audiences ?? [],
    publishedDate: fmtDate(a.publishedAt),
    updatedDate: fmtDate(a.updatedAt) ?? fmtDate(a.publishedAt) ?? '',
    views: a.views ?? null,
    seoHealth: deriveSeoHealth(a),
    pinCount: 0,
    featured: a.featured ?? false,
  }
}

/** Build the request body for POST/PUT /api/content from a ContentItem draft. */
export function contentItemToApi(
  item: Partial<ContentItem> & { type: ContentTypeId; title: string; slug: string },
  detail: Record<string, unknown> = {},
): Partial<ApiContentItem> {
  return {
    type: item.type,
    title: item.title,
    slug: item.slug,
    excerpt: (item as { excerpt?: string }).excerpt ?? '',
    status: item.status ?? 'draft',
    authorName: item.author ?? '',
    featuredImage: item.featuredImage ?? '',
    category: item.category ?? '',
    subcategories: item.subcategories ?? [],
    occasions: item.occasions ?? [],
    seasons: item.seasons ?? [],
    tags: item.tags ?? [],
    styles: item.styles ?? [],
    colors: item.colors ?? [],
    audiences: item.audiences ?? [],
    featured: item.featured ?? false,
    detail,
  }
}
