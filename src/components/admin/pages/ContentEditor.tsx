import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '../../ui/primitives'
import { Copy, Clock } from '../../ui/icons'
import { AdminPageHeader, Badge, ConceptNote } from '../ui'
import { BlockList } from '../editor/BlockList'
import { SettingsRail } from '../editor/SettingsRail'
import { PrePublishDialog, RevisionsDialog, PreviewDialog } from '../editor/EditorExtras'
import { RecipeSections } from '../editor/specialized/RecipeSections'
import { DiySections } from '../editor/specialized/DiySections'
import { RecipePreviewDialog, DiyPreviewDialog } from '../editor/specialized/SpecPreview'
import { MonetizationOverrides } from '../monetization/MonetizationOverrides'
import {
  contentType,
  contentTypes,
  statusMeta,
  taxonomyByKind,
  type ContentItem,
  type ContentTypeId,
} from '../../../lib/admin/cms'
import {
  makeBlock,
  buildToc,
  wordCount,
  readingTime,
  saveStateMeta,
  type ContentBlock,
  type EditorContent,
  type SaveState,
} from '../../../lib/admin/editor'
import {
  emptyRecipeData,
  emptyDiyData,
  recipeChecklist,
  diyChecklist,
  toChecklistItems,
} from '../../../lib/admin/specialized'
import { apiConfigured } from '../../../lib/api/client'
import { contentApi } from '../../../lib/api/endpoints'

/* Map the editor's rich EditorContent into the backend upsert body. The deep,
   type-specific structures ride along in `detail` (JSONB on content_items). */
function editorToApiBody(c: EditorContent) {
  return {
    type: c.type,
    title: c.title,
    slug: c.slug,
    excerpt: c.excerpt,
    status: c.publishing.status,
    authorName: c.author,
    featuredImage: c.featuredImage,
    category: c.taxonomy.category,
    subcategories: c.taxonomy.subcategories,
    occasions: c.taxonomy.occasions,
    seasons: c.taxonomy.seasons,
    tags: c.taxonomy.tags,
    styles: c.taxonomy.styles,
    colors: c.taxonomy.colors,
    audiences: c.taxonomy.audiences,
    featured: c.publishing.featured,
    detail: {
      blocks: c.blocks,
      seo: c.seo,
      pinterest: c.pinterest,
      social: c.social,
      relatedContent: c.relatedContent,
      recipeData: c.recipeData ?? null,
      diyData: c.diyData ?? null,
    } as Record<string, unknown>,
  }
}

/* =========================================================================
   Advanced Universal Content Editor (Phase 14)
   A block-based editor that works for every content type (Articles,
   Listicles, Guides, Product Guides, …) off one EditorContent model.
   Layout: main block canvas + collapsible settings rail + sticky top bar.
   This is a front-end prototype — autosave/publish are simulated state
   transitions, never fake network writes.
   ========================================================================= */

const slugify = (s: string) => s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60)

function starterBlocks(): ContentBlock[] {
  const intro = makeBlock('paragraph', 0)
  intro.data.text = ''
  const heading = makeBlock('heading', 1)
  return [intro, heading]
}

function initContent(typeId: ContentTypeId, item?: ContentItem): EditorContent {
  const base = `${contentType(typeId).routePrefix}/${item?.slug ?? 'untitled'}`
  return {
    id: item?.id ?? `new-${Date.now().toString(36)}`,
    type: typeId,
    title: item?.title ?? '',
    slug: item?.slug ?? '',
    excerpt: '',
    blocks: starterBlocks(),
    featuredImage: item?.featuredImage ?? '',
    author: item?.author ?? '',
    taxonomy: {
      category: item?.category ?? taxonomyByKind.category[0].name,
      subcategories: item?.subcategories ?? [],
      occasions: item?.occasions ?? [],
      seasons: item?.seasons ?? [],
      tags: item?.tags ?? [],
      styles: item?.styles ?? [],
      colors: item?.colors ?? [],
      audiences: item?.audiences ?? [],
    },
    publishing: {
      status: item?.status ?? 'draft',
      publishDate: '',
      updatedDate: item?.updatedDate ?? '',
      timezone: 'America/New_York',
      featured: item?.featured ?? false,
    },
    seo: { title: '', description: '', canonical: base, index: true, follow: true, sitemap: true, schema: 'Article' },
    pinterest: { title: '', description: '', image: '', template: 'standard', saveButton: true },
    social: { title: '', description: '', ogImage: '', twitterImage: '' },
    relatedContent: [],
    recipeData: typeId === 'recipe' ? emptyRecipeData() : undefined,
    diyData: typeId === 'diy' ? emptyDiyData() : undefined,
  }
}

