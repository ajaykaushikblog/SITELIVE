import { useState } from 'react'
import { Button } from '../../ui/primitives'
import { AdminPageHeader, Panel, Field, PillButton, ConceptNote } from '../ui'
import { Plus, Trash } from '../../ui/icons'
import { footerConfig, move, type FooterColumn } from '../../../lib/admin/site'

/* =========================================================================
   Phase 16 — Footer Manager (/admin/site/footer).

   Manage footer columns and their links, social links, legal links, the
   newsletter toggle and copyright. Multiple link groups supported. Renders
   through the existing public Footer component in production.
   ========================================================================= */

export function FooterManager() {
  const [columns, setColumns] = useState<FooterColumn[]>(footerConfig.columns)
  const [social, setSocial] = useState(footerConfig.social)
  const [legal, setLegal] = useState(footerConfig.legal)
  const [newsletter, setNewsletter] = useState(footerConfig.newsletterEnabled)
  const [copyright, setCopyright] = useState(footerConfig.copyright)

  function updateColumn(id: string, patch: Partial<FooterColumn>) {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }
  function addColumn() {
    setColumns((prev) => [...prev, { id: `fc-${Math.random().toString(36).slice(2, 6)}`, title: 'New column', links: [] }])
  }

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Site', 'Footer']}
        title="Footer Manager"
        description="Manage footer columns, links, social, legal and copyright — all rendered through the existing public footer."
        actions={<Button size="md" onClick={() => alert('Footer saved (prototype).')}>Save footer</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-[1.2rem] font-semibold text-foreground">Link columns</h2>
            <Button size="sm" onClick={addColumn}><Plus width={15} height={15} /> Add column</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {columns.map((col, ci) => (
              <div key={col.id} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <input
                    value={col.title}
                    onChange={(e) => updateColumn(col.id, { title: e.target.value })}
                    className="flex-1 rounded border border-border bg-background px-2 py-1.5 text-[0.85rem] font-semibold text-foreground outline-none focus:border-foreground/40"
                  />
                  <button type="button" onClick={() => setColumns(move(columns, ci, -1))} disabled={ci === 0} aria-label="Move column left" className="rounded px-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-30">←</button>
                  <button type="button" onClick={() => setColumns(move(columns, ci, 1))} disabled={ci === columns.length - 1} aria-label="Move column right" className="rounded px-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-30">→</button>
                  <PillButton tone="danger" onClick={() => setColumns(columns.filter((c) => c.id !== col.id))}><Trash width={13} height={13} /></PillButton>
                </div>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.id} className="flex items-center gap-2">
                      <input
                        value={link.label}
                        onChange={(e) => updateColumn(col.id, { links: col.links.map((l) => (l.id === link.id ? { ...l, label: e.target.value } : l)) })}
                        className="w-1/2 rounded border border-border bg-background px-2 py-1 text-[0.78rem] text-foreground outline-none focus:border-foreground/40"
                      />
                      <input
                        value={link.url}
                        onChange={(e) => updateColumn(col.id, { links: col.links.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l)) })}
                        className="flex-1 rounded border border-border bg-background px-2 py-1 font-mono text-[0.72rem] text-muted-foreground outline-none focus:border-foreground/40"
                      />
                      <button type="button" aria-label="Remove link" onClick={() => updateColumn(col.id, { links: col.links.filter((l) => l.id !== link.id) })} className="text-muted-foreground hover:text-error">×</button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => updateColumn(col.id, { links: [...col.links, { id: `fl-${Math.random().toString(36).slice(2, 6)}`, label: 'New link', url: '/' }] })}
                  className="mt-2 text-[0.76rem] font-semibold text-primary hover:underline"
                >
                  + Add link
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Panel title="Social links">
            <ul className="space-y-2">
              {social.map((s) => (
                <li key={s.id} className="flex items-center gap-2">
                  <input value={s.label} onChange={(e) => setSocial(social.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)))} className="w-1/3 rounded border border-border bg-background px-2 py-1 text-[0.78rem] text-foreground outline-none focus:border-foreground/40" />
                  <input value={s.url} onChange={(e) => setSocial(social.map((x) => (x.id === s.id ? { ...x, url: e.target.value } : x)))} className="flex-1 rounded border border-border bg-background px-2 py-1 font-mono text-[0.72rem] text-muted-foreground outline-none focus:border-foreground/40" />
                  <button type="button" aria-label="Remove" onClick={() => setSocial(social.filter((x) => x.id !== s.id))} className="text-muted-foreground hover:text-error">×</button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setSocial([...social, { id: `fs-${Math.random().toString(36).slice(2, 6)}`, label: 'New', url: 'https://' }])} className="mt-2 text-[0.76rem] font-semibold text-primary hover:underline">+ Add social</button>
          </Panel>

          <Panel title="Legal links">
            <ul className="space-y-2">
              {legal.map((s) => (
                <li key={s.id} className="flex items-center gap-2">
                  <input value={s.label} onChange={(e) => setLegal(legal.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)))} className="w-1/2 rounded border border-border bg-background px-2 py-1 text-[0.78rem] text-foreground outline-none focus:border-foreground/40" />
                  <input value={s.url} onChange={(e) => setLegal(legal.map((x) => (x.id === s.id ? { ...x, url: e.target.value } : x)))} className="flex-1 rounded border border-border bg-background px-2 py-1 font-mono text-[0.72rem] text-muted-foreground outline-none focus:border-foreground/40" />
                  <button type="button" aria-label="Remove" onClick={() => setLegal(legal.filter((x) => x.id !== s.id))} className="text-muted-foreground hover:text-error">×</button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="General">
            <label className="mb-3 flex items-center gap-2 text-[0.85rem] text-foreground">
              <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} /> Show newsletter block
            </label>
            <Field label="Copyright text" value={copyright} onChange={setCopyright} />
          </Panel>

          <ConceptNote>Changes render through the existing public Footer component. Persistence connects in the backend phase.</ConceptNote>
        </div>
      </div>
    </div>
  )
}
