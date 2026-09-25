import { useMemo, useState } from 'react'
import { Button } from '../../ui/primitives'
import { AdminPageHeader, Badge, Select, ConfirmBar, PillButton, EmptyState } from '../ui'
import {
  contentItems as fallbackContentItems,
  contentTypes,
  contentType,
  statusMeta,
  statusOrder,
  adminAuthors,
  queryContent,
  type ContentItem,
  type ContentTypeId,
  type ContentStatus,
} from '../../../lib/admin/cms'
import { useApiData } from '../../../lib/api/useApiData'
import { apiConfigured } from '../../../lib/api/client'
import { contentApi } from '../../../lib/api/endpoints'
import { apiToContentItem } from '../../../lib/api/contentMap'

/* Universal content table. The same component powers /admin/content and every
   filtered view (Articles, Recipes, Drafts, Scheduled, Trash, …) via props. */

const seoTone: Record<ContentItem['seoHealth'], { label: string; tone: string }> = {
  good: { label: 'Good', tone: 'bg-success/15 text-success' },
  warning: { label: 'Needs work', tone: 'bg-warning/15 text-warning' },
  missing: { label: 'Missing', tone: 'bg-error/12 text-error' },
}

const PAGE_SIZE = 10

export function ContentTable({
  title,
  breadcrumb,
  lockType,
  lockStatus,
}: {
  title: string
  breadcrumb: string[]
  lockType?: ContentTypeId
  lockStatus?: ContentStatus
}) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<ContentTypeId | 'all'>(lockType ?? 'all')
  const [status, setStatus] = useState<ContentStatus | 'all'>(lockStatus ?? 'all')
  const [author, setAuthor] = useState<string>('all')
  const [sort, setSort] = useState<'updated' | 'published' | 'title' | 'type'>('updated')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  // Live content from the backend when configured; the bundled demo slice is
  // the fallback so the table is never empty in prototype mode.
  const { data: contentItems, reload } = useApiData<ContentItem[]>(
    () => contentApi.listAll().then((items) => items.map(apiToContentItem)),
    fallbackContentItems,
  )

  const results = useMemo(
    () =>
      queryContent(contentItems, {
        search,
        type: lockType ?? type,
        status: lockStatus ?? status,
        author,
        sort,
      }),
    [search, type, status, author, sort, lockType, lockStatus, contentItems],
  )

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  const trashSelected = async () => {
    const ids = [...selected]
    if (apiConfigured) {
      await Promise.all(ids.map((id) => contentApi.remove(id).catch(() => null)))
      reload()
    }
    setSelected(new Set())
  }
  const allShownSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))
  const toggleAll = () =>
    setSelected((s) => {
      const next = new Set(s)
      if (allShownSelected) rows.forEach((r) => next.delete(r.id))
      else rows.forEach((r) => next.add(r.id))
      return next
    })

  return (
    <div>
      <AdminPageHeader
        breadcrumb={breadcrumb}
        title={title}
        description={`${results.length.toLocaleString()} ${results.length === 1 ? 'item' : 'items'}`}
        actions={
          <a href="/admin/content/new/article">
            <Button size="md">+ New content</Button>
          </a>
        }
      />

      {/* Filters + search */}
      <div className="mb-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search title, slug, author…"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40"
        />
        {!lockType && (
          <Select
            value={type}
            onChange={(v) => {
              setType(v as ContentTypeId | 'all')
              setPage(1)
            }}
            options={[{ value: 'all', label: 'All types' }, ...contentTypes.map((t) => ({ value: t.id, label: t.label }))]}
          />
        )}
        {!lockStatus && (
          <Select
            value={status}
            onChange={(v) => {
              setStatus(v as ContentStatus | 'all')
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All statuses' },
              ...statusOrder.map((s) => ({ value: s, label: statusMeta[s].label })),
            ]}
          />
        )}
        <Select
          value={author}
          onChange={(v) => {
            setAuthor(v)
            setPage(1)
          }}
          options={[{ value: 'all', label: 'All authors' }, ...adminAuthors.map((a) => ({ value: a.name, label: a.name }))]}
        />
        <Select
          value={sort}
          onChange={(v) => setSort(v as typeof sort)}
          options={[
            { value: 'updated', label: 'Sort: Updated' },
            { value: 'published', label: 'Sort: Published' },
            { value: 'title', label: 'Sort: Title' },
            { value: 'type', label: 'Sort: Type' },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No content found" hint="Try adjusting your search or filters." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[900px] text-left text-[0.84rem]">
            <thead className="bg-secondary/60 text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allShownSelected} onChange={toggleAll} aria-label="Select all" />
                </th>
                <th className="px-4 py-3 font-semibold">Content</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Author</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 font-semibold">SEO</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className={`border-t border-border transition-colors hover:bg-secondary/40 ${
                    selected.has(c.id) ? 'bg-seasonal-soft/40' : 'bg-card'
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggle(c.id)}
                      aria-label={`Select ${c.title}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={c.featuredImage} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />
                      <div className="min-w-0">
                        <a
                          href={`/admin/content/${c.id}`}
                          className="block max-w-[260px] truncate font-semibold text-foreground hover:text-primary"
                        >
                          {c.title}
                        </a>
                        <span className="font-mono text-[0.7rem] text-muted-foreground">/{c.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{contentType(c.type).label}</td>
                  <td className="px-4 py-3">
                    <Badge label={statusMeta[c.status].label} tone={statusMeta[c.status].tone} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.author}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.updatedDate}</td>
                  <td className="px-4 py-3">
                    <Badge label={seoTone[c.seoHealth].label} tone={seoTone[c.seoHealth].tone} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/admin/content/${c.id}`}
                        className="rounded-md border border-border px-2 py-1 text-[0.74rem] font-semibold text-foreground hover:bg-secondary"
                      >
                        Edit
                      </a>
                      <a
                        href={`${contentType(c.type).routePrefix}/${c.slug}`}
                        className="rounded-md border border-border px-2 py-1 text-[0.74rem] font-semibold text-muted-foreground hover:bg-secondary"
                      >
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-[0.82rem]">
          <span className="text-muted-foreground">
            Page {current} of {pageCount}
          </span>
          <div className="flex gap-2">
            <PillButton onClick={() => setPage(Math.max(1, current - 1))}>Previous</PillButton>
            <PillButton onClick={() => setPage(Math.min(pageCount, current + 1))}>Next</PillButton>
          </div>
        </div>
      )}

      {/* Bulk actions */}
      <ConfirmBar count={selected.size} onClear={() => setSelected(new Set())}>
        <PillButton tone="invert">Publish</PillButton>
        <PillButton tone="invert">Move to draft</PillButton>
        <PillButton tone="invert">Duplicate</PillButton>
        <PillButton tone="invert" onClick={() => void trashSelected()}>
          Move to trash
        </PillButton>
      </ConfirmBar>
    </div>
  )
}