export function ContentEditor({ item, typeId, itemId }: { item?: ContentItem; typeId: ContentTypeId; itemId?: string }) {
  const isNew = !item && !itemId
  const [content, setContent] = useState<EditorContent>(() => initContent(typeId, item))
  const def = contentType(content.type)
  const [save, setSave] = useState<SaveState>('saved')
  const [slugEdited, setSlugEdited] = useState(!!item?.slug)
  const [dialog, setDialog] = useState<null | 'publish' | 'revisions' | 'preview'>(null)
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const dirtyRef = useRef(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Backend row id. A UUID means the row already exists (edit); otherwise the
  // first persist creates it (POST) and we capture the returned id for updates.
  const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(v)
  const serverIdRef = useRef<string | null>(itemId ?? (isUuid(item?.id) ? item!.id : null))

  // Hydrate from the backend when editing a DB-backed row by id. The deep
  // structures live in `detail`; taxonomy/meta come from the columns.
  useEffect(() => {
    if (!apiConfigured || !itemId) return
    let active = true
    contentApi
      .get(itemId)
      .then((a) => {
        if (!active) return
        const detail = (a.detail ?? {}) as Record<string, unknown>
        setContent((c) => ({
          ...c,
          id: a.id,
          type: (a.type as ContentTypeId) ?? c.type,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt ?? '',
          featuredImage: a.featuredImage ?? '',
          author: a.authorName ?? '',
          blocks: (detail.blocks as EditorContent['blocks']) ?? c.blocks,
          taxonomy: {
            category: a.category ?? c.taxonomy.category,
            subcategories: a.subcategories ?? [],
            occasions: a.occasions ?? [],
            seasons: a.seasons ?? [],
            tags: a.tags ?? [],
            styles: a.styles ?? [],
            colors: a.colors ?? [],
            audiences: a.audiences ?? [],
          },
          publishing: { ...c.publishing, status: (a.status as EditorContent['publishing']['status']) ?? c.publishing.status, featured: a.featured ?? false },
          seo: (detail.seo as EditorContent['seo']) ?? c.seo,
          pinterest: (detail.pinterest as EditorContent['pinterest']) ?? c.pinterest,
          social: (detail.social as EditorContent['social']) ?? c.social,
          relatedContent: (detail.relatedContent as string[]) ?? c.relatedContent,
          recipeData: (detail.recipeData as EditorContent['recipeData']) ?? c.recipeData,
          diyData: (detail.diyData as EditorContent['diyData']) ?? c.diyData,
        }))
        setSave('saved')
        dirtyRef.current = false
      })
      .catch(() => {})
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId])

  /* Persist to the real backend. Returns true on success. Creating vs updating
     is decided by whether we already hold a server id. */
  const persist = async (next: EditorContent): Promise<boolean> => {
    const body = editorToApiBody(next)
    try {
      if (serverIdRef.current) {
        await contentApi.update(serverIdRef.current, body)
      } else {
        const created = await contentApi.create(body)
        serverIdRef.current = created.id
      }
      setSaveError(null)
      return true
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
      return false
    }
  }

  const patch = (p: Partial<EditorContent>) => {
    setContent((c) => ({ ...c, ...p }))
    dirtyRef.current = true
    setSave('unsaved')
  }

  // Title drives the slug until the editor overrides it manually.
  const setTitle = (title: string) => patch(slugEdited ? { title } : { title, slug: slugify(title) })

  // Autosave: after edits settle, persist to the backend when a real API is
  // configured; otherwise fall back to the simulated state transition so the
  // prototype behaves exactly as before.
  useEffect(() => {
    if (save !== 'unsaved') return
    const t = setTimeout(() => {
      setSave('saving')
      if (apiConfigured) {
        void persist(content).then((ok) => {
          setSave(ok ? 'saved' : 'unsaved')
          if (ok) dirtyRef.current = false
        })
        return
      }
      const t2 = setTimeout(() => { setSave('saved'); dirtyRef.current = false }, 600)
      return () => clearTimeout(t2)
    }, 1200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save, content])

  // Unsaved-changes warning on tab close / reload.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => { if (dirtyRef.current) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  const toc = useMemo(() => buildToc(content.blocks), [content.blocks])
  const words = useMemo(() => wordCount(content.blocks), [content.blocks])
  const meta = saveStateMeta[save]

  const isRecipe = !!content.recipeData
  const isDiy = !!content.diyData
  const specialized = isRecipe || isDiy
  // Recipe/DIY editors foreground their structured details; the universal
  // blocks stay available under a second tab (§34 universal compatibility).
  const [mainTab, setMainTab] = useState<'details' | 'blocks'>(specialized ? 'details' : 'blocks')

  const specExtra = useMemo(() => {
    if (isRecipe && content.recipeData) return toChecklistItems(recipeChecklist(content.recipeData))
    if (isDiy && content.diyData) return toChecklistItems(diyChecklist(content.diyData))
    return []
  }, [isRecipe, isDiy, content.recipeData, content.diyData])

  const duplicate = () => {
    patch({ title: `${content.title} (copy)`, slug: slugify(`${content.title}-copy`), publishing: { ...content.publishing, status: 'draft' } })
    setDialog(null)
  }

  // Content-type conversion (§35): never discards existing content; adds/removes
  // the specialized structures and warns that specialized fields may need work.
  const convertTo = (target: ContentTypeId) => {
    if (target === content.type) return
    const ok = window.confirm(
      `Convert to ${contentType(target).label}? Your title, content blocks, taxonomy, SEO, Pinterest and social settings are kept. ${target === 'recipe' || target === 'diy' ? 'Specialized fields will be added and may need to be completed.' : 'Specialized recipe/DIY fields will be set aside.'}`,
    )
    if (!ok) return
    patch({
      type: target,
      recipeData: target === 'recipe' ? content.recipeData ?? emptyRecipeData() : undefined,
      diyData: target === 'diy' ? content.diyData ?? emptyDiyData() : undefined,
    })
    setMainTab(target === 'recipe' || target === 'diy' ? 'details' : 'blocks')
  }

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Content', isNew ? `New ${def.label}` : 'Edit']}
        title={isNew ? `New ${def.label}` : content.title || 'Untitled'}
        actions={
          <>
            <span className={`hidden text-[0.78rem] font-medium sm:inline ${meta.tone}`}>{meta.label}</span>
            <Badge label={statusMeta[content.publishing.status].label} tone={statusMeta[content.publishing.status].tone} />
            <Button size="md" variant="outline" onClick={() => setDialog('preview')}>Preview</Button>
            <Button size="md" onClick={() => setDialog('publish')}>{content.publishing.status === 'published' ? 'Update' : 'Publish'}</Button>
          </>
        }
      />

      {/* Secondary toolbar: type + stats + doc actions */}
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-card px-4 py-2.5 text-[0.78rem] text-muted-foreground">
        <span className="font-semibold uppercase tracking-[0.12em] text-foreground">{def.label}</span>
        <span>{words.toLocaleString()} words</span>
        <span className="flex items-center gap-1"><Clock width={13} height={13} /> {readingTime(content.blocks)} min read</span>
        <span>{content.blocks.length} blocks</span>
        <div className="ml-auto flex items-center gap-1.5">
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Convert content type</span>
            <select value={content.type} onChange={(e) => convertTo(e.target.value as ContentTypeId)} className="rounded-md border border-border bg-background px-2 py-1 text-[0.76rem] text-foreground" aria-label="Convert content type" title="Convert content type">
              {contentTypes.map((t) => <option key={t.id} value={t.id}>Type: {t.label}</option>)}
            </select>
          </label>
          <button type="button" onClick={duplicate} className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-secondary hover:text-foreground"><Copy width={13} height={13} /> Duplicate</button>
          <button type="button" onClick={() => setDialog('revisions')} className="rounded-md px-2 py-1 hover:bg-secondary hover:text-foreground">History</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        {/* ---- Main editing canvas ---- */}
        <div className="min-w-0">
          <div className="rounded-xl border border-border bg-card p-5">
            <input
              value={content.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${def.label} title`}
              className="w-full bg-transparent font-serif text-[1.7rem] font-semibold text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-2 flex items-center gap-1.5 font-mono text-[0.75rem] text-muted-foreground">
              <span>{def.routePrefix}/</span>
              <input
                value={content.slug}
                onChange={(e) => { setSlugEdited(true); patch({ slug: slugify(e.target.value) }) }}
                placeholder="untitled"
                className="flex-1 bg-transparent text-foreground outline-none"
                aria-label="URL slug"
              />
            </div>
          </div>

          {/* Specialized editors get a tab switch between structured details and universal blocks */}
          {specialized && (
            <div className="mt-4 flex gap-1.5" role="tablist" aria-label="Editor sections">
              <TabBtn active={mainTab === 'details'} onClick={() => setMainTab('details')}>{isRecipe ? 'Recipe details' : 'Project details'}</TabBtn>
              <TabBtn active={mainTab === 'blocks'} onClick={() => setMainTab('blocks')}>Content blocks</TabBtn>
            </div>
          )}

          {specialized && mainTab === 'details' ? (
            <div className="mt-4">
              {isRecipe && content.recipeData && (
                <>
                  <RecipeSections data={content.recipeData} onChange={(recipeData) => patch({ recipeData })} />
                  <div className="mt-3"><Button size="md" variant="outline" onClick={() => setDialog('preview')}>Recipe preview</Button></div>
                </>
              )}
              {isDiy && content.diyData && (
                <>
                  <DiySections data={content.diyData} onChange={(diyData) => patch({ diyData })} />
                  <div className="mt-3"><Button size="md" variant="outline" onClick={() => setDialog('preview')}>DIY preview</Button></div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Auto table of contents */}
              {toc.length > 1 && (
                <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4">
                  <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Table of contents (auto)</p>
                  <ol className="space-y-0.5">
                    {toc.map((t) => <li key={t.id} className={`text-[0.82rem] text-foreground ${t.level === 3 ? 'pl-4 text-muted-foreground' : ''}`}>{t.text || <span className="italic text-muted-foreground">Untitled heading</span>}</li>)}
                  </ol>
                </div>
              )}
              <div className="mt-4">
                <BlockList blocks={content.blocks} onChange={(blocks) => patch({ blocks })} />
              </div>
            </>
          )}

          <div className="mt-4">
            <MonetizationOverrides />
          </div>

          <div className="mt-4">
            <ConceptNote>
              {apiConfigured
                ? 'Connected to the live backend — autosave and publish write to PostgreSQL via /api/content.'
                : 'Prototype mode — set VITE_API_BASE_URL to persist content to the backend. Autosave/publish are simulated here.'}
            </ConceptNote>
            {saveError && <p className="mt-2 text-[0.8rem] text-error">Save failed: {saveError}</p>}
          </div>
        </div>

        {/* ---- Settings rail ---- */}
        <aside className="min-w-0">
          <div className="lg:sticky lg:top-4">
            <SettingsRail content={content} patch={patch} item={item} />
          </div>
        </aside>
      </div>

      {dialog === 'publish' && <PrePublishDialog content={content} extra={specExtra} onClose={() => setDialog(null)} onPublish={() => {
        const published = { ...content, publishing: { ...content.publishing, status: 'published' as const } }
        setContent(published)
        setDialog(null)
        if (apiConfigured) {
          setSave('saving')
          void persist(published).then((ok) => { setSave(ok ? 'saved' : 'unsaved'); if (ok) dirtyRef.current = false })
        }
      }} />}
      {dialog === 'revisions' && <RevisionsDialog onClose={() => setDialog(null)} />}
      {dialog === 'preview' && isRecipe && content.recipeData && <RecipePreviewDialog content={content} data={content.recipeData} onClose={() => setDialog(null)} />}
      {dialog === 'preview' && isDiy && content.diyData && <DiyPreviewDialog content={content} data={content.diyData} onClose={() => setDialog(null)} />}
      {dialog === 'preview' && !specialized && <PreviewDialog content={content} device={device} setDevice={setDevice} onClose={() => setDialog(null)} />}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick}
      className={`rounded-lg px-3.5 py-1.5 text-[0.82rem] font-semibold transition ${active ? 'bg-foreground text-background' : 'border border-border bg-card text-muted-foreground hover:text-foreground'}`}>
      {children}
    </button>
  )
}
