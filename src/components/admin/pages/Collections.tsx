import { useState } from 'react'
import { Button } from '../../ui/primitives'
import { AdminPageHeader, Panel, Field, Textarea, Select, Tabs, Badge, PillButton, StatCard, EmptyState } from '../ui'
import { ContentPicker } from '../site/ContentPicker'
import { SeoPanel } from '../seo/SeoPanel'
import { PinterestPreview } from '../../pinterest'
import { Plus } from '../../ui/icons'
import {
  collections,
  collectionTypes,
  collectionStatusMeta,
  contentLabel,
  SITE_URL,
  type Collection,
  type CollectionType,
} from '../../../lib/admin/site'

/* =========================================================================
   Phase 16 — Collections (/admin/content/collections).

   Editorial groups of content reusable across the homepage, category pages,
   seasonal pages, newsletters and Pinterest. A content item can belong to
   many collections. Each collection carries its own SEO (Phase 12) and
   Pinterest (Phase 9) settings — temporary campaigns default to noindex.
   ========================================================================= */

export function Collections() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const editing = collections.find((c) => c.id === editingId) ?? null

  if (editing) return <CollectionEditor collection={editing} onBack={() => setEditingId(null)} />

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Content', 'Collections']}
        title="Collections"
        description="Curate editorial groups once, then reuse them anywhere — homepage sections, category pages, seasonal pages and Pinterest."
        actions={collections.length > 0 && <Button size="md" onClick={() => setEditingId(collections[0].id)}><Plus width={15} height={15} /> New collection</Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Collections" value={collections.length} />
        <StatCard label="Published" value={collections.filter((c) => c.status === 'published').length} />
        <StatCard label="Scheduled" value={collections.filter((c) => c.status === 'scheduled').length} />
        <StatCard label="Drafts" value={collections.filter((c) => c.status === 'draft').length} tone="muted" />
      </div>

      {collections.length === 0 ? (
        <EmptyState
          title="No collections yet"
          hint="Curate an editorial group of content to reuse across the homepage, category pages and Pinterest."
        />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setEditingId(c.id)}
            className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-foreground/40"
          >
            <div className="relative aspect-[16/9] bg-secondary">
              <img src={c.coverImage} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute left-3 top-3 flex gap-1.5">
                <Badge label={collectionStatusMeta[c.status].label} tone={collectionStatusMeta[c.status].tone} />
                <Badge label={collectionTypes.find((t) => t.id === c.type)?.label ?? c.type} tone="bg-background/85 text-foreground" />
              </div>
              {!c.seo.indexable && (
                <span className="absolute right-3 top-3 rounded-full bg-foreground/80 px-2 py-0.5 text-[0.65rem] font-semibold text-background">noindex</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-serif text-[1.15rem] font-semibold text-foreground">{c.name}</h3>
              <p className="mt-1 line-clamp-2 text-[0.8rem] text-muted-foreground">{c.description}</p>
              <p className="mt-2.5 text-[0.72rem] text-muted-foreground">
                {c.contentIds.length} items · /collections/{c.slug}
              </p>
            </div>
          </button>
        ))}
      </div>
      )}
    </div>
  )
}

/* --------------------------- Editor --------------------------- */
type Tab = 'content' | 'details' | 'seo' | 'pinterest'
const tabs: { id: Tab; label: string }[] = [
  { id: 'content', label: 'Content' },
  { id: 'details', label: 'Details' },
  { id: 'seo', label: 'SEO' },
  { id: 'pinterest', label: 'Pinterest' },
]

