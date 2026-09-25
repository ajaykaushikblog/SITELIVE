import { useState } from 'react'
import { Button } from '../../ui/primitives'
import { AdminPageHeader, Panel, Field, Textarea, Badge, PillButton, EmptyState } from '../ui'
import {
  taxonomyKinds,
  taxonomyByKind,
  type TaxonomyKind,
  type TaxonomyTerm,
} from '../../../lib/admin/cms'

/* Universal taxonomy manager. One screen manages every taxonomy kind
   (categories, subcategories, occasions, seasons, tags, styles, colors,
   audiences) — hierarchical or flat — and is not hard-coded to any occasion. */

export function Taxonomy({ kind }: { kind: TaxonomyKind }) {
  const def = taxonomyKinds.find((k) => k.id === kind) ?? taxonomyKinds[0]
  const terms = taxonomyByKind[kind]
  const [editing, setEditing] = useState<TaxonomyTerm | null>(terms[0] ?? null)

  const parentName = (id?: string) =>
    id ? taxonomyByKind.category.find((c) => c.id === id)?.name ?? '—' : '—'

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Taxonomy', def.plural]}
        title={def.plural}
        description={
          def.hierarchical
            ? `Hierarchical ${def.label.toLowerCase()} terms with parent/child relationships.`
            : `Flat ${def.label.toLowerCase()} terms applied across all content types.`
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {taxonomyKinds.map((k) => (
          <a
            key={k.id}
            href={`/admin/taxonomy/${k.id === 'category' ? 'categories' : k.id === 'subcategory' ? 'subcategories' : k.id + 's'}`}
            className={`rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition-colors ${
              k.id === kind
                ? 'border-primary bg-primary/12 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-foreground/30'
            }`}
          >
            {k.plural}
          </a>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div>
          {terms.length === 0 ? (
            <EmptyState title={`No ${def.plural.toLowerCase()} yet`} hint="Add your first term using the form." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[520px] text-left text-[0.84rem]">
                <thead className="bg-secondary/60 text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Slug</th>
                    {def.hierarchical && <th className="px-4 py-3 font-semibold">Parent</th>}
                    <th className="px-4 py-3 font-semibold">Content</th>
                    <th className="px-4 py-3 font-semibold">Indexable</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {terms.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setEditing(t)}
                      className={`cursor-pointer border-t border-border transition-colors hover:bg-secondary/40 ${
                        editing?.id === t.id ? 'bg-seasonal-soft/40' : 'bg-card'
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-foreground">{t.name}</td>
                      <td className="px-4 py-3 font-mono text-[0.74rem] text-muted-foreground">{t.slug}</td>
                      {def.hierarchical && <td className="px-4 py-3 text-muted-foreground">{parentName(t.parent)}</td>}
                      <td className="px-4 py-3 text-muted-foreground">{t.count.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Badge
                          label={t.indexable ? 'Indexed' : 'No-index'}
                          tone={t.indexable ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <PillButton onClick={() => setEditing(t)}>Edit</PillButton>
                          <PillButton tone="danger">Delete</PillButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside>
          <Panel title={editing ? `Edit ${def.label.toLowerCase()}` : `New ${def.label.toLowerCase()}`}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <Field key={editing?.id ?? 'new'} label="Name" value={editing?.name} placeholder={`${def.label} name`} />
              <Field label="Slug" mono value={editing?.slug} placeholder="url-slug" />
              {def.hierarchical && kind === 'subcategory' && (
                <label className="block">
                  <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Parent category
                  </span>
                  <select
                    defaultValue={editing?.parent ?? taxonomyByKind.category[0].id}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground outline-none focus:border-foreground/40"
                  >
                    {taxonomyByKind.category.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <Textarea label="Description" rows={3} value={editing?.description} placeholder="Used on archive pages & SEO." />
              <label className="flex items-center gap-2 text-[0.85rem] text-foreground">
                <input type="checkbox" defaultChecked={editing?.indexable ?? true} /> Indexable (allow search engines)
              </label>
              <div className="flex gap-2 pt-1">
                <Button size="md" type="submit">
                  {editing ? 'Save changes' : 'Add term'}
                </Button>
                <Button size="md" variant="outline" type="button" onClick={() => setEditing(null)}>
                  New
                </Button>
              </div>
            </form>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
