import { useState } from 'react'
import { Button } from '../../ui/primitives'
import { Search, Close, Check } from '../../ui/icons'
import { MediaUpload } from './MediaUpload'
import {
  queryMedia, isPinterestFormat, mediaFilters,
  type MediaItem, type MediaFilter,
} from '../../../lib/admin/media'

/* =========================================================================
   Reusable media picker — the single "Insert Image" / "Select image" modal
   used across the Article, Recipe, DIY, Category and Homepage editors, plus
   the featured-image and Pinterest selectors. Supports search, filter,
   select (single or multi), upload and insert. One library, everywhere.
   ========================================================================= */

export function MediaPicker({
  open,
  onClose,
  onInsert,
  multiple = false,
  title = 'Insert image',
}: {
  open: boolean
  onClose: () => void
  onInsert: (items: MediaItem[]) => void
  multiple?: boolean
  title?: string
}) {
  const [tab, setTab] = useState<'library' | 'upload'>('library')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<MediaFilter>('all')
  const [picked, setPicked] = useState<Set<string>>(new Set())

  if (!open) return null

  const results = queryMedia({ search, filter, sort: 'newest' })

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(multiple ? prev : [])
      if (prev.has(id) && multiple) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function insert() {
    const chosen = results.filter((m) => picked.has(m.id))
    onInsert(chosen)
    setPicked(new Set())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl sm:h-[80vh] sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <h2 className="font-serif text-[1.25rem] font-semibold text-foreground">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Close">
            <Close width={18} height={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border px-5">
          {(['library', 'upload'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-3.5 py-2.5 text-[0.83rem] font-medium capitalize transition-colors ${
                tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'library' ? 'Media library' : 'Upload new'}
            </button>
          ))}
        </div>

        {tab === 'library' ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
              <div className="relative min-w-[180px] flex-1">
                <Search width={15} height={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search media…"
                  className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-[0.83rem] outline-none placeholder:text-muted-foreground focus:border-foreground/40"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {mediaFilters.slice(0, 6).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`rounded-md border px-2.5 py-1.5 text-[0.74rem] font-semibold transition-colors ${
                      filter === f.id ? 'border-foreground/40 bg-secondary text-foreground' : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {results.length === 0 ? (
                <p className="py-16 text-center text-[0.85rem] text-muted-foreground">No media matches your search.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
                  {results.map((m) => {
                    const on = picked.has(m.id)
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggle(m.id)}
                        className={`group relative overflow-hidden rounded-lg border text-left transition-colors ${on ? 'border-primary ring-2 ring-primary/40' : 'border-border hover:border-foreground/30'}`}
                        aria-pressed={on}
                      >
                        <span className="block aspect-square bg-secondary">
                          <img src={m.url} alt={m.alt} loading="lazy" className="h-full w-full object-cover" />
                        </span>
                        {on && (
                          <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                            <Check width={13} height={13} />
                          </span>
                        )}
                        {isPinterestFormat(m) && (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-pinterest px-1.5 py-0.5 text-[0.56rem] font-bold text-white">Pin</span>
                        )}
                        <span className="block truncate px-2 py-1 text-[0.68rem] text-muted-foreground">{m.filename}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
              <p className="text-[0.78rem] text-muted-foreground">
                {picked.size > 0 ? `${picked.size} selected` : `${results.length} items`}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
                <Button size="sm" disabled={picked.size === 0} onClick={insert}>
                  {title}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <MediaUpload onClose={() => setTab('library')} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ---- Featured image selector (reusable across editors) ---- */
export function FeaturedImageSelector({ label = 'Featured image' }: { label?: string }) {
  const [open, setOpen] = useState(false)
  const [image, setImage] = useState<MediaItem | null>(null)

  const previews: { id: string; label: string; ratio: string }[] = [
    { id: 'desktop', label: 'Desktop', ratio: 'aspect-[16/9]' },
    { id: 'mobile', label: 'Mobile', ratio: 'aspect-[3/4]' },
    { id: 'social', label: 'Social', ratio: 'aspect-[1200/630]' },
    { id: 'pinterest', label: 'Pinterest', ratio: 'aspect-[2/3]' },
  ]

  return (
    <div>
      <p className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      {image ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {previews.map((p) => (
              <div key={p.id}>
                <div className={`overflow-hidden rounded-md border border-border bg-secondary ${p.ratio}`}>
                  <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
                </div>
                <p className="mt-1 text-center text-[0.66rem] text-muted-foreground">{p.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Replace</Button>
            <Button size="sm" variant="outline" onClick={() => setImage(null)}>Remove</Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 px-4 py-8 text-center hover:border-foreground/30"
        >
          <span className="text-[0.85rem] font-semibold text-foreground">Select or upload a featured image</span>
          <span className="mt-1 text-[0.74rem] text-muted-foreground">Previews for desktop, mobile, social &amp; Pinterest</span>
        </button>
      )}
      <MediaPicker open={open} onClose={() => setOpen(false)} onInsert={(items) => items[0] && setImage(items[0])} title="Set featured image" />
    </div>
  )
}
