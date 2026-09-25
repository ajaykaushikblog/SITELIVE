import { useMemo, useState } from 'react'
import { Button } from '../../ui/primitives'
import { Homepage } from '../../home/Homepage'
import {
  AdminPageHeader,
  Panel,
  Field,
  Textarea,
  Select,
  Tabs,
  Badge,
  PillButton,
  ConceptNote,
} from '../ui'
import { ContentPicker } from './ContentPicker'
import { Plus, Copy, Trash, Check, Warning } from '../../ui/icons'
import {
  homepageSections,
  sectionTypes,
  sectionTypeDef,
  sourceModes,
  sectionLayouts,
  styleVariants,
  editorialPriorities,
  scheduleStatusMeta,
  seasonalCampaigns,
  heroConfig,
  homepageHistory,
  collections,
  contentLabel,
  move,
  type HomepageSection,
  type SectionType,
  type SourceMode,
  type SeasonalCampaign,
  type HeroStory,
} from '../../../lib/admin/site'
import { taxonomyByKind } from '../../../lib/admin/cms'

/* =========================================================================
   Phase 16 — Homepage Manager (/admin/site/homepage).

   A visual, data-driven homepage builder. Sections can be added, removed,
   reordered, enabled/disabled, scheduled, duplicated and edited — with a
   live preview that renders the REAL public Homepage component (no separate
   visual system). Everything is prototype state; persistence, scheduling
   and publishing connect in the backend phase.
   ========================================================================= */

type Tab = 'sections' | 'hero' | 'seasonal' | 'preview' | 'history'
const tabs: { id: Tab; label: string }[] = [
  { id: 'sections', label: 'Sections' },
  { id: 'hero', label: 'Featured Hero' },
  { id: 'seasonal', label: 'Seasonal Campaigns' },
  { id: 'preview', label: 'Preview' },
  { id: 'history', label: 'History' },
]

