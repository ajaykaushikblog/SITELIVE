import { useState } from 'react'
import { ChevronDown, Copy, Trash } from '../../../ui/icons'
import { MediaPicker } from '../../media/MediaPicker'
import { PillButton } from '../../ui'
import { sampleAffiliateProducts, affiliateDisclosure } from '../../../../lib/ads'
import {
  type Duration,
  type Tip,
  type GalleryImage,
  type AffiliateProductRef,
  newTip,
  newGalleryImage,
  newAffiliate,
} from '../../../../lib/admin/specialized'

export const ctrl = 'w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40'
export const label = 'mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground'

/* Collapsible specialized section */
export function SpecSection({ title, hint, children, defaultOpen, badge }: { title: string; hint?: string; children: React.ReactNode; defaultOpen?: boolean; badge?: string }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 px-4 py-3 text-left" aria-expanded={open}>
        <span className="font-serif text-[1.05rem] font-semibold text-foreground">{title}</span>
        {badge && <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.66rem] font-semibold text-secondary-foreground">{badge}</span>}
        <ChevronDown width={16} height={16} className={`ml-auto text-muted-foreground transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-border px-4 py-4">
          {hint && <p className="mb-3 text-[0.78rem] text-muted-foreground">{hint}</p>}
          {children}
        </div>
      )}
    </div>
  )
}

/* Generic reorderable row list: Move Up/Down (a11y), Duplicate, Delete, Add.
   Drag is offered as an enhancement, never the only way to reorder. */
export function RowList<T extends { id: string }>({
  items, onChange, renderRow, addLabel, makeItem, allowDuplicate = true, minRows = 0,
}: {
  items: T[]
  onChange: (next: T[]) => void
  renderRow: (item: T, patch: (p: Partial<T>) => void, index: number) => React.ReactNode
  addLabel: string
  makeItem: () => T
  allowDuplicate?: boolean
  minRows?: number
}) {
  const [dragId, setDragId] = useState<string | null>(null)
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const patchAt = (id: string, p: Partial<T>) => onChange(items.map((it) => (it.id === id ? { ...it, ...p } : it)))
  const dup = (i: number) => onChange([...items.slice(0, i + 1), { ...items[i], id: `${items[i].id}-copy-${Date.now().toString(36)}` }, ...items.slice(i + 1)])
  const del = (i: number) => { if (items.length <= minRows) return; onChange(items.filter((_, j) => j !== i)) }
  const drop = (targetId: string) => {
    if (!dragId || dragId === targetId) return
    const from = items.findIndex((x) => x.id === dragId)
    const to = items.findIndex((x) => x.id === targetId)
    const next = [...items]
    const [m] = next.splice(from, 1)
    next.splice(to, 0, m)
    onChange(next)
    setDragId(null)
  }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.id} onDragOver={(e) => e.preventDefault()} onDrop={() => drop(item.id)}
          className={`rounded-lg border border-border bg-background p-2.5 ${dragId === item.id ? 'opacity-40' : ''}`}>
          <div className="flex items-start gap-2">
            <span draggable onDragStart={() => setDragId(item.id)} onDragEnd={() => setDragId(null)} className="mt-1 cursor-grab select-none text-muted-foreground" aria-hidden title="Drag to reorder">⠿</span>
            <div className="min-w-0 flex-1">{renderRow(item, (p) => patchAt(item.id, p), i)}</div>
            <div className="flex shrink-0 flex-col gap-0.5">
              <MiniBtn label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</MiniBtn>
              <MiniBtn label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓</MiniBtn>
            </div>
            <div className="flex shrink-0 flex-col gap-0.5">
              {allowDuplicate && <MiniBtn label="Duplicate" onClick={() => dup(i)}><Copy width={13} height={13} /></MiniBtn>}
              <MiniBtn label="Delete" danger disabled={items.length <= minRows} onClick={() => del(i)}><Trash width={13} height={13} /></MiniBtn>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, makeItem()])} className="text-[0.8rem] font-semibold text-primary hover:text-foreground">+ {addLabel}</button>
    </div>
  )
}

function MiniBtn({ children, label: lbl, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={lbl} title={lbl}
      className={`grid h-6 w-6 place-items-center rounded text-[0.8rem] disabled:opacity-25 ${danger ? 'text-muted-foreground hover:bg-error/10 hover:text-error' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
      {children}
    </button>
  )
}

/* Hours + minutes input */
export function DurationInput({ value, onChange }: { value: Duration; onChange: (d: Duration) => void }) {
  return (
    <div className="flex items-end gap-2">
      <label className="flex-1">
        <span className="mb-1 block text-[0.68rem] text-muted-foreground">Hours</span>
        <input type="number" min={0} value={value.hours || ''} onChange={(e) => onChange({ ...value, hours: Math.max(0, Number(e.target.value) || 0) })} className={ctrl} />
      </label>
      <label className="flex-1">
        <span className="mb-1 block text-[0.68rem] text-muted-foreground">Minutes</span>
        <input type="number" min={0} max={59} value={value.minutes || ''} onChange={(e) => onChange({ ...value, minutes: Math.max(0, Number(e.target.value) || 0) })} className={ctrl} />
      </label>
    </div>
  )
}

/* Media-backed image field (single) */
export function ImageField({ url, alt = '', onPick, onClear, label: lbl, ratio = 'aspect-video' }: { url: string; alt?: string; onPick: (url: string, alt: string) => void; onClear?: () => void; label?: string; ratio?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      {lbl && <span className={label}>{lbl}</span>}
      {url ? (
        <div className="overflow-hidden rounded-md border border-border"><img src={url} alt={alt} className={`w-full object-cover ${ratio}`} /></div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={`flex w-full items-center justify-center rounded-md border-2 border-dashed border-border bg-secondary/30 py-6 text-[0.78rem] font-semibold text-foreground hover:border-foreground/30 ${ratio}`}>Select image</button>
      )}
      <div className="mt-1.5 flex gap-2">
        <PillButton onClick={() => setOpen(true)}>{url ? 'Replace' : 'Choose'}</PillButton>
        {url && onClear && <PillButton tone="danger" onClick={onClear}>Remove</PillButton>}
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} title={lbl ?? 'Select image'} onInsert={(items) => items[0] && onPick(items[0].url, items[0].alt)} />
    </div>
  )
}

