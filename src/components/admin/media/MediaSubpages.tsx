import { useState } from 'react'
import { Button } from '../../ui/primitives'
import { AdminPageHeader, Panel, StatCard, Badge, PillButton, ConceptNote, EmptyState } from '../ui'
import { Pinterest, Star, Plus } from '../../ui/icons'
import { MediaPicker } from './MediaPicker'
import {
  mediaLibrary, queryMedia, duplicateGroups, galleries, mediaCollections,
  settingsSections, getTemplate, PIN_SPEC,
  type MediaItem, type Gallery,
} from '../../../lib/admin/media'

/* =========================================================================
   Media sub-pages: Unused media + duplicates, Pinterest media management,
   Galleries editor, and Storage settings. Each is reachable under /admin/media/*.
   ========================================================================= */

/* ---- /admin/media/unused ---- */
export function UnusedMedia() {
  const unused = queryMedia({ filter: 'unused' })
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Media', 'Unused']}
        title="Unused Media"
        description="Files not currently referenced by any content. Review before removing — nothing is deleted automatically."
        actions={<a href="/admin/media"><Button size="md" variant="outline">← Back to library</Button></a>}
      />

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Unused files" value={unused.length} />
        <StatCard label="Reclaimable" value={`${Math.round(unused.reduce((s, m) => s + m.sizeKB, 0) / 1024)} MB`} tone="muted" />
        <StatCard label="Possible duplicates" value={duplicateGroups.length} tone="muted" />
        <StatCard label="Last scan" value="Today" tone="muted" />
      </section>

      {unused.length === 0 ? (
        <EmptyState title="No unused media" hint="Every file is referenced by content." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-[0.83rem]">
            <thead className="bg-secondary/60 text-[0.66rem] uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Image</th>
                <th className="px-4 py-3 font-semibold">Uploaded</th>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold">Dimensions</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {unused.map((m) => (
                <tr key={m.id} className="border-t border-border bg-card hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={m.url} alt="" loading="lazy" className="h-10 w-10 rounded object-cover" />
                      <span className="font-medium text-foreground">{m.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.uploaded}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.sizeKB} KB</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.width}×{m.height}</td>
                  <td className="px-4 py-3"><Badge label="Unused" tone="bg-muted text-muted-foreground" /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <PillButton>Review</PillButton>
                      <PillButton>Keep</PillButton>
                      <PillButton tone="danger">Delete</PillButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Duplicate detection */}
      <div className="mt-8">
        <h2 className="mb-3 font-serif text-[1.3rem] font-semibold text-foreground">Possible Duplicates</h2>
        {duplicateGroups.map((g) => (
          <Panel key={g.id} className="mb-4" title={g.reason} actions={<Badge label="Needs review" tone="bg-warning/15 text-warning" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              {g.items.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                  <img src={m.url} alt="" loading="lazy" className="h-16 w-16 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.82rem] font-medium text-foreground">{m.filename}</p>
                    <p className="text-[0.72rem] text-muted-foreground">{m.width}×{m.height} · {m.sizeKB} KB · {m.uploaded}</p>
                    <div className="mt-1.5 flex gap-1.5">
                      <PillButton>Keep</PillButton>
                      <PillButton tone="danger">Delete duplicate</PillButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3"><PillButton>Compare</PillButton></div>
          </Panel>
        ))}
        <ConceptNote>
          Placeholder duplicate groups for UI demonstration. Real perceptual-hash duplicate detection
          connects during backend implementation — no two images are claimed identical here.
        </ConceptNote>
      </div>
    </div>
  )
}

