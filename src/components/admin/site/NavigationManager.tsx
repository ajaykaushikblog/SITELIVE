import { useMemo, useState } from 'react'
import { Button } from '../../ui/primitives'
import { AdminPageHeader, Panel, Field, Select, Tabs, Badge, PillButton, ConceptNote } from '../ui'
import { Plus, Trash, Check, Warning, Layers } from '../../ui/icons'
import {
  desktopNav,
  mobileNav,
  navDestinationTypes,
  validateNav,
  resolveNavPath,
  move,
  collections,
  type NavItem,
  type NavArea,
  type NavDestinationType,
} from '../../../lib/admin/site'
import { contentItems, taxonomyByKind } from '../../../lib/admin/cms'
import { authorProfiles } from '../../../lib/authorProfiles'

/* =========================================================================
   Phase 16 — Navigation Manager (/admin/site/navigation).

   Visual editor for Desktop and Mobile navigation. Items point to dynamic
   taxonomy terms, collections, content or external URLs — never duplicated
   free text. Desktop items can carry a mega menu (dynamic groups + featured
   content). Live validation flags broken, hidden, duplicate or invalid
   destinations (Healthy / Warning / Error).
   ========================================================================= */

const tabs: { id: NavArea; label: string }[] = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'mobile', label: 'Mobile' },
]

