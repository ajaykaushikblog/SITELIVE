import { useMemo, useState } from 'react'
import { Button } from '../../ui/primitives'
import { AdminPageHeader, StatCard, Panel, Badge, PillButton, ConfirmBar, ConceptNote } from '../ui'
import { Grid, List, Search, Upload, Pinterest, ImageIcon } from '../../ui/icons'
import { MediaDetailPanel } from './MediaDetailPanel'
import { MediaUpload } from './MediaUpload'
import {
  queryMedia, isPinterestFormat, altState, altStateMeta, usageCount,
  mediaFilters, mediaSorts, mediaTotals, mediaTags, bulkActions,
  aspectRatio,
  type MediaItem, type MediaFilter, type MediaSort,
} from '../../../lib/admin/media'

/* =========================================================================
   /admin/media — the Media Library home. Dashboard summary, powerful
   search + filter + sort, grid/list views, multi-select bulk actions, an
   upload panel, and a details inspector that becomes a bottom sheet on
   mobile. Built for thousands of files: lazy thumbnails + a "load more"
   pager stand in for real virtualization.
   ========================================================================= */

const PAGE = 12

export function MediaLibrary() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<MediaFilter>('all')
  const [sort, setSort] = useState<MediaSort>('newest')
  const [tag, setTag] = useState<string>('')
  const [limit, setLimit] = useState(PAGE)
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [uploadOpen, setUploadOpen] = useState(false)

  const results = useMemo(
    () => queryMedia({ search, filter, sort, tag: tag || undefined }),
    [search, filter, sort, tag],
  )
  const shown = results.slice(0, limit)

  function toggleCheck(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Media', 'Library']}
        title="Media Library"
        description="The central source for editorial, recipe, DIY, author, product, Pinterest, social and gallery images."
        actions={
          <>
            <a href="/admin/media/unused">
              <Button size="md" variant="outline">Unused ({mediaTotals.unused})</Button>
            </a>
            <Button size="md" onClick={() => setUploadOpen((v) => !v)}>
              <Upload width={16} height={16} /> Upload media
            </Button>
          </>
        }
      />

      {/* Dashboard summary */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Total media" value={mediaTotals.total.toLocaleString()} />
        <StatCard label="Images" value={mediaTotals.images.toLocaleString()} />
        <StatCard label="Videos" value={mediaTotals.videos} />
        <StatCard label="Documents" value={mediaTotals.documents} />
        <StatCard label="Pinterest" value={mediaTotals.pinterest.toLocaleString()} />
        <StatCard label="Unused" value={mediaTotals.unused} tone="muted" />
        <StatCard label="Needs optimization" value={mediaTotals.needsOptimization.toLocaleString()} tone="muted" />
        <StatCard label="Missing alt text" value={mediaTotals.missingAlt} tone="muted" />
      </section>

      {uploadOpen && (
        <div className="mb-6">
          <Panel title="Upload media" actions={<PillButton onClick={() => setUploadOpen(false)}>Close</PillButton>}>
            <MediaUpload onClose={() => setUploadOpen(false)} />
          </Panel>
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setLimit(PAGE) }}
              placeholder="Search filename, title, alt, caption, tags or usage…"
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-[0.85rem] outline-none placeholder:text-muted-foreground focus:border-foreground/40"
            />
          </div>
          <label className="flex items-center gap-2 text-[0.78rem] text-muted-foreground">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as MediaSort)}
              className="rounded-md border border-border bg-background px-2.5 py-2 text-[0.8rem] text-foreground outline-none focus:border-foreground/40"
            >
              {mediaSorts.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <div className="flex gap-1.5">
            <PillButton active={view === 'grid'} onClick={() => setView('grid')}><Grid width={15} height={15} /> Grid</PillButton>
            <PillButton active={view === 'list'} onClick={() => setView('list')}><List width={15} height={15} /> List</PillButton>
          </div>
        </div>

        {/* Filters */}
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {mediaFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => { setFilter(f.id); setLimit(PAGE) }}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[0.76rem] font-semibold transition-colors ${
                filter === f.id ? 'border-foreground/40 bg-foreground text-background' : 'border-border bg-card text-muted-foreground hover:bg-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tag chips */}
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => setTag('')}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[0.72rem] font-medium ${tag === '' ? 'bg-seasonal-soft/70 text-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
          >
            All tags
          </button>
          {mediaTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(tag === t ? '' : t)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[0.72rem] font-medium ${tag === t ? 'bg-seasonal-soft/70 text-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Body: results + detail rail */}
      <div className={`grid gap-6 ${selected ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]' : ''}`}>
        <div>
          <p className="mb-3 text-[0.78rem] text-muted-foreground">
            {results.length} result{results.length === 1 ? '' : 's'}
            {tag && <> · tag <span className="font-semibold text-foreground">{tag}</span></>}
          </p>

          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-secondary/30 px-6 py-16 text-center">
              <ImageIcon width={28} height={28} className="mx-auto mb-2 text-muted-foreground" />
              <p className="font-serif text-[1.15rem] font-semibold text-foreground">No media found</p>
              <p className="mx-auto mt-1 max-w-sm text-[0.82rem] text-muted-foreground">Try a different search, filter, or upload new media.</p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {shown.map((m) => (
                <GridCard key={m.id} item={m} active={selected?.id === m.id} isChecked={checked.has(m.id)} onOpen={() => setSelected(m)} onCheck={() => toggleCheck(m.id)} />
              ))}
            </div>
          ) : (
            <ListTable items={shown} activeId={selected?.id} checked={checked} onOpen={setSelected} onCheck={toggleCheck} />
          )}

          {limit < results.length && (
            <div className="mt-5 text-center">
              <Button size="md" variant="outline" onClick={() => setLimit((l) => l + PAGE)}>
                Load more ({results.length - limit} remaining)
              </Button>
              <p className="mt-2 text-[0.72rem] text-muted-foreground">Paginated + lazy-loaded thumbnails keep large libraries fast.</p>
            </div>
          )}
        </div>

        {/* Desktop detail rail */}
        {selected && (
          <aside className="hidden lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-border bg-card">
              <MediaDetailPanel item={selected} onClose={() => setSelected(null)} />
            </div>
          </aside>
        )}
      </div>

      {/* Mobile detail sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end bg-foreground/40 lg:hidden" role="dialog" aria-modal="true">
          <div className="max-h-[92vh] w-full overflow-hidden rounded-t-2xl bg-card">
            <MediaDetailPanel item={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}

      {/* Bulk actions */}
      <ConfirmBar count={checked.size} onClear={() => setChecked(new Set())}>
        {bulkActions.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`rounded-md px-2.5 py-1.5 text-[0.8rem] font-semibold ${a.danger ? 'bg-error/90 text-white hover:bg-error' : 'bg-background/15 text-background hover:bg-background/25'}`}
          >
            {a.label}
          </button>
        ))}
      </ConfirmBar>

      <div className="mt-8">
        <ConceptNote>
          Front-end prototype. Storage, uploads, image processing, CDN delivery, transformation and
          duplicate detection connect to the chosen provider during backend implementation.
        </ConceptNote>
      </div>
    </div>
  )
}

