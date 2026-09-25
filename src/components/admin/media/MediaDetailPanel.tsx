import { useState } from 'react'
import { Button } from '../../ui/primitives'
import { Field, Textarea, Badge, PillButton, ConceptNote, Tabs } from '../ui'
import { Close, Copy, Trash, Refresh, Check, Warning, Pinterest } from '../../ui/icons'
import {
  aspectRatio, isPinterestFormat, altState, altStateMeta, optimizationMeta,
  imageSeoChecks, seoScore, variantPlan,
  type MediaItem,
} from '../../../lib/admin/media'
import { getTemplate } from '../../../lib/pinterest'

/* =========================================================================
   Media details — the full inspector for a selected item. Renders as a
   right rail on desktop and a full-screen sheet on mobile (the parent
   controls placement). Tabs keep the dense metadata scannable.
   ========================================================================= */

type Tab = 'details' | 'seo' | 'variants' | 'usage' | 'pinterest'

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-[0.72rem] uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
      <span className={`text-right text-[0.82rem] text-foreground ${mono ? 'font-mono text-[0.76rem]' : ''}`}>{value}</span>
    </div>
  )
}

export function MediaDetailPanel({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('details')
  const [alt, setAlt] = useState(item.alt)
  const [decorative, setDecorative] = useState(item.decorative)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [replacing, setReplacing] = useState(false)

  const ar = aspectRatio(item.width, item.height)
  const isPin = isPinterestFormat(item)
  const altS = altState({ alt, decorative })
  const checks = imageSeoChecks({ ...item, alt, decorative })
  const score = seoScore({ ...item, alt, decorative })
  const variants = variantPlan(item)
  const url = `https://images.marigoldandmaple.com/${item.filename}`
  const usesCount = item.usage.length

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'seo', label: 'Image SEO' },
    { id: 'variants', label: 'Variants' },
    { id: 'usage', label: `Usage (${usesCount})` },
    ...(item.role === 'pinterest' || isPin ? [{ id: 'pinterest', label: 'Pinterest' }] : []),
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate font-serif text-[1.2rem] font-semibold text-foreground">{item.title || item.filename}</h2>
          <p className="truncate text-[0.76rem] text-muted-foreground">{item.filename}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Close details"
        >
          <Close width={18} height={18} />
        </button>
      </div>

      {/* Preview */}
      <div className="border-b border-border p-5">
        <div className="relative overflow-hidden rounded-lg border border-border bg-secondary">
          <img
            src={item.url}
            alt={alt}
            className={`w-full object-contain ${isPin ? 'max-h-72' : 'max-h-56'}`}
          />
          {isPin && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-pinterest px-2 py-0.5 text-[0.62rem] font-bold text-white">
              <Pinterest width={11} height={11} /> Pinterest
            </span>
          )}
        </div>
      </div>

      <div className="border-b border-border px-5 pt-3">
        <Tabs tabs={tabs} active={tab} onChange={(t) => setTab(t as Tab)} />
      </div>

      {/* Scroll body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {tab === 'details' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-secondary/30 px-3 py-1.5">
              <Fact label="Type" value={`${item.kind} · ${item.format}`} />
              <Fact label="File size" value={`${item.sizeKB.toLocaleString()} KB`} />
              <Fact label="Dimensions" value={`${item.width} × ${item.height}`} />
              <Fact label="Aspect ratio" value={ar.named ? `${ar.named} (${ar.exact})` : ar.exact} />
              <Fact label="Uploaded" value={item.uploaded} />
              <Fact label="Modified" value={item.modified} />
              <Fact label="URL" value={item.filename} mono />
            </div>

            <Field key={item.id + 'title'} label="Title" value={item.title} />
            <Field key={item.id + 'file'} label="Filename" value={item.filename} mono hint="Use lowercase-hyphenated-keywords for image SEO." />

            {/* Alt text with live validation */}
            <label className="block">
              <span className="mb-1.5 flex items-center justify-between text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Alt text
                <Badge label={altStateMeta[altS].label} tone={altStateMeta[altS].tone} />
              </span>
              <textarea
                rows={2}
                value={alt}
                disabled={decorative}
                onChange={(e) => setAlt(e.target.value)}
                placeholder={decorative ? 'Decorative — no alt text needed' : 'Describe the meaningful visual content…'}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40 disabled:opacity-50"
              />
              <span className="mt-1 block text-[0.7rem] text-muted-foreground">
                Alt text should describe the meaningful visual content and purpose of the image — not the filename.
              </span>
            </label>

            <label className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
              <input
                type="checkbox"
                checked={decorative}
                onChange={(e) => setDecorative(e.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              <span className="text-[0.8rem] text-foreground">
                Decorative image
                <span className="block text-[0.72rem] text-muted-foreground">
                  Purely visual — screen readers should skip it. We won’t force alt text.
                </span>
              </span>
            </label>

            <Textarea key={item.id + 'cap'} label="Caption" rows={2} value={item.caption} placeholder="Optional caption shown under the image" />
            <Textarea key={item.id + 'desc'} label="Description" rows={3} value={item.description} placeholder="Internal description / notes" />

            <div>
              <p className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Media tags</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[0.72rem] font-medium text-secondary-foreground">
                    {t}
                  </span>
                ))}
                <button type="button" className="rounded-full border border-dashed border-border px-2.5 py-1 text-[0.72rem] font-medium text-muted-foreground hover:border-foreground/40 hover:text-foreground">
                  + Add tag
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'seo' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
              <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-primary/30 font-serif text-[1.3rem] font-semibold text-foreground">
                {score}
              </div>
              <div>
                <p className="text-[0.85rem] font-semibold text-foreground">Image SEO Health</p>
                <p className="text-[0.74rem] text-muted-foreground">Interface indicator — not a guaranteed ranking score.</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {checks.map((c) => (
                <li key={c.label} className="flex items-start gap-2.5 rounded-md border border-border bg-card px-3 py-2">
                  <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${c.pass ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                    {c.pass ? <Check width={13} height={13} /> : <Warning width={13} height={13} />}
                  </span>
                  <span>
                    <span className="block text-[0.82rem] font-medium text-foreground">{c.label}</span>
                    <span className="block text-[0.72rem] text-muted-foreground">{c.hint}</span>
                  </span>
                </li>
              ))}
            </ul>
            <ConceptNote>
              These fields connect to the Phase 12 SEO Control Center — filename, alt text, title,
              caption and description feed the site-wide image SEO signals.
            </ConceptNote>
          </div>
        )}

        {tab === 'variants' && (
          <div className="space-y-3">
            <p className="text-[0.8rem] text-muted-foreground">
              Derived renditions generated from the preserved original. Concept only — no files are
              produced in this prototype.
            </p>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-[0.8rem]">
                <thead className="bg-secondary/60 text-[0.66rem] uppercase tracking-[0.1em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Variant</th>
                    <th className="px-3 py-2 font-semibold">Dimensions</th>
                    <th className="px-3 py-2 text-right font-semibold">Est. size</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id} className="border-t border-border">
                      <td className="px-3 py-2 font-medium text-foreground">
                        {v.label}
                        {v.id === 'pinterest' && <span className="ml-1.5 rounded bg-pinterest/10 px-1.5 py-0.5 text-[0.6rem] font-bold text-pinterest">2:3</span>}
                        {v.id === 'original' && <span className="ml-1.5 text-[0.66rem] text-muted-foreground">preserved</span>}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{v.width} × {v.height}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{v.sizeKB.toLocaleString()} KB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Optimization concept */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[0.8rem] font-semibold text-foreground">Compression</p>
                <Badge label={optimizationMeta[item.optimization].label} tone={optimizationMeta[item.optimization].tone} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-secondary/40 px-2 py-2">
                  <p className="text-[0.64rem] uppercase tracking-wide text-muted-foreground">Original</p>
                  <p className="text-[0.85rem] font-semibold text-foreground">{item.sizeKB} KB</p>
                </div>
                <div className="rounded-md bg-secondary/40 px-2 py-2">
                  <p className="text-[0.64rem] uppercase tracking-wide text-muted-foreground">Optimized</p>
                  <p className="text-[0.85rem] font-semibold text-foreground">{item.optimizedKB ? `${item.optimizedKB} KB` : '—'}</p>
                </div>
                <div className="rounded-md bg-secondary/40 px-2 py-2">
                  <p className="text-[0.64rem] uppercase tracking-wide text-muted-foreground">Savings</p>
                  <p className="text-[0.85rem] font-semibold text-success">
                    {item.optimizedKB ? `${Math.round((1 - item.optimizedKB / item.sizeKB) * 100)}%` : '—'}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[0.7rem] text-muted-foreground">Target formats: WebP · AVIF (with JPEG/PNG fallback). No compression is performed in this prototype.</p>
            </div>
          </div>
        )}

        {tab === 'usage' && (
          <div className="space-y-3">
            {usesCount === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-secondary/30 px-4 py-8 text-center">
                <p className="text-[0.85rem] font-medium text-foreground">Not used anywhere</p>
                <p className="mt-1 text-[0.75rem] text-muted-foreground">Safe to delete or archive.</p>
              </div>
            ) : (
              <>
                <p className="text-[0.8rem] text-muted-foreground">Used in {usesCount} location{usesCount === 1 ? '' : 's'} — click to open.</p>
                <ul className="space-y-1.5">
                  {item.usage.map((u, i) => (
                    <li key={i}>
                      <a href={u.href} className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 hover:border-foreground/30 hover:bg-secondary/40">
                        <span className="min-w-0">
                          <span className="block truncate text-[0.82rem] font-medium text-foreground">{u.label}</span>
                          <span className="text-[0.7rem] capitalize text-muted-foreground">{u.kind}</span>
                        </span>
                        <span className="shrink-0 text-[0.72rem] font-semibold text-primary">Open →</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {tab === 'pinterest' && item.pinterest && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge label={item.pinterest.isPrimary ? 'Primary pin' : 'Alternate pin'} tone={item.pinterest.isPrimary ? 'bg-success/15 text-success' : 'bg-secondary text-secondary-foreground'} />
              <Badge label={getTemplate(item.pinterest.template).label + ' template'} tone="bg-secondary text-secondary-foreground" />
            </div>
            <Field key={item.id + 'pt'} label="Pin title" value={item.pinterest.pinTitle} />
            <Textarea key={item.id + 'pd'} label="Pin description" rows={3} value={item.pinterest.pinDescription} />
            <Field key={item.id + 'pdest'} label="Destination content" value={item.pinterest.destination} mono />
            <div className="flex flex-wrap gap-2">
              <PillButton>Set as primary</PillButton>
              <PillButton>Duplicate pin</PillButton>
            </div>
            <ConceptNote>Connected to the Phase 9 Pinterest system — templates, alternate pins and destinations stay in sync.</ConceptNote>
          </div>
        )}
      </div>

      {/* Sticky actions */}
      <div className="border-t border-border p-4">
        {replacing ? (
          <div className="mb-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
            <p className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-foreground">
              <Warning width={15} height={15} className="text-warning" /> Replace this image?
            </p>
            <p className="mt-1 text-[0.74rem] text-muted-foreground">
              Existing references are kept where technically possible — the URL is preserved so content
              won’t break. {usesCount > 0 && `${usesCount} location${usesCount === 1 ? '' : 's'} will show the new image.`}
            </p>
            <div className="mt-2.5 flex gap-2">
              <Button size="sm" onClick={() => setReplacing(false)}>Choose replacement…</Button>
              <Button size="sm" variant="outline" onClick={() => setReplacing(false)}>Cancel</Button>
            </div>
          </div>
        ) : confirmDelete ? (
          <div className="mb-3 rounded-lg border border-error/30 bg-error/10 p-3">
            <p className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-foreground">
              <Warning width={15} height={15} className="text-error" />
              {usesCount > 0 ? `Used in ${usesCount} location${usesCount === 1 ? '' : 's'}` : 'Delete this image?'}
            </p>
            {usesCount > 0 && (
              <>
                <p className="mt-1 text-[0.74rem] text-muted-foreground">
                  Deleting will leave broken images. Replace or remove references first.
                </p>
                <ul className="mt-2 space-y-0.5 text-[0.74rem] text-muted-foreground">
                  {item.usage.slice(0, 4).map((u, i) => <li key={i} className="truncate">· {u.label}</li>)}
                </ul>
              </>
            )}
            <div className="mt-2.5 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="inline-flex h-9 items-center rounded-md bg-error px-3.5 text-[0.8rem] font-semibold text-white hover:bg-error/90"
              >
                {usesCount > 0 ? 'Delete anyway' : 'Delete'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Save changes</Button>
          <PillButton onClick={() => { setReplacing(true); setConfirmDelete(false) }}>
            <Refresh width={14} height={14} /> Replace
          </PillButton>
          <PillButton onClick={() => navigator.clipboard?.writeText(url)}>
            <Copy width={14} height={14} /> Copy URL
          </PillButton>
          <PillButton tone="danger" onClick={() => { setConfirmDelete(true); setReplacing(false) }}>
            <Trash width={14} height={14} /> Delete
          </PillButton>
        </div>
      </div>
    </div>
  )
}