export function NavigationManager() {
  const [tab, setTab] = useState<NavArea>('desktop')
  const [desktop, setDesktop] = useState<NavItem[]>(desktopNav)
  const [mobile, setMobile] = useState<NavItem[]>(mobileNav)

  const items = tab === 'desktop' ? desktop : mobile
  const setItems = tab === 'desktop' ? setDesktop : setMobile
  const [editingId, setEditingId] = useState<string | null>(null)
  const editing = items.find((i) => i.id === editingId) ?? null

  const issues = useMemo(() => validateNav(items), [items])
  const errorCount = issues.filter((i) => i.health === 'error').length
  const warnCount = issues.filter((i) => i.health === 'warning').length

  function update(id: string, patch: Partial<NavItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }
  function reorder(i: number, dir: -1 | 1) {
    setItems((prev) => move(prev, i, dir).map((it, idx) => ({ ...it, order: idx })))
  }
  function add() {
    const item: NavItem = {
      id: `nav-${Math.random().toString(36).slice(2, 7)}`,
      label: 'New link',
      destinationType: 'home',
      order: items.length,
      enabled: true,
    }
    setItems((prev) => [...prev, item])
    setEditingId(item.id)
  }
  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    if (editingId === id) setEditingId(null)
  }

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Site', 'Navigation']}
        title="Navigation Manager"
        description="Build desktop and mobile menus from dynamic taxonomy, collections and content. Mobile ordering can differ from desktop."
        actions={<Button size="md" onClick={() => alert('Navigation saved (prototype).')}>Save navigation</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Tabs tabs={tabs} active={tab} onChange={(t) => { setTab(t as NavArea); setEditingId(null) }} />
        <div className="ml-auto flex items-center gap-2">
          <Badge label={`${errorCount} errors`} tone={errorCount ? 'bg-error/12 text-error' : 'bg-success/15 text-success'} />
          <Badge label={`${warnCount} warnings`} tone={warnCount ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground'} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[0.8rem] text-muted-foreground">
              {items.length} items · mobile navigation can be ordered independently of desktop.
            </p>
            <Button size="sm" onClick={add}>
              <Plus width={15} height={15} /> Add item
            </Button>
          </div>

          <ol className="space-y-2">
            {items.map((item, i) => {
              const path = resolveNavPath(item)
              const itemIssues = issues.filter((x) => x.itemId === item.id)
              const health: 'healthy' | 'warning' | 'error' = itemIssues.some((x) => x.health === 'error')
                ? 'error'
                : itemIssues.some((x) => x.health === 'warning')
                  ? 'warning'
                  : 'healthy'
              return (
                <li
                  key={item.id}
                  className={`rounded-xl border bg-card p-3 ${editingId === item.id ? 'border-foreground/40 ring-1 ring-foreground/10' : 'border-border'} ${!item.enabled ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <button type="button" onClick={() => reorder(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded px-1 text-muted-foreground hover:bg-secondary disabled:opacity-30">↑</button>
                      <button type="button" onClick={() => reorder(i, 1)} disabled={i === items.length - 1} aria-label="Move down" className="rounded px-1 text-muted-foreground hover:bg-secondary disabled:opacity-30">↓</button>
                    </div>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${health === 'error' ? 'bg-error' : health === 'warning' ? 'bg-warning' : 'bg-success'}`} aria-label={health} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[0.9rem] font-semibold text-foreground">{item.label || '(no label)'}</span>
                        <Badge label={navDestinationTypes.find((d) => d.id === item.destinationType)?.label ?? item.destinationType} tone="bg-secondary text-secondary-foreground" />
                        {item.menu && <Badge label="Mega menu" tone="bg-seasonal-soft/60 text-foreground" />}
                      </div>
                      <p className="mt-0.5 truncate font-mono text-[0.72rem] text-muted-foreground">{path ?? '⚠ unresolved destination'}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <label className="mr-1 flex cursor-pointer items-center gap-1.5 text-[0.72rem] text-muted-foreground">
                        <input type="checkbox" checked={item.enabled} onChange={(e) => update(item.id, { enabled: e.target.checked })} /> On
                      </label>
                      <PillButton onClick={() => setEditingId(item.id)} active={editingId === item.id}>Edit</PillButton>
                      <PillButton tone="danger" onClick={() => remove(item.id)}><Trash width={13} height={13} /></PillButton>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>

          {issues.length > 0 && (
            <Panel title="Validation" className="mt-6">
              <ul className="space-y-1.5 text-[0.8rem]">
                {issues.map((iss, i) => (
                  <li key={i} className={`flex items-start gap-2 ${iss.health === 'error' ? 'text-error' : 'text-warning'}`}>
                    <Warning width={14} height={14} className="mt-0.5 shrink-0" />
                    <span><strong>{iss.label}:</strong> {iss.issue}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
          {issues.length === 0 && (
            <p className="mt-6 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-[0.82rem] text-success">
              <Check width={16} height={16} /> All navigation destinations are healthy.
            </p>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          {editing ? (
            <NavItemEditor item={editing} onChange={(patch) => update(editing.id, patch)} onClose={() => setEditingId(null)} />
          ) : (
            <Panel title="Navigation item">
              <ConceptNote>
                Select an item to edit its label, destination and (on desktop) its mega menu. New occasions or collections
                added elsewhere in the CMS become available here automatically — no redesign needed.
              </ConceptNote>
            </Panel>
          )}
        </aside>
      </div>
    </div>
  )
}

/* --------------------------- Item editor --------------------------- */
function NavItemEditor({
  item,
  onChange,
  onClose,
}: {
  item: NavItem
  onChange: (patch: Partial<NavItem>) => void
  onClose: () => void
}) {
  const refOptions = destinationRefOptions(item.destinationType)

  return (
    <Panel
      title="Edit navigation item"
      actions={<button type="button" onClick={onClose} className="text-[0.78rem] text-muted-foreground hover:text-foreground">Done</button>}
    >
      <div className="space-y-4">
        <Field key={`${item.id}-label`} label="Label" value={item.label} onChange={(v) => onChange({ label: v })} />
        <Select
          label="Destination type"
          value={item.destinationType}
          options={navDestinationTypes.map((d) => ({ value: d.id, label: d.label }))}
          onChange={(v) => onChange({ destinationType: v as NavDestinationType, ref: undefined, url: undefined })}
        />

        {item.destinationType === 'external' ? (
          <Field label="URL" mono value={item.url} placeholder="https://… or /path" onChange={(v) => onChange({ url: v })} />
        ) : item.destinationType === 'home' ? (
          <ConceptNote>Points to the homepage (/).</ConceptNote>
        ) : refOptions ? (
          <Select
            label="Destination"
            value={item.ref ?? refOptions[0]?.value ?? ''}
            options={refOptions}
            onChange={(v) => onChange({ ref: v })}
          />
        ) : (
          <ConceptNote>No destinations of this type exist yet.</ConceptNote>
        )}

        <label className="flex items-center gap-2 text-[0.85rem] text-foreground">
          <input type="checkbox" checked={item.enabled} onChange={(e) => onChange({ enabled: e.target.checked })} /> Visible in navigation
        </label>

        {/* Mega menu (desktop) */}
        <div className="rounded-lg border border-border bg-secondary/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Layers width={13} height={13} /> Mega menu
            </p>
            <label className="flex items-center gap-1.5 text-[0.78rem] text-foreground">
              <input
                type="checkbox"
                checked={Boolean(item.menu)}
                onChange={(e) =>
                  onChange({ menu: e.target.checked ? { id: `m-${item.id}`, groups: [{ id: 'g1', label: 'Group', items: [] }] } : undefined })
                }
              />
              Enable
            </label>
          </div>
          {item.menu ? (
            <MegaMenuEditor item={item} onChange={onChange} />
          ) : (
            <p className="text-[0.75rem] text-muted-foreground">
              Attach a dropdown of dynamic taxonomy groups and an optional featured story.
            </p>
          )}
        </div>
      </div>
    </Panel>
  )
}

function MegaMenuEditor({ item, onChange }: { item: NavItem; onChange: (patch: Partial<NavItem>) => void }) {
  const menu = item.menu!
  const groups = menu.groups ?? []

  function setGroups(g: typeof groups) {
    onChange({ menu: { ...menu, groups: g } })
  }
  const occasionOpts = taxonomyByKind.occasion.map((o) => ({ value: o.id, label: o.name }))

  return (
    <div className="space-y-3">
      {groups.map((g, gi) => (
        <div key={g.id} className="rounded-md border border-border bg-card p-2.5">
          <div className="mb-2 flex items-center gap-2">
            <input
              value={g.label}
              onChange={(e) => setGroups(groups.map((x, i) => (i === gi ? { ...x, label: e.target.value } : x)))}
              className="flex-1 rounded border border-border bg-background px-2 py-1 text-[0.8rem] font-semibold text-foreground outline-none focus:border-foreground/40"
            />
            <PillButton tone="danger" onClick={() => setGroups(groups.filter((_, i) => i !== gi))}>
              <Trash width={12} height={12} />
            </PillButton>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {g.items.map((it) => (
              <span key={it.id} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[0.72rem] text-foreground">
                {it.label}
                <button
                  type="button"
                  aria-label={`Remove ${it.label}`}
                  onClick={() => setGroups(groups.map((x, i) => (i === gi ? { ...x, items: x.items.filter((y) => y.id !== it.id) } : x)))}
                  className="text-muted-foreground hover:text-error"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <select
            value=""
            onChange={(e) => {
              const opt = occasionOpts.find((o) => o.value === e.target.value)
              if (!opt) return
              setGroups(groups.map((x, i) => (i === gi ? { ...x, items: [...x.items, { id: `mi-${Math.random().toString(36).slice(2, 6)}`, label: opt.label, destinationType: 'occasion', ref: opt.value }] } : x)))
            }}
            className="mt-2 w-full rounded border border-border bg-background px-2 py-1 text-[0.78rem] text-muted-foreground outline-none focus:border-foreground/40"
          >
            <option value="">+ Add occasion (dynamic taxonomy)…</option>
            {occasionOpts.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      ))}
      <PillButton onClick={() => setGroups([...groups, { id: `g-${Math.random().toString(36).slice(2, 6)}`, label: 'New group', items: [] }])}>
        <Plus width={12} height={12} /> Add group
      </PillButton>

      <div className="rounded-md border border-border bg-card p-2.5">
        <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Featured content</p>
        <input
          value={menu.featured?.heading ?? ''}
          placeholder="Featured heading"
          onChange={(e) => onChange({ menu: { ...menu, featured: { ...menu.featured, heading: e.target.value } } })}
          className="w-full rounded border border-border bg-background px-2 py-1 text-[0.8rem] text-foreground outline-none focus:border-foreground/40"
        />
      </div>
    </div>
  )
}

/* --------------------------- helpers --------------------------- */
function destinationRefOptions(type: NavDestinationType): { value: string; label: string }[] | null {
  switch (type) {
    case 'category':
      return taxonomyByKind.category.map((t) => ({ value: t.id, label: t.name }))
    case 'subcategory':
      return taxonomyByKind.subcategory.map((t) => ({ value: t.id, label: t.name }))
    case 'occasion':
      return taxonomyByKind.occasion.map((t) => ({ value: t.id, label: t.name }))
    case 'collection':
      return collections.map((c) => ({ value: c.id, label: c.name }))
    case 'article':
      return contentItems.filter((c) => c.type === 'article' || c.type === 'listicle' || c.type === 'guide').map((c) => ({ value: c.id, label: c.title }))
    case 'recipe':
      return contentItems.filter((c) => c.type === 'recipe').map((c) => ({ value: c.id, label: c.title }))
    case 'diy':
      return contentItems.filter((c) => c.type === 'diy').map((c) => ({ value: c.id, label: c.title }))
    case 'author':
      return Object.values(authorProfiles).map((a) => ({ value: a.slug, label: a.name }))
    default:
      return null
  }
}