/* ---- Grid card ---- */
function GridCard({ item, active, isChecked, onOpen, onCheck }: {
  item: MediaItem; active: boolean; isChecked: boolean; onOpen: () => void; onCheck: () => void
}) {
  const alt = altState(item)
  const pin = isPinterestFormat(item)
  return (
    <div className={`group relative overflow-hidden rounded-lg border bg-card transition-colors ${active ? 'border-primary ring-1 ring-primary/30' : 'border-border hover:border-foreground/30'}`}>
      <label className="absolute left-2 top-2 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-border bg-card/90 shadow-sm">
        <input type="checkbox" checked={isChecked} onChange={onCheck} className="h-3.5 w-3.5 accent-[var(--primary)]" aria-label={`Select ${item.filename}`} />
      </label>
      {pin && (
        <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-pinterest px-1.5 py-0.5 text-[0.58rem] font-bold text-white">
          <Pinterest width={10} height={10} /> Pin
        </span>
      )}
      <button type="button" onClick={onOpen} className="block w-full text-left" aria-label={`Open ${item.filename}`}>
        <span className="relative block aspect-square bg-secondary">
          <img src={item.url} alt={item.alt} loading="lazy" className="h-full w-full object-cover" />
        </span>
        <span className="block p-2">
          <span className="flex items-center justify-between gap-1">
            <span className="truncate text-[0.76rem] font-medium text-foreground">{item.filename}</span>
            {alt === 'missing' && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-error" title="Missing alt text" />}
          </span>
          <span className="mt-0.5 block text-[0.68rem] text-muted-foreground">
            {item.format} · {item.width}×{item.height} · {usageCount(item)} use{usageCount(item) === 1 ? '' : 's'}
          </span>
          <span className="block text-[0.66rem] text-muted-foreground/80">{item.uploaded}</span>
        </span>
      </button>
    </div>
  )
}

/* ---- List table ---- */
function ListTable({ items, activeId, checked, onOpen, onCheck }: {
  items: MediaItem[]; activeId?: string; checked: Set<string>; onOpen: (m: MediaItem) => void; onCheck: (id: string) => void
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[820px] text-left text-[0.82rem]">
        <thead className="bg-secondary/60 text-[0.66rem] uppercase tracking-[0.1em] text-muted-foreground">
          <tr>
            <th className="px-3 py-3"></th>
            <th className="px-4 py-3 font-semibold">File</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Dimensions</th>
            <th className="px-4 py-3 font-semibold">Size</th>
            <th className="px-4 py-3 font-semibold">Used in</th>
            <th className="px-4 py-3 font-semibold">Uploaded</th>
            <th className="px-4 py-3 font-semibold">Alt / Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => {
            const ar = aspectRatio(m.width, m.height)
            const alt = altState(m)
            return (
              <tr key={m.id} className={`border-t border-border transition-colors hover:bg-secondary/40 ${activeId === m.id ? 'bg-seasonal-soft/40' : 'bg-card'}`}>
                <td className="px-3 py-3">
                  <input type="checkbox" checked={checked.has(m.id)} onChange={() => onCheck(m.id)} className="h-4 w-4 accent-[var(--primary)]" aria-label={`Select ${m.filename}`} />
                </td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => onOpen(m)} className="flex items-center gap-2.5 text-left">
                    <img src={m.url} alt="" className="h-10 w-10 rounded object-cover" loading="lazy" />
                    <span className="font-medium text-foreground hover:underline">{m.filename}</span>
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{m.format}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.width}×{m.height}<span className="ml-1 text-[0.68rem]">{ar.named ?? ar.exact}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{m.sizeKB} KB</td>
                <td className="px-4 py-3 text-muted-foreground">{usageCount(m)} {usageCount(m) === 1 ? 'place' : 'places'}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.uploaded}</td>
                <td className="px-4 py-3"><Badge label={altStateMeta[alt].label} tone={altStateMeta[alt].tone} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
