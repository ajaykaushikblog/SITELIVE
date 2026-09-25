import { useState } from 'react'
import { MediaPicker } from '../media/MediaPicker'
import { PinterestPreview } from '../../pinterest'
import { Newsletter } from '../../ui/Newsletter'
import { Badge, PillButton, Select } from '../ui'
import { RichTextToolbar } from './RichTextToolbar'
import { calloutStyles, blockDefs, type ContentBlock, type BlockData, type CalloutStyle } from '../../../lib/admin/editor'
import { allSlots, sampleAffiliateProducts, affiliateDisclosure } from '../../../lib/ads'
import { pinTemplateOptions, adminAuthors, contentItems } from '../../../lib/admin/cms'

/* =========================================================================
   BlockBody — the type-specific editing surface for a single block. One
   switch keeps the block palette lean; every block edits inline and shows a
   lightweight preview. Media blocks open the shared Phase 13 MediaPicker;
   monetization blocks read the Phase 8 slot/product registries; the Pinterest
   block reuses the Phase 9 preview.
   ========================================================================= */

const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40'

export function BlockBody({ block, update }: { block: ContentBlock; update: (patch: Partial<BlockData>) => void }) {
  const { type, data } = block
  const [picker, setPicker] = useState(false)

  switch (type) {
    case 'paragraph':
      return (
        <div>
          <RichTextToolbar />
          <textarea rows={3} value={data.text} onChange={(e) => update({ text: e.target.value })} placeholder="Write a paragraph…" className={`${inputCls} mt-2 resize-y leading-relaxed`} />
        </div>
      )

    case 'heading':
    case 'subheading':
      return (
        <input
          value={data.text}
          onChange={(e) => update({ text: e.target.value })}
          placeholder={type === 'heading' ? 'Section heading (H2)' : 'Subheading (H3)'}
          className={`w-full bg-transparent font-serif font-semibold text-foreground outline-none placeholder:text-muted-foreground ${type === 'heading' ? 'text-[1.4rem]' : 'text-[1.15rem]'}`}
        />
      )

    case 'quote':
      return (
        <div className="border-l-2 border-primary/50 pl-3">
          <textarea rows={2} value={data.text} onChange={(e) => update({ text: e.target.value })} placeholder="Quotation…" className={`${inputCls} font-serif italic`} />
          <input value={data.title} onChange={(e) => update({ title: e.target.value })} placeholder="Attribution (optional)" className={`${inputCls} mt-2 text-[0.78rem]`} />
        </div>
      )

    case 'unordered-list':
    case 'ordered-list':
    case 'checklist':
      return <ListEditor block={block} update={update} />

    case 'image':
      return (
        <div>
          {data.imageUrl ? (
            <figure className={`overflow-hidden ${data.align === 'center' ? 'mx-auto' : data.align === 'right' ? 'ml-auto' : ''} ${sizeCls(data.size)}`}>
              <img src={data.imageUrl} alt={data.alt} className="w-full rounded-lg border border-border object-cover" />
              {data.caption && <figcaption className="mt-1 text-center text-[0.74rem] text-muted-foreground">{data.caption}</figcaption>}
            </figure>
          ) : (
            <button type="button" onClick={() => setPicker(true)} className="flex w-full flex-col items-center rounded-lg border-2 border-dashed border-border bg-secondary/30 px-4 py-8 text-center hover:border-foreground/30">
              <span className="text-[0.85rem] font-semibold text-foreground">Select or upload an image</span>
              <span className="mt-1 text-[0.74rem] text-muted-foreground">Opens the Media Library</span>
            </button>
          )}
          {data.imageUrl && (
            <div className="mt-3 space-y-2.5 rounded-lg border border-border bg-secondary/30 p-3">
              <input value={data.alt} onChange={(e) => update({ alt: e.target.value })} placeholder="Alt text (describe the image)" className={inputCls} />
              <input value={data.caption} onChange={(e) => update({ caption: e.target.value })} placeholder="Caption (optional)" className={inputCls} />
              <input value={data.href} onChange={(e) => update({ href: e.target.value })} placeholder="Link URL (optional)" className={inputCls} />
              <div className="flex flex-wrap gap-2">
                <Select label="Alignment" value={data.align ?? 'center'} onChange={(v) => update({ align: v as BlockData['align'] })} options={['left', 'center', 'right']} capitalize />
                <Select label="Size" value={data.size ?? 'large'} onChange={(v) => update({ size: v as BlockData['size'] })} options={['small', 'medium', 'large', 'full']} capitalize />
              </div>
              <label className="flex items-center gap-2 text-[0.8rem] text-foreground">
                <input type="checkbox" checked={!!data.pinnable} onChange={(e) => update({ pinnable: e.target.checked })} /> Show Pinterest “Save” button on hover
              </label>
              <PillButton onClick={() => setPicker(true)}>Replace image</PillButton>
            </div>
          )}
          <MediaPicker open={picker} onClose={() => setPicker(false)} title="Insert image" onInsert={(items) => items[0] && update({ imageUrl: items[0].url, alt: items[0].alt, caption: items[0].caption })} />
        </div>
      )

    case 'gallery':
      return (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Select label="Layout" value={data.galleryLayout ?? 'grid'} onChange={(v) => update({ galleryLayout: v as BlockData['galleryLayout'] })} options={['grid', 'masonry', 'carousel']} capitalize />
            <PillButton onClick={() => setPicker(true)}>+ Add images</PillButton>
          </div>
          {(data.imageUrls ?? []).length === 0 ? (
            <button type="button" onClick={() => setPicker(true)} className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 px-4 py-6 text-[0.82rem] font-semibold text-foreground hover:border-foreground/30">
              Select multiple images
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {data.imageUrls!.map((u, i) => (
                <div key={i} className="relative overflow-hidden rounded-md border border-border">
                  <img src={u} alt="" className="aspect-square w-full object-cover" />
                  <button type="button" onClick={() => update({ imageUrls: data.imageUrls!.filter((_, j) => j !== i) })} className="absolute right-1 top-1 rounded-full bg-foreground/70 px-1.5 text-[0.7rem] text-background">✕</button>
                </div>
              ))}
            </div>
          )}
          <MediaPicker open={picker} onClose={() => setPicker(false)} multiple title="Add to gallery" onInsert={(items) => update({ imageUrls: [...(data.imageUrls ?? []), ...items.map((m) => m.url)] })} />
        </div>
      )

    case 'video':
      return (
        <div className="space-y-2.5">
          <input value={data.videoUrl} onChange={(e) => update({ videoUrl: e.target.value })} placeholder="Video URL (YouTube, Vimeo, MP4…)" className={inputCls} />
          <input value={data.poster} onChange={(e) => update({ poster: e.target.value })} placeholder="Poster image URL" className={inputCls} />
          <input value={data.caption} onChange={(e) => update({ caption: e.target.value })} placeholder="Caption" className={inputCls} />
          <input value={data.a11y} onChange={(e) => update({ a11y: e.target.value })} placeholder="Accessibility description / transcript link" className={inputCls} />
          <p className="text-[0.72rem] text-muted-foreground">Videos never autoplay. Poster shows until the reader hits play.</p>
        </div>
      )

    case 'callout':
      return (
        <div className={`rounded-lg border p-3 ${calloutStyles.find((c) => c.id === data.calloutStyle)?.tone ?? ''}`}>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {calloutStyles.map((c) => (
              <button key={c.id} type="button" onClick={() => update({ calloutStyle: c.id as CalloutStyle, title: c.label })}
                className={`rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold ${data.calloutStyle === c.id ? 'border-foreground/40 bg-card text-foreground' : 'border-border bg-card/60 text-muted-foreground'}`}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          <input value={data.title} onChange={(e) => update({ title: e.target.value })} placeholder="Callout title" className={`${inputCls} mb-2 font-semibold`} />
          <textarea rows={2} value={data.text} onChange={(e) => update({ text: e.target.value })} placeholder="Callout content…" className={inputCls} />
        </div>
      )

    case 'table':
      return <TableEditor block={block} update={update} />

    case 'divider':
      return <div className="py-2"><div className="mx-auto h-px w-24 bg-border" /><p className="mt-1 text-center text-[0.7rem] text-muted-foreground">Section divider</p></div>

    case 'button':
      return (
        <div className="space-y-2.5">
          <input value={data.label} onChange={(e) => update({ label: e.target.value })} placeholder="Button label" className={inputCls} />
          <input value={data.href} onChange={(e) => update({ href: e.target.value })} placeholder="Destination URL" className={inputCls} />
          <Select label="Alignment" value={data.align ?? 'left'} onChange={(v) => update({ align: v as BlockData['align'] })} options={['left', 'center', 'right']} capitalize />
        </div>
      )

    case 'embed':
      return <input value={data.href} onChange={(e) => update({ href: e.target.value })} placeholder="Embed URL (tweet, map, iframe source…)" className={inputCls} />

    case 'product':
    case 'affiliate':
      return <ProductEditor block={block} update={update} affiliate={type === 'affiliate'} openPicker={() => setPicker(true)} picker={picker} closePicker={() => setPicker(false)} />

    case 'advertisement':
      return (
        <div className="space-y-2.5">
          <label className="block">
            <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Ad slot</span>
            <select value={data.adSlotId} onChange={(e) => update({ adSlotId: e.target.value })} className={inputCls}>
              <option value="">Select a configured slot…</option>
              {allSlots().map((s) => <option key={s.id} value={s.id}>{s.name} · {s.format}</option>)}
            </select>
          </label>
          <Select label="Placement" value={data.placement ?? 'in-content'} onChange={(v) => update({ placement: v })} options={['in-content', 'after-intro', 'before-related', 'sidebar']} />
          <div className="grid place-items-center rounded-lg border border-dashed border-border bg-secondary/40 py-6 text-[0.74rem] font-semibold uppercase tracking-widest text-muted-foreground">
            {data.adSlotId ? `Ad slot: ${data.adSlotId}` : 'Advertisement'}
          </div>
          <p className="text-[0.72rem] text-muted-foreground">Editors choose a configured slot (Phase 8) — never raw ad code.</p>
        </div>
      )

    case 'sponsored':
      return (
        <div className="space-y-2.5 rounded-lg border border-warning/30 bg-warning/5 p-3">
          <Badge label="Sponsored" tone="bg-warning/15 text-warning" />
          <div className="grid grid-cols-2 gap-2.5">
            <input value={data.brand} onChange={(e) => update({ brand: e.target.value })} placeholder="Brand" className={inputCls} />
            <input value={data.logoUrl} onChange={(e) => update({ logoUrl: e.target.value })} placeholder="Logo URL" className={inputCls} />
          </div>
          <input value={data.imageUrl} onChange={(e) => update({ imageUrl: e.target.value })} placeholder="Image URL" className={inputCls} />
          <input value={data.title} onChange={(e) => update({ title: e.target.value })} placeholder="Title" className={inputCls} />
          <textarea rows={2} value={data.text} onChange={(e) => update({ text: e.target.value })} placeholder="Description" className={inputCls} />
          <div className="grid grid-cols-2 gap-2.5">
            <input value={data.cta} onChange={(e) => update({ cta: e.target.value })} placeholder="CTA label" className={inputCls} />
            <input value={data.destination} onChange={(e) => update({ destination: e.target.value })} placeholder="Destination URL" className={inputCls} />
          </div>
        </div>
      )

    case 'newsletter':
      return (
        <div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <input value={data.title} onChange={(e) => update({ title: e.target.value })} placeholder="Custom heading (optional)" className={inputCls} />
            <input value={data.cta} onChange={(e) => update({ cta: e.target.value })} placeholder="CTA text (optional)" className={inputCls} />
          </div>
          <input value={data.text} onChange={(e) => update({ text: e.target.value })} placeholder="Custom description (optional)" className={`${inputCls} mt-2.5`} />
          <div className="mt-3 origin-top scale-[0.7] overflow-hidden rounded-lg border border-border">
            <div className="pointer-events-none -mb-24 -mt-12"><Newsletter /></div>
          </div>
          <p className="text-[0.72rem] text-muted-foreground">Reuses the shared Newsletter component — no bespoke design per article.</p>
        </div>
      )

    case 'recipe':
      return (
        <div className="space-y-2.5">
          <input value={data.title} onChange={(e) => update({ title: e.target.value })} placeholder="Recipe title or slug to embed" className={inputCls} />
          <div className="rounded-lg border border-border bg-secondary/30 p-3 text-[0.78rem] text-muted-foreground">🍽 Recipe card renders here using the universal recipe template.</div>
        </div>
      )

    case 'related':
      return <RelatedEditor block={block} update={update} />

    case 'author-box':
      return (
        <div className="space-y-2.5">
          <Select label="Author" value={data.title ?? adminAuthors[0].name} onChange={(v) => update({ title: v })} options={adminAuthors.map((a) => a.name)} />
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3">
            <img src={adminAuthors.find((a) => a.name === (data.title ?? adminAuthors[0].name))?.image} alt="" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <p className="text-[0.85rem] font-semibold text-foreground">{data.title ?? adminAuthors[0].name}</p>
              <p className="text-[0.74rem] text-muted-foreground">Byline & bio pulled from the author profile.</p>
            </div>
          </div>
        </div>
      )

    case 'pinterest':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2.5">
            {data.imageUrl ? (
              <img src={data.imageUrl} alt="" className="aspect-[2/3] w-full rounded-lg border border-border object-cover" />
            ) : (
              <button type="button" onClick={() => setPicker(true)} className="flex aspect-[2/3] w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 text-[0.8rem] font-semibold text-foreground hover:border-foreground/30">Select pin image</button>
            )}
            <input value={data.pinTitle} onChange={(e) => update({ pinTitle: e.target.value })} placeholder="Pinterest title" className={inputCls} />
            <textarea rows={2} value={data.pinDescription} onChange={(e) => update({ pinDescription: e.target.value })} placeholder="Pinterest description" className={inputCls} />
            <input value={data.destination} onChange={(e) => update({ destination: e.target.value })} placeholder="Destination URL" className={inputCls} />
            <Select label="Template" value={data.template ?? 'standard'} onChange={(v) => update({ template: v as BlockData['template'] })} options={pinTemplateOptions.map((p) => ({ value: p.id, label: p.label }))} />
          </div>
          <PinterestPreview
            image={data.imageUrl || 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&q=70'}
            title={data.pinTitle || 'Pin title preview'}
            description={data.pinDescription || 'Pin description preview.'}
            template={data.template ?? 'standard'}
            destination={data.destination || '/'}
          />
          <MediaPicker open={picker} onClose={() => setPicker(false)} title="Select pin image" onInsert={(items) => items[0] && update({ imageUrl: items[0].url })} />
        </div>
      )

    case 'social-share':
      return <div className="rounded-lg border border-border bg-secondary/30 p-3 text-[0.8rem] text-muted-foreground">↗ Social share row (Pinterest · Facebook · X · Copy link) renders here.</div>

    default:
      return <p className="text-[0.8rem] text-muted-foreground">{blockDefs[block.type]?.label} block</p>
  }
}

function sizeCls(size?: BlockData['size']) {
  return size === 'small' ? 'max-w-xs' : size === 'medium' ? 'max-w-md' : size === 'full' ? 'w-full' : 'max-w-2xl'
}

/* ---- List editor (bulleted / numbered / checklist) ---- */
function ListEditor({ block, update }: { block: ContentBlock; update: (p: Partial<BlockData>) => void }) {
  const items = block.data.items ?? ['']
  const checked = block.data.checked ?? items.map(() => false)
  const isCheck = block.type === 'checklist'
  const setItem = (i: number, v: string) => update({ items: items.map((it, j) => (j === i ? v : it)) })
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-5 shrink-0 text-center text-[0.8rem] text-muted-foreground">
            {isCheck ? (
              <input type="checkbox" checked={checked[i] ?? false} onChange={(e) => update({ checked: items.map((_, j) => (j === i ? e.target.checked : (checked[j] ?? false))) })} />
            ) : block.type === 'ordered-list' ? `${i + 1}.` : '•'}
          </span>
          <input value={it} onChange={(e) => setItem(i, e.target.value)} placeholder={`Item ${i + 1}`} className={inputCls} />
          <button type="button" onClick={() => update({ items: items.filter((_, j) => j !== i) })} className="shrink-0 rounded px-1.5 text-muted-foreground hover:text-error" aria-label="Remove item">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => update({ items: [...items, ''], checked: [...checked, false] })} className="text-[0.78rem] font-semibold text-primary hover:text-foreground">+ Add item</button>
    </div>
  )
}

/* ---- Table editor ---- */
function TableEditor({ block, update }: { block: ContentBlock; update: (p: Partial<BlockData>) => void }) {
  const rows = block.data.rows ?? [['', '']]
  const cols = rows[0]?.length ?? 2
  const setCell = (r: number, c: number, v: string) => update({ rows: rows.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? v : cell)) : row)) })
  const addRow = () => update({ rows: [...rows, Array(cols).fill('')] })
  const addCol = () => update({ rows: rows.map((row) => [...row, '']) })
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-[0.8rem] text-foreground">
        <input type="checkbox" checked={!!block.data.headerRow} onChange={(e) => update({ headerRow: e.target.checked })} /> First row is a header
      </label>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[360px] text-left text-[0.82rem]">
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className={block.data.headerRow && r === 0 ? 'bg-secondary/60' : ''}>
                {row.map((cell, c) => (
                  <td key={c} className="border border-border p-0">
                    <input value={cell} onChange={(e) => setCell(r, c, e.target.value)} placeholder={block.data.headerRow && r === 0 ? 'Header' : 'Cell'} className={`w-full bg-transparent px-2.5 py-1.5 outline-none ${block.data.headerRow && r === 0 ? 'font-semibold' : ''}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex gap-2">
        <PillButton onClick={addRow}>+ Row</PillButton>
        <PillButton onClick={addCol}>+ Column</PillButton>
      </div>
      <p className="mt-1.5 text-[0.72rem] text-muted-foreground">Scrolls horizontally within its own container on mobile — never the whole page.</p>
    </div>
  )
}

/* ---- Product / affiliate editor ---- */
function ProductEditor({ block, update, affiliate, openPicker, picker, closePicker }: {
  block: ContentBlock; update: (p: Partial<BlockData>) => void; affiliate: boolean
  openPicker: () => void; picker: boolean; closePicker: () => void
}) {
  const { data } = block
  return (
    <div className="space-y-2.5 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <Badge label={affiliate ? 'Affiliate product' : 'Product card'} tone="bg-secondary text-secondary-foreground" />
        <select
          onChange={(e) => {
            const p = sampleAffiliateProducts.find((x) => x.id === e.target.value)
            if (p) update({ productName: p.name, price: p.price, merchant: p.merchant, affiliateUrl: p.href, imageUrl: p.image, cta: 'Shop now' })
          }}
          className="rounded-md border border-border bg-background px-2 py-1 text-[0.74rem] text-foreground"
          defaultValue=""
        >
          <option value="">From product library…</option>
          {sampleAffiliateProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="flex gap-3">
        {data.imageUrl ? (
          <img src={data.imageUrl} alt="" className="h-20 w-20 shrink-0 rounded-md border border-border object-cover" />
        ) : (
          <button type="button" onClick={openPicker} className="grid h-20 w-20 shrink-0 place-items-center rounded-md border-2 border-dashed border-border text-[0.66rem] text-muted-foreground hover:border-foreground/30">Image</button>
        )}
        <div className="flex-1 space-y-2">
          <input value={data.productName} onChange={(e) => update({ productName: e.target.value })} placeholder="Product name" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input value={data.price} onChange={(e) => update({ price: e.target.value })} placeholder="Price" className={inputCls} />
            <input value={data.merchant} onChange={(e) => update({ merchant: e.target.value })} placeholder="Merchant" className={inputCls} />
          </div>
        </div>
      </div>
      <textarea rows={2} value={data.text} onChange={(e) => update({ text: e.target.value })} placeholder="Short description" className={inputCls} />
      {affiliate && <input value={data.affiliateUrl} onChange={(e) => update({ affiliateUrl: e.target.value })} placeholder="Affiliate URL (any merchant)" className={inputCls} />}
      <div className="grid grid-cols-2 gap-2">
        <input value={data.cta} onChange={(e) => update({ cta: e.target.value })} placeholder="CTA label" className={inputCls} />
        <input value={data.disclosure} onChange={(e) => update({ disclosure: e.target.value })} placeholder="Disclosure" className={inputCls} />
      </div>
      {affiliate && <p className="text-[0.7rem] text-muted-foreground">{affiliateDisclosure}</p>}
      <MediaPicker open={picker} onClose={closePicker} title="Select product image" onInsert={(items) => items[0] && update({ imageUrl: items[0].url })} />
    </div>
  )
}

/* ---- Related content editor (auto / manual) ---- */
function RelatedEditor({ block, update }: { block: ContentBlock; update: (p: Partial<BlockData>) => void }) {
  const mode = block.data.relatedMode ?? 'auto'
  const [q, setQ] = useState('')
  const chosen = new Set(block.data.relatedIds ?? [])
  const results = contentItems.filter((i) => i.title.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
  return (
    <div className="space-y-2.5">
      <div className="flex gap-1.5">
        {(['auto', 'manual'] as const).map((m) => (
          <PillButton key={m} active={mode === m} onClick={() => update({ relatedMode: m })}><span className="capitalize">{m}</span></PillButton>
        ))}
      </div>
      {mode === 'auto' ? (
        <div className="rounded-lg border border-border bg-secondary/30 p-3 text-[0.78rem] text-muted-foreground">
          Auto-selects by shared subcategory → category → occasion → season → tags → content type, using the existing related-content system.
        </div>
      ) : (
        <>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search content by title…" className={inputCls} />
          <ul className="space-y-1">
            {results.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => { const next = new Set(chosen); next.has(r.id) ? next.delete(r.id) : next.add(r.id); update({ relatedIds: [...next] }) }}
                  className={`flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left text-[0.8rem] ${chosen.has(r.id) ? 'border-primary bg-primary/8' : 'border-border hover:bg-secondary/40'}`}>
                  <span className="truncate text-foreground">{r.title}</span>
                  <span className="shrink-0 text-[0.68rem] capitalize text-muted-foreground">{r.type}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
