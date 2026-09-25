import { useState } from 'react'
import { ChevronDown } from '../../ui/icons'
import { PinterestPreview, SocialPreview } from '../../pinterest'
import { SeoPanel } from '../seo/SeoPanel'
import { InternalLinkAssistant } from '../seo/InternalLinkAssistant'
import { MediaPicker } from '../media/MediaPicker'
import { Select, PillButton, ConceptNote } from '../ui'
import {
  contentType,
  statusMeta,
  statusOrder,
  schemaTypes,
  pinTemplateOptions,
  adminAuthors,
  taxonomyByKind,
  type ContentItem,
} from '../../../lib/admin/cms'
import { timezones, type EditorContent } from '../../../lib/admin/editor'

type Patch = (patch: Partial<EditorContent>) => void

/* Right-hand settings rail — grouped, collapsible panels so the editor isn't a
   wall of fields. Each panel maps to a spec area (Content, Taxonomy, Featured,
   SEO, Pinterest, Social, Publishing) and drives the single EditorContent
   state that the checklist and previews read from. */
export function SettingsRail({ content, patch, item }: { content: EditorContent; patch: Patch; item?: ContentItem }) {
  const def = contentType(content.type)
  const url = `${def.routePrefix}/${content.slug || 'untitled'}`

  return (
    <div className="space-y-3">
      <Section title="Content" defaultOpen>
        <TextAreaInput label="Excerpt" rows={3} placeholder="Short summary for cards & search…" value={content.excerpt} onChange={(v) => patch({ excerpt: v })} />
        <p className="text-[0.72rem] text-muted-foreground">Reading time updates automatically from the content blocks.</p>
      </Section>

      <Section title="Taxonomy">
        <Select label="Category" value={content.taxonomy.category} onChange={(v) => patch({ taxonomy: { ...content.taxonomy, category: v } })} options={taxonomyByKind.category.map((t) => t.name)} />
        <TaxTags label="Subcategories" kind="subcategories" options={taxonomyByKind.subcategory.map((t) => t.name)} content={content} patch={patch} />
        <TaxTags label="Occasions" kind="occasions" options={taxonomyByKind.occasion.map((t) => t.name)} content={content} patch={patch} />
        <TaxTags label="Seasons" kind="seasons" options={taxonomyByKind.season.map((t) => t.name)} content={content} patch={patch} />
        <TaxTags label="Styles" kind="styles" options={taxonomyByKind.style.map((t) => t.name)} content={content} patch={patch} />
        <TaxTags label="Colors" kind="colors" options={taxonomyByKind.color.map((t) => t.name)} content={content} patch={patch} />
        <TaxTags label="Audiences" kind="audiences" options={taxonomyByKind.audience.map((t) => t.name)} content={content} patch={patch} />
        <TextInput label="Tags" value={content.taxonomy.tags.join(', ')} placeholder="comma, separated, tags" onChange={(v) => patch({ taxonomy: { ...content.taxonomy, tags: v.split(',').map((s) => s.trim()).filter(Boolean) } })} />
      </Section>

      <Section title="Featured image">
        <FeaturedImage content={content} patch={patch} />
      </Section>

      <Section title="SEO">
        <SeoPanel defaultTitle={content.seo.title || content.title} url={url} image={content.featuredImage} showPinterest={false} />
        <div className="grid grid-cols-1 gap-3 border-t border-border pt-4">
          <Select label="Schema type" value={content.seo.schema} onChange={(v) => patch({ seo: { ...content.seo, schema: v } })} options={schemaTypes} />
        </div>
        <div className="border-t border-border pt-4">
          <InternalLinkAssistant current={item} />
        </div>
      </Section>

      <Section title="Pinterest">
        <ConceptNote>Configure the primary pin; full multi-pin management lives in Monetization → Pinterest.</ConceptNote>
        <TextInput label="Pin title" value={content.pinterest.title} placeholder="Keyword-rich pin title" onChange={(v) => patch({ pinterest: { ...content.pinterest, title: v } })} />
        <TextAreaInput label="Pin description" rows={3} placeholder="Rich, keyword-forward description…" value={content.pinterest.description} onChange={(v) => patch({ pinterest: { ...content.pinterest, description: v } })} />
        <Select label="Pin template" value={content.pinterest.template} onChange={(v) => patch({ pinterest: { ...content.pinterest, template: v as EditorContent['pinterest']['template'] } })} options={pinTemplateOptions.map((p) => ({ value: p.id, label: p.label }))} />
        <PinImagePicker content={content} patch={patch} />
        <PinterestPreview
          image={content.pinterest.image || content.featuredImage || 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&q=70'}
          title={content.pinterest.title || content.title || 'Your pin title appears here'}
          description={content.pinterest.description || 'Your pin description preview.'}
          template={content.pinterest.template}
          destination={url}
        />
      </Section>

      <Section title="Social sharing">
        <TextInput label="OG title" value={content.social.title} placeholder="Title for social shares" onChange={(v) => patch({ social: { ...content.social, title: v } })} />
        <TextAreaInput label="OG description" rows={3} placeholder="Description for Facebook / X cards…" value={content.social.description} onChange={(v) => patch({ social: { ...content.social, description: v } })} />
        <SocialPreview
          image={content.social.ogImage || content.featuredImage || 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&q=70'}
          title={content.social.title || content.title || 'Social card title'}
          description={content.social.description || 'How this appears when shared on social.'}
          destination={url}
        />
      </Section>

      <Section title="Publishing">
        <Select label="Status" value={content.publishing.status} onChange={(v) => patch({ publishing: { ...content.publishing, status: v as ContentItem['status'] } })} options={statusOrder.map((s) => ({ value: s, label: statusMeta[s].label }))} />
        <Select label="Author" value={content.author} onChange={(v) => patch({ author: v })} options={adminAuthors.map((a) => a.name)} />
        <TextInput label="Publish date" type="datetime-local" value={content.publishing.publishDate} onChange={(v) => patch({ publishing: { ...content.publishing, publishDate: v } })} />
        <Select label="Timezone" value={content.publishing.timezone} onChange={(v) => patch({ publishing: { ...content.publishing, timezone: v } })} options={timezones} />
        <label className="flex items-center gap-2 text-[0.85rem] text-foreground">
          <input type="checkbox" checked={content.publishing.featured} onChange={(e) => patch({ publishing: { ...content.publishing, featured: e.target.checked } })} /> Featured content
        </label>
      </Section>
    </div>
  )
}

/* Controlled labeled inputs (the shared Field/Textarea primitives are
   uncontrolled, so we use these to drive EditorContent state + the checklist). */
const ctrlCls = 'w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40'
const labelCls = 'mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground'

function TextInput({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={ctrlCls} />
    </label>
  )
}

function TextAreaInput({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${ctrlCls} resize-y leading-relaxed`} />
    </label>
  )
}

/* Collapsible panel */
function Section({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left" aria-expanded={open}>
        <span className="text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-foreground">{title}</span>
        <ChevronDown width={16} height={16} className={`text-muted-foreground transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="space-y-3 border-t border-border px-4 py-4">{children}</div>}
    </div>
  )
}

function TaxTags({ label, kind, options, content, patch }: { label: string; kind: keyof EditorContent['taxonomy']; options: string[]; content: EditorContent; patch: Patch }) {
  const selected = new Set((content.taxonomy[kind] as string[]) ?? [])
  const toggle = (o: string) => {
    const next = new Set(selected)
    next.has(o) ? next.delete(o) : next.add(o)
    patch({ taxonomy: { ...content.taxonomy, [kind]: [...next] } })
  }
  return (
    <div>
      <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => toggle(o)}
            className={`rounded-full border px-2.5 py-1 text-[0.74rem] font-medium transition ${selected.has(o) ? 'border-primary bg-primary/12 text-primary' : 'border-border bg-background text-muted-foreground hover:border-foreground/30'}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

function FeaturedImage({ content, patch }: { content: EditorContent; patch: Patch }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      {content.featuredImage ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <img src={content.featuredImage} alt="" className="aspect-[16/9] w-full object-cover" />
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="flex aspect-[16/9] w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 text-[0.82rem] font-semibold text-foreground hover:border-foreground/30">
          Select featured image
        </button>
      )}
      <div className="mt-2 flex gap-2">
        <PillButton onClick={() => setOpen(true)}>{content.featuredImage ? 'Replace' : 'Choose'}</PillButton>
        {content.featuredImage && <PillButton tone="danger" onClick={() => patch({ featuredImage: '' })}>Remove</PillButton>}
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} title="Featured image" onInsert={(items) => items[0] && patch({ featuredImage: items[0].url })} />
    </div>
  )
}

function PinImagePicker({ content, patch }: { content: EditorContent; patch: Patch }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex gap-2">
      <PillButton onClick={() => setOpen(true)}>{content.pinterest.image ? 'Replace pin image' : 'Select pin image'}</PillButton>
      {content.pinterest.image && <PillButton tone="danger" onClick={() => patch({ pinterest: { ...content.pinterest, image: '' } })}>Remove</PillButton>}
      <MediaPicker open={open} onClose={() => setOpen(false)} title="Pinterest image (2:3)" onInsert={(items) => items[0] && patch({ pinterest: { ...content.pinterest, image: items[0].url } })} />
    </div>
  )
}