/* ---- Reusable Tips editor ---- */
export function TipsEditor({ tips, onChange }: { tips: Tip[]; onChange: (t: Tip[]) => void }) {
  return (
    <RowList<Tip>
      items={tips} onChange={onChange} makeItem={newTip} addLabel="Add tip"
      renderRow={(tip, patch) => (
        <div className="space-y-2">
          <input value={tip.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Tip title" className={`${ctrl} font-semibold`} />
          <textarea rows={2} value={tip.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Tip description" className={`${ctrl} resize-y`} />
        </div>
      )}
    />
  )
}

/* ---- Reusable Gallery editor (multi-image, captions, alt, primary) ---- */
export function GalleryEditor({ gallery, onChange }: { gallery: GalleryImage[]; onChange: (g: GalleryImage[]) => void }) {
  const [open, setOpen] = useState(false)
  const setPrimary = (id: string) => onChange(gallery.map((g) => ({ ...g, primary: g.id === id })))
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[0.78rem] text-muted-foreground">{gallery.length} image{gallery.length === 1 ? '' : 's'}</p>
        <PillButton onClick={() => setOpen(true)}>+ Add images</PillButton>
      </div>
      {gallery.length > 0 && (
        <RowList<GalleryImage>
          items={gallery} onChange={onChange} makeItem={() => newGalleryImage()} addLabel="Add empty image" allowDuplicate={false}
          renderRow={(g, patch) => (
            <div className="flex gap-3">
              <img src={g.url} alt={g.alt} className="h-16 w-16 shrink-0 rounded-md border border-border object-cover" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <input value={g.alt} onChange={(e) => patch({ alt: e.target.value })} placeholder="Alt text" className={ctrl} />
                <input value={g.caption} onChange={(e) => patch({ caption: e.target.value })} placeholder="Caption" className={ctrl} />
                <label className="flex items-center gap-1.5 text-[0.76rem] text-foreground">
                  <input type="radio" name="gallery-primary" checked={g.primary} onChange={() => setPrimary(g.id)} /> Primary image
                </label>
              </div>
            </div>
          )}
        />
      )}
      <MediaPicker open={open} onClose={() => setOpen(false)} multiple title="Add to gallery"
        onInsert={(items) => onChange([...gallery, ...items.map((m, i) => newGalleryImage(m.url, m.alt, gallery.length === 0 && i === 0))])} />
    </div>
  )
}

/* ---- Reusable Affiliate Products editor (Phase 8 registry, provider-agnostic) ---- */
export function AffiliateProductsEditor({ products, onChange, kindHint }: { products: AffiliateProductRef[]; onChange: (p: AffiliateProductRef[]) => void; kindHint: string }) {
  return (
    <div>
      <p className="mb-2 text-[0.78rem] text-muted-foreground">{kindHint} {affiliateDisclosure}</p>
      <RowList<AffiliateProductRef>
        items={products} onChange={onChange} makeItem={newAffiliate} addLabel="Add product"
        renderRow={(p, patch) => (
          <div className="space-y-2">
            <select defaultValue="" onChange={(e) => {
              const src = sampleAffiliateProducts.find((x) => x.id === e.target.value)
              if (src) patch({ productName: src.name, price: src.price, merchant: src.merchant, affiliateUrl: src.href, imageUrl: src.image })
            }} className={ctrl}>
              <option value="">From product library…</option>
              {sampleAffiliateProducts.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input value={p.productName} onChange={(e) => patch({ productName: e.target.value })} placeholder="Product name" className={ctrl} />
              <input value={p.merchant} onChange={(e) => patch({ merchant: e.target.value })} placeholder="Merchant" className={ctrl} />
              <input value={p.price} onChange={(e) => patch({ price: e.target.value })} placeholder="Price" className={ctrl} />
              <input value={p.cta} onChange={(e) => patch({ cta: e.target.value })} placeholder="CTA" className={ctrl} />
            </div>
            <input value={p.affiliateUrl} onChange={(e) => patch({ affiliateUrl: e.target.value })} placeholder="Affiliate URL (any merchant)" className={ctrl} />
          </div>
        )}
      />
    </div>
  )
}

/* Small labeled select/input helpers */
export function LabeledSelect({ label: lbl, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <label className="block">
      <span className={label}>{lbl}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={ctrl}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}

export function LabeledInput({ label: lbl, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className={label}>{lbl}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={ctrl} />
    </label>
  )
}
