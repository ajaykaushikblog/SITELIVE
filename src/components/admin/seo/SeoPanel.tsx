import { useState } from 'react'
import { Field, Textarea, Select } from '../ui'
import { GooglePreview, ValidationMeter } from './SeoPreviews'
import { SocialPreview, PinterestPreview } from '../../pinterest'
import { pinTemplateOptions } from '../../../lib/admin/cms'
import { TITLE_RANGE, META_RANGE } from '../../../lib/admin/seo'

/* =========================================================================
   Universal SEO editor panel — reused by every content type and taxonomy /
   author landing page. Metadata, robots, canonical, sitemap and breadcrumb
   controls plus live Google / Social / Pinterest previews and validation.
   ========================================================================= */

export function SeoPanel({
  defaultTitle = '',
  defaultDescription = '',
  url,
  image,
  showPinterest = true,
}: {
  defaultTitle?: string
  defaultDescription?: string
  url: string
  image?: string
  showPinterest?: boolean
}) {
  const [title, setTitle] = useState(defaultTitle)
  const [description, setDescription] = useState(defaultDescription)
  const [index, setIndex] = useState<'index' | 'noindex'>('index')
  const [follow, setFollow] = useState<'follow' | 'nofollow'>('follow')
  const [canonicalMode, setCanonicalMode] = useState<'auto' | 'custom'>('auto')
  const [customCanonical, setCustomCanonical] = useState('')

  const robotsSummary = `${index}, ${follow}`
  const canonicalWarning =
    canonicalMode === 'custom' && customCanonical && !/^https?:\/\/|^\//.test(customCanonical.trim())
      ? 'Canonical does not look like a valid URL.'
      : canonicalMode === 'custom' && customCanonical.trim() && !customCanonical.includes(url)
        ? 'Canonical points to a different URL than this page.'
        : null

  const fallback = image ?? 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&q=70'

  return (
    <div className="space-y-5">
      {/* Metadata + validation */}
      <div>
        <label className="block">
          <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            SEO title
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Keyword-rich page title"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40"
          />
        </label>
        <ValidationMeter value={title} range={TITLE_RANGE} label="title length" />
      </div>

      <div>
        <label className="block">
          <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Meta description
          </span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Compelling summary shown in search results…"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40"
          />
        </label>
        <ValidationMeter value={description} range={META_RANGE} label="description length" />
      </div>

      {/* Canonical */}
      <div className="space-y-2.5 rounded-lg border border-border bg-secondary/30 p-3.5">
        <Select
          label="Canonical URL"
          value={canonicalMode}
          onChange={(v) => setCanonicalMode(v as 'auto' | 'custom')}
          options={[
            { value: 'auto', label: 'Auto-generated (self-referencing)' },
            { value: 'custom', label: 'Custom canonical' },
          ]}
        />
        {canonicalMode === 'auto' ? (
          <p className="font-mono text-[0.74rem] text-muted-foreground">{url}</p>
        ) : (
          <input
            value={customCanonical}
            onChange={(e) => setCustomCanonical(e.target.value)}
            placeholder="https://marigoldandmaple.com/…"
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-[0.78rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40"
          />
        )}
        {canonicalWarning && <p className="text-[0.72rem] font-semibold text-warning">⚠ {canonicalWarning}</p>}
      </div>

      {/* Robots */}
      <div className="space-y-2.5 rounded-lg border border-border bg-secondary/30 p-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Indexing"
            value={index}
            onChange={(v) => setIndex(v as 'index' | 'noindex')}
            options={[
              { value: 'index', label: 'Index' },
              { value: 'noindex', label: 'Noindex' },
            ]}
          />
          <Select
            label="Following"
            value={follow}
            onChange={(v) => setFollow(v as 'follow' | 'nofollow')}
            options={[
              { value: 'follow', label: 'Follow' },
              { value: 'nofollow', label: 'Nofollow' },
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-3 text-[0.78rem] text-muted-foreground">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" /> Noarchive
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" /> Nosnippet
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" /> Noimageindex
          </label>
        </div>
        <p className="text-[0.72rem] text-muted-foreground">
          Robots summary: <span className="font-mono font-semibold text-foreground">{robotsSummary}</span>
        </p>
      </div>

      {/* Sitemap + URLs */}
      <label className="flex items-center gap-2 text-[0.85rem] text-foreground">
        <input type="checkbox" defaultChecked={index === 'index'} /> Include in XML sitemap
      </label>
      <Field label="Primary URL" mono value={url} />
      <Field label="Breadcrumb title" placeholder="Short label for breadcrumbs" />

      {/* Live previews */}
      <div className="space-y-4 pt-1">
        <GooglePreview title={title} description={description} url={url} />
        <SocialPreview title={title || 'Social card title'} description={description} image={fallback} destination={url} />
        {showPinterest && (
          <PinterestPreview
            title={title || 'Pin title'}
            description={description || 'Pin description'}
            image={fallback}
            template={pinTemplateOptions[0].id}
            destination={url}
          />
        )}
      </div>
    </div>
  )
}