export function HomepageManager() {
  const [tab, setTab] = useState<Tab>('sections')
  const [sections, setSections] = useState<HomepageSection[]>(homepageSections)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  const editing = sections.find((s) => s.id === editingId) ?? null

  function update(id: string, patch: Partial<HomepageSection>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }
  function reorder(i: number, dir: -1 | 1) {
    setSections((prev) => move(prev, i, dir).map((s, idx) => ({ ...s, order: idx })))
  }
  function remove(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id))
    if (editingId === id) setEditingId(null)
  }
  function duplicate(s: HomepageSection) {
    const copy: HomepageSection = {
      ...s,
      id: `hs-${Math.random().toString(36).slice(2, 7)}`,
      name: `${s.name} (copy)`,
      status: 'draft',
      enabled: false,
      order: sections.length,
    }
    setSections((prev) => [...prev, copy])
    setEditingId(copy.id)
    setFlash(`Duplicated "${s.name}" as a draft — dates copied but editable.`)
  }
  function addSection(type: SectionType) {
    const def = sectionTypeDef(type)
    const s: HomepageSection = {
      id: `hs-${Math.random().toString(36).slice(2, 7)}`,
      name: def.label,
      type,
      heading: def.label,
      source: 'automatic',
      contentIds: [],
      itemCount: 4,
      layout: 'grid-4',
      variant: 'default',
      priority: 'normal',
      enabled: false,
      order: sections.length,
      status: 'draft',
    }
    setSections((prev) => [...prev, s])
    setAdding(false)
    setEditingId(s.id)
  }

  /* Publish validation (Phase 16 §24) */
  const validation = useMemo(() => runValidation(sections), [sections])

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Site', 'Homepage']}
        title="Homepage Manager"
        description="Build the homepage from reusable sections — no code required. Sections render through the existing public components."
        actions={
          <>
            <Button variant="outline" size="md" onClick={() => setFlash('Draft saved (prototype — no persistence yet).')}>
              Save draft
            </Button>
            <Button variant="outline" size="md" onClick={() => setTab('preview')}>
              Preview
            </Button>
            <PublishButton validation={validation} onPublish={() => setFlash('Publish requested (prototype — connects to backend later).')} />
          </>
        }
      />

      {flash && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-[0.82rem] text-success">
          <Check width={16} height={16} /> {flash}
        </div>
      )}

      <div className="mb-6">
        <Tabs tabs={tabs} active={tab} onChange={(t) => setTab(t as Tab)} />
      </div>

      {tab === 'sections' && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[0.8rem] text-muted-foreground">
                {sections.length} sections · {sections.filter((s) => s.enabled).length} enabled
              </p>
              <Button size="sm" onClick={() => setAdding(true)}>
                <Plus width={15} height={15} /> Add section
              </Button>
            </div>

            <ol className="space-y-2">
              {sections.map((s, i) => (
                <li
                  key={s.id}
                  className={`rounded-xl border bg-card p-3 transition-colors ${
                    editingId === s.id ? 'border-foreground/40 ring-1 ring-foreground/10' : 'border-border'
                  } ${!s.enabled ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => reorder(i, -1)}
                        disabled={i === 0}
                        aria-label="Move section up"
                        className="rounded px-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => reorder(i, 1)}
                        disabled={i === sections.length - 1}
                        aria-label="Move section down"
                        className="rounded px-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-serif text-[1.02rem] font-semibold text-foreground">{s.name}</span>
                        <Badge label={sectionTypeDef(s.type).label} tone="bg-secondary text-secondary-foreground" />
                        <Badge label={scheduleStatusMeta[s.status].label} tone={scheduleStatusMeta[s.status].tone} />
                        {s.priority !== 'normal' && (
                          <Badge label={s.priority === 'featured' ? 'Featured' : 'High priority'} tone="bg-seasonal-soft/60 text-foreground" />
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[0.75rem] text-muted-foreground">
                        {sourceSummary(s)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <label className="mr-1 flex cursor-pointer items-center gap-1.5 text-[0.72rem] text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={s.enabled}
                          onChange={(e) => update(s.id, { enabled: e.target.checked })}
                        />
                        On
                      </label>
                      <PillButton onClick={() => setEditingId(s.id)} active={editingId === s.id}>
                        Edit
                      </PillButton>
                      <PillButton onClick={() => duplicate(s)}>
                        <Copy width={13} height={13} />
                      </PillButton>
                      <PillButton tone="danger" onClick={() => remove(s.id)}>
                        <Trash width={13} height={13} />
                      </PillButton>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            {adding ? (
              <AddSectionPanel onPick={addSection} onCancel={() => setAdding(false)} />
            ) : editing ? (
              <SectionEditor section={editing} onChange={(patch) => update(editing.id, patch)} onClose={() => setEditingId(null)} />
            ) : (
              <Panel title="Section settings">
                <p className="text-[0.82rem] text-muted-foreground">
                  Select a section to edit its heading, content source, layout, style, priority and schedule — or add a
                  new one. Every section reuses one component per type, so new sections never need new code.
                </p>
              </Panel>
            )}
          </aside>
        </div>
      )}

      {tab === 'hero' && <HeroManager />}
      {tab === 'seasonal' && <SeasonalManager />}
      {tab === 'preview' && <HomepagePreview />}
      {tab === 'history' && <HistoryView />}
    </div>
  )
}

/* --------------------------- Add section --------------------------- */
function AddSectionPanel({ onPick, onCancel }: { onPick: (t: SectionType) => void; onCancel: () => void }) {
  return (
    <Panel
      title="Add a section"
      actions={
        <button type="button" onClick={onCancel} className="text-[0.78rem] text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      }
    >
      <div className="grid gap-2">
        {sectionTypes.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(t.id)}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-left transition-colors hover:border-foreground/40 hover:bg-secondary"
          >
            <span className="block text-[0.85rem] font-semibold text-foreground">{t.label}</span>
            <span className="block text-[0.72rem] text-muted-foreground">{t.hint}</span>
          </button>
        ))}
      </div>
    </Panel>
  )
}

/* --------------------------- Section editor --------------------------- */
function SectionEditor({
  section,
  onChange,
  onClose,
}: {
  section: HomepageSection
  onChange: (patch: Partial<HomepageSection>) => void
  onClose: () => void
}) {
  const refOptions = sourceRefOptions(section.source)
  const isManual = section.source === 'manual'
  const isCollection = section.source === 'collection'

  return (
    <Panel
      title="Section settings"
      actions={
        <button type="button" onClick={onClose} className="text-[0.78rem] text-muted-foreground hover:text-foreground">
          Done
        </button>
      }
    >
      <div className="space-y-4">
        <Field key={`${section.id}-name`} label="Section name" value={section.name} onChange={(v) => onChange({ name: v })} hint="Internal label (not shown publicly)." />
        <Field key={`${section.id}-heading`} label="Heading" value={section.heading} onChange={(v) => onChange({ heading: v })} />
        <Textarea key={`${section.id}-desc`} label="Description (optional)" rows={2} value={section.description} />

        <Select
          label="Content source"
          value={section.source}
          options={sourceModes.map((m) => ({ value: m.id, label: m.label }))}
          onChange={(v) => onChange({ source: v as SourceMode, sourceRef: undefined, contentIds: [] })}
        />

        {isManual ? (
          <div>
            <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Manual content (overrides automatic order)
            </span>
            <ContentPicker selected={section.contentIds} onChange={(ids) => onChange({ contentIds: ids })} />
          </div>
        ) : isCollection ? (
          <Select
            label="Collection"
            value={section.sourceRef ?? collections[0].id}
            options={collections.map((c) => ({ value: c.id, label: c.name }))}
            onChange={(v) => onChange({ sourceRef: v })}
          />
        ) : refOptions ? (
          <Select
            label={`${section.source} term`}
            value={section.sourceRef ?? refOptions[0]?.value ?? ''}
            options={refOptions}
            onChange={(v) => onChange({ sourceRef: v })}
            capitalize
          />
        ) : (
          <ConceptNote>
            Automatic sections pull the newest / most-relevant items for their type. Ordering and analytics-based
            selection connect during the backend phase (placeholder for now).
          </ConceptNote>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Items to show" type="number" value={String(section.itemCount)} onChange={(v) => onChange({ itemCount: Number(v) || 0 })} />
          <Select label="Layout" value={section.layout} options={sectionLayouts.map((l) => ({ value: l.id, label: l.label }))} onChange={(v) => onChange({ layout: v as HomepageSection['layout'] })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Style variant" value={section.variant} options={styleVariants.map((v) => ({ value: v.id, label: v.label }))} onChange={(v) => onChange({ variant: v as HomepageSection['variant'] })} />
          <Select label="Editorial priority" value={section.priority} options={editorialPriorities.map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) }))} onChange={(v) => onChange({ priority: v as HomepageSection['priority'] })} capitalize />
        </div>

        <div className="rounded-lg border border-border bg-secondary/30 p-3">
          <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Schedule</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date" type="date" value={section.startDate} onChange={(v) => onChange({ startDate: v })} />
            <Field label="End date" type="date" value={section.endDate} onChange={(v) => onChange({ endDate: v })} />
          </div>
          <div className="mt-3">
            <Select
              label="Status"
              value={section.status}
              options={Object.entries(scheduleStatusMeta).map(([id, m]) => ({ value: id, label: m.label }))}
              onChange={(v) => onChange({ status: v as HomepageSection['status'] })}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-[0.85rem] text-foreground">
          <input type="checkbox" checked={section.enabled} onChange={(e) => onChange({ enabled: e.target.checked })} />
          Enabled on homepage
        </label>
      </div>
    </Panel>
  )
}

/* --------------------------- Featured hero --------------------------- */
function HeroManager() {
  const [primary, setPrimary] = useState<HeroStory>(heroConfig.primary)
  const [supporting, setSupporting] = useState<HeroStory[]>(heroConfig.supporting)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Primary hero story">
        <div className="space-y-4">
          <div>
            <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Featured content
            </span>
            <ContentPicker
              selected={primary.contentId ? [primary.contentId] : []}
              onChange={(ids) => setPrimary({ ...primary, contentId: ids[ids.length - 1] })}
            />
            <p className="mt-1 text-[0.7rem] text-muted-foreground">Pick any article, recipe, DIY or guide.</p>
          </div>
          <Field label="Custom heading (optional)" value={primary.customHeading} placeholder="Overrides the content title" />
          <Textarea label="Custom description (optional)" rows={2} value={primary.customDescription} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="CTA label" value={primary.cta} placeholder="Read more" />
            <Field label="CTA link" value={primary.ctaHref} placeholder="/article/…" mono />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Display start" type="date" value={primary.startDate} />
            <Field label="Display end" type="date" value={primary.endDate} />
          </div>
          <label className="flex items-center gap-2 text-[0.85rem] text-foreground">
            <input type="checkbox" checked={primary.enabled} onChange={(e) => setPrimary({ ...primary, enabled: e.target.checked })} /> Enabled
          </label>
        </div>
      </Panel>

      <Panel
        title="Supporting stories"
        actions={
          <PillButton onClick={() => setSupporting([...supporting, { id: `hero-${Math.random().toString(36).slice(2, 6)}`, enabled: true }])}>
            <Plus width={13} height={13} /> Add
          </PillButton>
        }
      >
        <ol className="space-y-2">
          {supporting.map((h, i) => (
            <li key={h.id} className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-[0.7rem] font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.82rem] font-medium text-foreground">
                {h.contentId ? contentLabel(h.contentId) : h.customHeading || '(empty — configure below)'}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => setSupporting(move(supporting, i, -1))} disabled={i === 0} aria-label="Move up" className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30">↑</button>
                <button type="button" onClick={() => setSupporting(move(supporting, i, 1))} disabled={i === supporting.length - 1} aria-label="Move down" className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30">↓</button>
                <PillButton tone="danger" onClick={() => setSupporting(supporting.filter((x) => x.id !== h.id))}>
                  <Trash width={13} height={13} />
                </PillButton>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4">
          <ContentPicker
            selected={supporting.map((s) => s.contentId).filter((x): x is string => Boolean(x))}
            onChange={(ids) =>
              setSupporting(ids.map((id, idx) => supporting.find((s) => s.contentId === id) ?? { id: `hero-${idx}-${id}`, contentId: id, enabled: true }))
            }
          />
        </div>
      </Panel>
    </div>
  )
}

/* --------------------------- Seasonal campaigns --------------------------- */
function SeasonalManager() {
  const [campaigns, setCampaigns] = useState<SeasonalCampaign[]>(seasonalCampaigns)

  function update(id: string, patch: Partial<SeasonalCampaign>) {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }
  function duplicate(c: SeasonalCampaign) {
    setCampaigns((prev) => [
      ...prev,
      { ...c, id: `sc-${Math.random().toString(36).slice(2, 6)}`, name: `${c.name} (copy)`, status: 'draft', enabled: false },
    ])
  }

  const active = campaigns
    .filter((c) => c.enabled && c.status === 'active')
    .sort((a, b) => a.priority - b.priority)

  return (
    <div className="space-y-6">
      <ConceptNote>
        Multiple campaigns can be active at once (e.g. Fall + Halloween + Thanksgiving). The homepage shows active
        campaigns ordered by <strong>priority</strong>, and swaps automatically as dates change. Nothing is hard-coded to
        one season. Date evaluation runs on the server in the backend phase.
      </ConceptNote>

      {active.length > 0 && (
        <Panel title={`Currently active (${active.length})`}>
          <div className="flex flex-wrap gap-2">
            {active.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-2 rounded-full bg-seasonal-soft/60 px-3 py-1 text-[0.78rem] font-medium text-foreground">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-foreground text-[0.68rem] font-bold text-background">{c.priority}</span>
                {c.heading}
              </span>
            ))}
          </div>
        </Panel>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {campaigns.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-xl border border-border bg-card">
            {c.image && (
              <div className="relative aspect-[16/7] bg-secondary">
                <img src={c.image} alt="" className="h-full w-full object-cover" />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <Badge label={scheduleStatusMeta[c.status].label} tone={scheduleStatusMeta[c.status].tone} />
                  <Badge label={c.kind === 'season' ? 'Season' : 'Occasion'} tone="bg-background/85 text-foreground" />
                </div>
              </div>
            )}
            <div className="space-y-3 p-4">
              <Field label="Heading" value={c.heading} onChange={(v) => update(c.id, { heading: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start" type="date" value={c.startDate} onChange={(v) => update(c.id, { startDate: v })} />
                <Field label="End" type="date" value={c.endDate} onChange={(v) => update(c.id, { endDate: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Priority" type="number" value={String(c.priority)} onChange={(v) => update(c.id, { priority: Number(v) || 1 })} />
                <Select label="Status" value={c.status} options={Object.entries(scheduleStatusMeta).map(([id, m]) => ({ value: id, label: m.label }))} onChange={(v) => update(c.id, { status: v as SeasonalCampaign['status'] })} />
              </div>
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-[0.82rem] text-foreground">
                  <input type="checkbox" checked={c.enabled} onChange={(e) => update(c.id, { enabled: e.target.checked })} /> Enabled
                </label>
                <PillButton onClick={() => duplicate(c)}>
                  <Copy width={13} height={13} /> Duplicate
                </PillButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* --------------------------- Preview --------------------------- */
function HomepagePreview() {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const widths = { desktop: 1280, tablet: 834, mobile: 390 }
  const w = widths[device]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {(['desktop', 'tablet', 'mobile'] as const).map((d) => (
            <PillButton key={d} active={device === d} onClick={() => setDevice(d)}>
              {d[0].toUpperCase() + d.slice(1)}
            </PillButton>
          ))}
        </div>
        <p className="text-[0.75rem] text-muted-foreground">Rendered with the live public Homepage component — {w}px</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="max-h-[70vh] overflow-y-auto">
          <div style={{ width: w, margin: '0 auto' }} className="origin-top">
            <Homepage />
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------- History --------------------------- */
function HistoryView() {
  return (
    <div className="space-y-4">
      <ConceptNote>
        Version history is a planned backend feature — the entries below are illustrative placeholders. View, compare and
        restore will operate on real saved versions once persistence is connected.
      </ConceptNote>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[560px] text-left text-[0.84rem]">
          <thead className="bg-secondary/60 text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Version</th>
              <th className="px-4 py-3 font-semibold">Editor</th>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Changes</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {homepageHistory.map((v) => (
              <tr key={v.id} className="border-t border-border bg-card">
                <td className="px-4 py-3 font-semibold text-foreground">
                  {v.version} {v.current && <Badge label="Current" tone="bg-success/15 text-success" />}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{v.editor}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.when}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.changes}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <PillButton>View</PillButton>
                    <PillButton>Compare</PillButton>
                    <PillButton>Restore</PillButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* --------------------------- Publish + validation --------------------------- */
type Validation = { ok: boolean; errors: string[]; warnings: string[] }

function runValidation(sections: HomepageSection[]): Validation {
  const errors: string[] = []
  const warnings: string[] = []
  const heroContent: string[] = []

  for (const s of sections.filter((x) => x.enabled)) {
    if (!s.heading.trim()) errors.push(`"${s.name}" is missing a heading.`)
    if (s.source === 'manual' && s.contentIds.length === 0) errors.push(`"${s.name}" is manual but has no content selected.`)
    if (s.source === 'manual') {
      for (const id of s.contentIds) {
        if (!contentLabel(id) || contentLabel(id) === '(deleted content)') errors.push(`"${s.name}" references deleted content.`)
      }
    }
    if (s.status === 'expired') warnings.push(`"${s.name}" is enabled but its schedule has expired.`)
    if (s.type === 'featured') heroContent.push(...s.contentIds)
  }

  const dupHero = heroContent.filter((id, i) => heroContent.indexOf(id) !== i)
  if (dupHero.length) warnings.push('Duplicate hero content is configured across featured sections.')

  return { ok: errors.length === 0, errors, warnings }
}

function PublishButton({ validation, onPublish }: { validation: Validation; onPublish: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Button size="md" onClick={() => setOpen((v) => !v)}>
        Publish
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-xl">
          <p className="mb-2 font-serif text-[1.05rem] font-semibold text-foreground">Pre-publish checks</p>
          {validation.errors.length === 0 && validation.warnings.length === 0 ? (
            <p className="flex items-center gap-2 text-[0.82rem] text-success">
              <Check width={16} height={16} /> All checks passed.
            </p>
          ) : (
            <ul className="space-y-1.5 text-[0.78rem]">
              {validation.errors.map((e, i) => (
                <li key={`e${i}`} className="flex items-start gap-2 text-error">
                  <Warning width={14} height={14} className="mt-0.5 shrink-0" /> {e}
                </li>
              ))}
              {validation.warnings.map((w, i) => (
                <li key={`w${i}`} className="flex items-start gap-2 text-warning">
                  <Warning width={14} height={14} className="mt-0.5 shrink-0" /> {w}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setOpen(false)
                onPublish()
              }}
              className={!validation.ok ? 'pointer-events-none opacity-50' : ''}
            >
              {validation.ok ? 'Publish now' : 'Fix errors first'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* --------------------------- helpers --------------------------- */
function sourceSummary(s: HomepageSection): string {
  const base = `${s.itemCount} item${s.itemCount === 1 ? '' : 's'} · ${sectionLayoutLabel(s.layout)}`
  switch (s.source) {
    case 'manual':
      return `Manual (${s.contentIds.length} selected) · ${base}`
    case 'collection': {
      const c = collections.find((x) => x.id === s.sourceRef)
      return `Collection: ${c?.name ?? '—'} · ${base}`
    }
    case 'automatic':
      return `Automatic · ${base}`
    default:
      return `${s.source[0].toUpperCase() + s.source.slice(1)}: ${refLabel(s.source, s.sourceRef)} · ${base}`
  }
}
function sectionLayoutLabel(id: HomepageSection['layout']) {
  return sectionLayouts.find((l) => l.id === id)?.label ?? id
}
function sourceRefOptions(source: SourceMode): { value: string; label: string }[] | null {
  const map: Partial<Record<SourceMode, keyof typeof taxonomyByKind>> = {
    category: 'category',
    subcategory: 'subcategory',
    occasion: 'occasion',
    season: 'season',
    tag: 'tag',
  }
  const kind = map[source]
  if (!kind) return null
  return taxonomyByKind[kind].map((t) => ({ value: t.id, label: t.name }))
}
function refLabel(source: SourceMode, ref?: string): string {
  const opts = sourceRefOptions(source)
  return opts?.find((o) => o.value === ref)?.label ?? '—'
}