/* ---- /admin/media/pinterest ---- */
export function PinterestMedia() {
  const pins = mediaLibrary.filter((m) => m.role === 'pinterest' || m.pinterest)
  const [picker, setPicker] = useState(false)
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Media', 'Pinterest']}
        title="Pinterest Assets"
        description={`Vertical ${PIN_SPEC.label} (2:3) pins, kept distinct from editorial images and synced with the Pinterest system.`}
        actions={<Button size="md" onClick={() => setPicker(true)}><Plus width={15} height={15} /> Create Pinterest asset</Button>}
      />

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Pinterest assets" value={pins.length} />
        <StatCard label="Primary pins" value={pins.filter((p) => p.pinterest?.isPrimary).length} />
        <StatCard label="Alternate pins" value={pins.filter((p) => p.pinterest && !p.pinterest.isPrimary).length} tone="muted" />
        <StatCard label="Spec" value={PIN_SPEC.label} tone="muted" />
      </section>

      {pins.length === 0 ? (
        <EmptyState title="No Pinterest assets yet" hint="Create a vertical pin to get started." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {pins.map((m) => {
            const meta = m.pinterest
            return (
              <div key={m.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative aspect-[2/3] bg-secondary">
                  <img src={m.url} alt={m.alt} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-pinterest px-1.5 py-0.5 text-[0.58rem] font-bold text-white">
                    <Pinterest width={10} height={10} /> {PIN_SPEC.label}
                  </span>
                  {meta?.isPrimary && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-foreground px-1.5 py-0.5 text-[0.58rem] font-bold text-background">
                      <Star width={10} height={10} /> Primary
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-[0.8rem] font-semibold text-foreground">{meta?.pinTitle ?? m.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[0.72rem] text-muted-foreground">{meta?.pinDescription ?? '—'}</p>
                  {meta && (
                    <p className="mt-1.5 text-[0.68rem] text-muted-foreground">
                      {getTemplate(meta.template).label} · <span className="font-mono">{meta.destination}</span>
                    </p>
                  )}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <PillButton>Edit</PillButton>
                    <PillButton>Duplicate</PillButton>
                    {!meta?.isPrimary && <PillButton>Set primary</PillButton>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6">
        <ConceptNote>Connected to the Phase 9 Pinterest system — templates, alternate pins, primary selection and destinations stay in sync with each content item.</ConceptNote>
      </div>

      <MediaPicker open={picker} onClose={() => setPicker(false)} onInsert={() => setPicker(false)} title="Create Pinterest asset" />
    </div>
  )
}

/* ---- /admin/media/galleries ---- */
export function Galleries() {
  const [active, setActive] = useState<Gallery | null>(null)
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Media', 'Galleries']}
        title="Galleries"
        description="Reusable image galleries for articles, recipes, DIY, guides and product guides."
        actions={<Button size="md"><Plus width={15} height={15} /> New gallery</Button>}
      />

      {active ? (
        <GalleryEditor gallery={active} onBack={() => setActive(null)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleries.map((g) => (
            <button key={g.id} type="button" onClick={() => setActive(g)} className="overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-foreground/30">
              <div className="aspect-[16/9] bg-secondary">
                <img src={g.cover} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-[0.9rem] font-semibold text-foreground">{g.name}</p>
                <p className="text-[0.74rem] text-muted-foreground">{g.imageIds.length} images · {g.usedIn}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function GalleryEditor({ gallery, onBack }: { gallery: Gallery; onBack: () => void }) {
  const [ids, setIds] = useState<string[]>(gallery.imageIds)
  const [cover, setCover] = useState(gallery.imageIds[0])
  const [picker, setPicker] = useState(false)
  const items = ids.map((id) => mediaLibrary.find((m) => m.id === id)).filter(Boolean) as MediaItem[]

  function move(id: string, dir: -1 | 1) {
    setIds((prev) => {
      const i = prev.indexOf(id)
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = prev.slice()
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <button type="button" onClick={onBack} className="text-[0.78rem] font-semibold text-primary hover:text-foreground">← All galleries</button>
          <h2 className="mt-1 font-serif text-[1.4rem] font-semibold text-foreground">{gallery.name}</h2>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setPicker(true)}>Add images</Button>
          <Button size="sm">Preview gallery</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <div key={m.id} className={`overflow-hidden rounded-lg border bg-card ${cover === m.id ? 'border-primary ring-1 ring-primary/30' : 'border-border'}`}>
            <div className="relative aspect-square bg-secondary">
              <img src={m.url} alt={m.alt} loading="lazy" className="h-full w-full object-cover" />
              {cover === m.id && <span className="absolute left-1.5 top-1.5 rounded-full bg-foreground px-1.5 py-0.5 text-[0.56rem] font-bold text-background">Cover</span>}
            </div>
            <div className="space-y-1.5 p-2">
              <input defaultValue={m.caption} placeholder="Caption…" className="w-full rounded border border-border bg-background px-2 py-1 text-[0.7rem] outline-none focus:border-foreground/40" />
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(m.id, -1)} className="rounded border border-border px-1.5 text-[0.72rem] text-muted-foreground hover:bg-secondary" aria-label="Move left">←</button>
                  <button type="button" onClick={() => move(m.id, 1)} className="rounded border border-border px-1.5 text-[0.72rem] text-muted-foreground hover:bg-secondary" aria-label="Move right">→</button>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setCover(m.id)} className="rounded border border-border px-1.5 py-0.5 text-[0.66rem] font-semibold text-muted-foreground hover:bg-secondary">Cover</button>
                  <button type="button" onClick={() => setIds((p) => p.filter((x) => x !== m.id))} className="rounded border border-error/30 px-1.5 py-0.5 text-[0.66rem] font-semibold text-error hover:bg-error/10">Remove</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setPicker(true)} className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground">
          <Plus width={22} height={22} />
          <span className="mt-1 text-[0.72rem] font-semibold">Add image</span>
        </button>
      </div>

      <MediaPicker
        open={picker}
        onClose={() => setPicker(false)}
        multiple
        title="Add to gallery"
        onInsert={(chosen) => setIds((prev) => [...prev, ...chosen.map((c) => c.id).filter((id) => !prev.includes(id))])}
      />
    </div>
  )
}

/* ---- /admin/media/settings ---- */
export function MediaSettings() {
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Media', 'Settings']}
        title="Media Storage Settings"
        description="Future configuration for storage, processing, delivery and Pinterest assets. No provider is assumed."
        actions={<a href="/admin/media"><Button size="md" variant="outline">← Back to library</Button></a>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((s) => (
          <Panel key={s.id} title={s.title}>
            <p className="mb-3 text-[0.78rem] text-muted-foreground">{s.note}</p>
            <ul className="space-y-2">
              {s.fields.map((f) => (
                <li key={f} className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2">
                  <span className="text-[0.82rem] text-foreground">{f}</span>
                  <Badge label="Backend phase" tone="bg-secondary text-secondary-foreground" />
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>

      <div className="mt-6">
        <ConceptNote>
          Storage options — Local, Object Storage or CDN — are represented as UI only. The provider,
          credentials and processing pipeline are configured during backend implementation.
        </ConceptNote>
      </div>
    </div>
  )
}

/* ---- Collections strip (reused within library home if desired) ---- */
export function CollectionsGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {mediaCollections.map((c) => (
        <div key={c.id} className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="aspect-square bg-secondary">
            <img src={c.cover} alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="p-2">
            <p className="truncate text-[0.76rem] font-medium text-foreground">{c.name}</p>
            <p className="text-[0.66rem] text-muted-foreground">{c.count} items</p>
          </div>
        </div>
      ))}
    </div>
  )
}