function CollectionEditor({ collection, onBack }: { collection: Collection; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('content')
  const [name, setName] = useState(collection.name)
  const [slug, setSlug] = useState(collection.slug)
  const [type, setType] = useState<CollectionType>(collection.type)
  const [contentIds, setContentIds] = useState<string[]>(collection.contentIds)
  const cover = collection.coverImage

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Content', 'Collections', name]}
        title={name || 'Untitled collection'}
        description={`Public URL: /collections/${slug}`}
        actions={
          <>
            <Button variant="outline" size="md" onClick={onBack}>Back</Button>
            <a href={`/collections/${slug}`} target="_blank" className="rounded-md border border-border px-3 py-2 text-[0.82rem] font-semibold text-foreground hover:bg-secondary">View</a>
            <Button size="md" onClick={() => alert('Collection saved (prototype).')}>Save collection</Button>
          </>
        }
      />

      <div className="mb-6">
        <Tabs tabs={tabs} active={tab} onChange={(t) => setTab(t as Tab)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div>
          {tab === 'content' && (
            <Panel title={`Content (${contentIds.length}) — manual order`}>
              <p className="mb-4 text-[0.8rem] text-muted-foreground">
                Add articles, recipes, DIY, guides, listicles and product guides. Use Move up / Move down (or remove) to
                order — this order is what the public collection page shows.
              </p>
              <ContentPicker selected={contentIds} onChange={setContentIds} />
            </Panel>
          )}

          {tab === 'details' && (
            <Panel title="Collection details">
              <div className="space-y-4">
                <Field label="Name" value={name} onChange={setName} />
                <Field label="Slug" mono value={slug} onChange={setSlug} hint={`${SITE_URL}/collections/${slug}`} />
                <Textarea label="Description" rows={3} value={collection.description} />
                <Select label="Collection type" value={type} options={collectionTypes.map((t) => ({ value: t.id, label: t.label }))} onChange={(v) => setType(v as CollectionType)} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start date" type="date" value={collection.startDate} />
                  <Field label="End date" type="date" value={collection.endDate} />
                </div>
                <Select label="Status" value={collection.status} options={Object.entries(collectionStatusMeta).map(([id, m]) => ({ value: id, label: m.label }))} />
                <div>
                  <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Cover image</span>
                  <img src={cover} alt="" className="aspect-[16/9] w-full rounded-lg border border-border object-cover" />
                  <PillButton>Change cover (media library)</PillButton>
                </div>
              </div>
            </Panel>
          )}

          {tab === 'seo' && (
            <SeoPanel
              defaultTitle={collection.seo.title ?? name}
              defaultDescription={collection.seo.description ?? collection.description}
              url={`${SITE_URL}/collections/${slug}`}
              image={cover}
            />
          )}

          {tab === 'pinterest' && (
            <Panel title="Pinterest settings">
              <label className="mb-4 flex items-center gap-2 text-[0.85rem] text-foreground">
                <input type="checkbox" defaultChecked={collection.pinterest.pinReady} /> Pinterest-ready cover image
              </label>
              <Field label="Pin title" value={collection.pinterest.pinTitle ?? name} />
              <div className="mt-4">
                <Textarea label="Pin description" rows={3} value={collection.pinterest.pinDescription ?? collection.description} />
              </div>
              <p className="mt-4 mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Preview</p>
              <PinterestPreview title={collection.pinterest.pinTitle ?? name} description={collection.description} image={cover} template="standard" destination={`${SITE_URL}/collections/${slug}`} />
            </Panel>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Panel title="Summary">
            <dl className="space-y-2.5 text-[0.82rem]">
              <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd><Badge label={collectionStatusMeta[collection.status].label} tone={collectionStatusMeta[collection.status].tone} /></dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Type</dt><dd className="font-medium text-foreground">{collectionTypes.find((t) => t.id === type)?.label}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Items</dt><dd className="font-medium text-foreground">{contentIds.length}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Indexable</dt><dd className="font-medium text-foreground">{collection.seo.indexable ? 'Yes' : 'No (noindex)'}</dd></div>
            </dl>
          </Panel>
          <Panel title="Items in order">
            <ol className="space-y-1.5 text-[0.8rem]">
              {contentIds.map((id, i) => (
                <li key={id} className="flex gap-2 text-muted-foreground">
                  <span className="font-semibold text-foreground">{i + 1}.</span> {contentLabel(id)}
                </li>
              ))}
              {contentIds.length === 0 && <li className="text-muted-foreground">No items yet.</li>}
            </ol>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
