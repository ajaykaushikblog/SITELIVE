/* =========================================================================
   Phase 14 — Universal Content Editor data architecture (front-end prototype).

   A block-based, type-agnostic editorial model. The SAME editor powers every
   content type (article, listicle, guide, product guide, and future types);
   specialized editors extend this rather than forking it. Nothing here is
   hard-coded to "blog article" fields — content lives in ordered blocks with
   typed data, and settings live in reusable panels.

   All persistence (autosave, revisions, scheduling, publishing) is UI-state
   only; real storage arrives in the backend phase.
   ========================================================================= */

import type { ContentTypeId, ContentStatus } from './cms'
import type { PinTemplateId } from '../pinterest'
import type { RecipeData, DiyData } from './specialized'

/* ---- Block system ---- */
export type BlockType =
  | 'paragraph' | 'heading' | 'subheading' | 'quote'
  | 'ordered-list' | 'unordered-list' | 'checklist'
  | 'image' | 'gallery' | 'video'
  | 'callout' | 'table' | 'divider' | 'button' | 'embed'
  | 'product' | 'affiliate' | 'sponsored' | 'advertisement'
  | 'newsletter' | 'recipe' | 'related' | 'author-box' | 'pinterest' | 'social-share'

export type CalloutStyle = 'tip' | 'note' | 'important' | 'recipe-tip' | 'diy-tip' | 'editors-note'
export type Alignment = 'left' | 'center' | 'right'
export type ImageSize = 'small' | 'medium' | 'large' | 'full'

/** Per-block data — loosely typed so one model spans every block. */
export type BlockData = {
  text?: string
  level?: 2 | 3
  items?: string[]
  checked?: boolean[]
  // media
  imageUrl?: string
  alt?: string
  caption?: string
  align?: Alignment
  size?: ImageSize
  href?: string
  pinnable?: boolean
  imageUrls?: string[]
  galleryLayout?: 'grid' | 'masonry' | 'carousel'
  videoUrl?: string
  poster?: string
  a11y?: string
  // editorial
  calloutStyle?: CalloutStyle
  title?: string
  rows?: string[][]
  headerRow?: boolean
  label?: string
  // monetization
  productName?: string
  price?: string
  merchant?: string
  affiliateUrl?: string
  cta?: string
  disclosure?: string
  adSlotId?: string
  placement?: string
  brand?: string
  logoUrl?: string
  destination?: string
  // content
  relatedMode?: 'auto' | 'manual'
  relatedIds?: string[]
  // pinterest
  pinTitle?: string
  pinDescription?: string
  template?: PinTemplateId
}

export type ContentBlock = {
  id: string
  type: BlockType
  data: BlockData
  order: number
}

/* ---- Reusable ContentItem model (editor-side, richer than the table row) ---- */
export type EditorContent = {
  id: string
  type: ContentTypeId
  title: string
  slug: string
  excerpt: string
  blocks: ContentBlock[]
  featuredImage: string
  author: string
  taxonomy: {
    category: string
    subcategories: string[]
    occasions: string[]
    seasons: string[]
    tags: string[]
    styles: string[]
    colors: string[]
    audiences: string[]
  }
  publishing: {
    status: ContentStatus
    publishDate: string
    updatedDate: string
    timezone: string
    featured: boolean
  }
  seo: { title: string; description: string; canonical: string; index: boolean; follow: boolean; sitemap: boolean; schema: string }
  pinterest: { title: string; description: string; image: string; template: PinTemplateId; saveButton: boolean }
  social: { title: string; description: string; ogImage: string; twitterImage: string }
  relatedContent: string[]
  /* Specialized structures (Phase 15) — present only for their content type,
     kept separate from the universal fields above. */
  recipeData?: RecipeData
  diyData?: DiyData
}

/* ---- Add-block menu: grouped catalog (not hundreds of blocks) ---- */
export type BlockDef = { type: BlockType; label: string; icon: string; hint: string }
export type BlockGroup = { title: string; blocks: BlockDef[] }

export const blockCatalog: BlockGroup[] = [
  {
    title: 'Text',
    blocks: [
      { type: 'paragraph', label: 'Paragraph', icon: '¶', hint: 'Body copy' },
      { type: 'heading', label: 'Heading', icon: 'H2', hint: 'Section heading' },
      { type: 'subheading', label: 'Subheading', icon: 'H3', hint: 'Sub-section' },
      { type: 'quote', label: 'Quote', icon: '❝', hint: 'Pull quote' },
      { type: 'unordered-list', label: 'List', icon: '•', hint: 'Bulleted list' },
      { type: 'ordered-list', label: 'Numbered list', icon: '1.', hint: 'Ordered list' },
      { type: 'checklist', label: 'Checklist', icon: '☑', hint: 'To-do style' },
    ],
  },
  {
    title: 'Media',
    blocks: [
      { type: 'image', label: 'Image', icon: '▣', hint: 'From media library' },
      { type: 'gallery', label: 'Gallery', icon: '▦', hint: 'Multiple images' },
      { type: 'video', label: 'Video', icon: '▷', hint: 'Embedded video' },
    ],
  },
  {
    title: 'Editorial',
    blocks: [
      { type: 'callout', label: 'Callout', icon: '!', hint: 'Tip / note box' },
      { type: 'table', label: 'Table', icon: '⊞', hint: 'Rows & columns' },
      { type: 'divider', label: 'Divider', icon: '—', hint: 'Section break' },
      { type: 'button', label: 'Button', icon: '⬒', hint: 'Call to action' },
      { type: 'embed', label: 'Embed', icon: '</>', hint: 'External embed' },
    ],
  },
  {
    title: 'Monetization',
    blocks: [
      { type: 'affiliate', label: 'Affiliate product', icon: '↗', hint: 'Product with affiliate link' },
      { type: 'product', label: 'Product card', icon: '$', hint: 'Editorial product' },
      { type: 'advertisement', label: 'Advertisement', icon: '▭', hint: 'Configured ad slot' },
      { type: 'sponsored', label: 'Sponsored content', icon: '✦', hint: 'Branded block' },
    ],
  },
  {
    title: 'Content',
    blocks: [
      { type: 'recipe', label: 'Recipe', icon: '🍽', hint: 'Recipe card / embed' },
      { type: 'related', label: 'Related content', icon: '⇄', hint: 'Auto or manual' },
      { type: 'author-box', label: 'Author box', icon: '☺', hint: 'Byline & bio' },
      { type: 'newsletter', label: 'Newsletter', icon: '✉', hint: 'Signup block' },
    ],
  },
  {
    title: 'Social',
    blocks: [
      { type: 'pinterest', label: 'Pinterest image', icon: 'P', hint: 'Pinnable visual' },
      { type: 'social-share', label: 'Social share', icon: '↗', hint: 'Share row' },
    ],
  },
]

export const blockDefs: Record<BlockType, BlockDef> = Object.fromEntries(
  blockCatalog.flatMap((g) => g.blocks.map((b) => [b.type, b])),
) as Record<BlockType, BlockDef>

export const calloutStyles: { id: CalloutStyle; label: string; icon: string; tone: string }[] = [
  { id: 'tip', label: 'Tip', icon: '💡', tone: 'border-success/30 bg-success/8' },
  { id: 'note', label: 'Note', icon: '📝', tone: 'border-primary/25 bg-primary/8' },
  { id: 'important', label: 'Important', icon: '⚠', tone: 'border-warning/30 bg-warning/10' },
  { id: 'recipe-tip', label: 'Recipe Tip', icon: '🍽', tone: 'border-seasonal/30 bg-seasonal-soft/40' },
  { id: 'diy-tip', label: 'DIY Tip', icon: '🔨', tone: 'border-seasonal/30 bg-seasonal-soft/40' },
  { id: 'editors-note', label: "Editor's Note", icon: '✎', tone: 'border-border bg-secondary/50' },
]

/* ---- Block factory: sensible defaults per type ---- */
let seq = 0
export const uid = (p = 'b') => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`

export function makeBlock(type: BlockType, order: number): ContentBlock {
  const base: BlockData = {}
  switch (type) {
    case 'paragraph': base.text = ''; break
    case 'heading': base.text = ''; base.level = 2; break
    case 'subheading': base.text = ''; base.level = 3; break
    case 'quote': base.text = ''; base.title = ''; break
    case 'unordered-list':
    case 'ordered-list': base.items = ['', '']; break
    case 'checklist': base.items = ['', '']; base.checked = [false, false]; break
    case 'image': base.imageUrl = ''; base.alt = ''; base.caption = ''; base.align = 'center'; base.size = 'large'; base.pinnable = true; break
    case 'gallery': base.imageUrls = []; base.galleryLayout = 'grid'; break
    case 'video': base.videoUrl = ''; base.poster = ''; base.caption = ''; base.a11y = ''; break
    case 'callout': base.calloutStyle = 'tip'; base.title = 'Tip'; base.text = ''; break
    case 'table': base.rows = [['Column A', 'Column B'], ['', '']]; base.headerRow = true; break
    case 'button': base.label = 'Learn more'; base.href = ''; base.align = 'left'; break
    case 'embed': base.href = ''; break
    case 'product':
    case 'affiliate':
      base.productName = ''; base.price = ''; base.merchant = ''; base.affiliateUrl = ''
      base.cta = 'Shop now'; base.imageUrl = ''; base.text = ''
      base.disclosure = 'This post may contain affiliate links.'; break
    case 'advertisement': base.adSlotId = ''; base.placement = 'in-content'; break
    case 'sponsored':
      base.brand = ''; base.logoUrl = ''; base.imageUrl = ''; base.title = ''; base.text = ''
      base.cta = 'Learn more'; base.destination = ''; base.disclosure = 'Sponsored'; break
    case 'newsletter': base.title = ''; base.text = ''; base.cta = 'Subscribe'; break
    case 'recipe': base.title = ''; break
    case 'related': base.relatedMode = 'auto'; base.relatedIds = []; break
    case 'pinterest': base.imageUrl = ''; base.pinTitle = ''; base.pinDescription = ''; base.destination = ''; base.template = 'standard'; break
    default: break
  }
  return { id: uid(), type, data: base, order }
}

/* ---- Word count + reading time (from text-bearing blocks) ---- */
export function plainText(blocks: ContentBlock[]): string {
  return blocks
    .map((b) => [b.data.text, b.data.title, ...(b.data.items ?? [])].filter(Boolean).join(' '))
    .join(' ')
}

export function wordCount(blocks: ContentBlock[]): number {
  const t = plainText(blocks).trim()
  return t ? t.split(/\s+/).length : 0
}

export function readingTime(blocks: ContentBlock[]): number {
  return Math.max(1, Math.round(wordCount(blocks) / 220))
}

/* ---- Table of contents (auto from headings) ---- */
export type TocEntry = { id: string; text: string; level: 2 | 3 }
export function buildToc(blocks: ContentBlock[]): TocEntry[] {
  return blocks
    .filter((b) => (b.type === 'heading' || b.type === 'subheading') && (b.data.text ?? '').trim())
    .map((b) => ({ id: b.id, text: b.data.text!.trim(), level: b.type === 'heading' ? 2 : 3 as 2 | 3 }))
}

/* ---- Pre-publish validation checklist ---- */
export type CheckSeverity = 'required' | 'recommended'
export type ChecklistItem = { label: string; pass: boolean; severity: CheckSeverity }

export function prePublishChecklist(c: EditorContent): ChecklistItem[] {
  const hasContent = c.blocks.some((b) => (b.data.text ?? '').trim() || (b.data.items ?? []).some((i) => i.trim()) || b.data.imageUrl)
  const hasAltEverywhere = c.blocks.filter((b) => b.type === 'image').every((b) => (b.data.alt ?? '').trim())
  return [
    { label: 'Title', pass: !!c.title.trim(), severity: 'required' },
    { label: 'Slug', pass: !!c.slug.trim(), severity: 'required' },
    { label: 'Author selected', pass: !!c.author.trim(), severity: 'required' },
    { label: 'Featured image', pass: !!c.featuredImage.trim(), severity: 'recommended' },
    { label: 'Category selected', pass: !!c.taxonomy.category.trim(), severity: 'required' },
    { label: 'Content exists', pass: hasContent, severity: 'required' },
    { label: 'SEO title', pass: !!c.seo.title.trim(), severity: 'recommended' },
    { label: 'Meta description', pass: !!c.seo.description.trim(), severity: 'recommended' },
    { label: 'Canonical URL', pass: !!c.seo.canonical.trim(), severity: 'recommended' },
    { label: 'Image alt text', pass: hasAltEverywhere, severity: 'recommended' },
    { label: 'Pinterest image', pass: !!c.pinterest.image.trim(), severity: 'recommended' },
    { label: 'At least one tag', pass: c.taxonomy.tags.length > 0, severity: 'recommended' },
  ]
}

export function publishReadiness(list: ChecklistItem[]): { ready: boolean; requiredMissing: number; recommendedMissing: number } {
  const requiredMissing = list.filter((i) => i.severity === 'required' && !i.pass).length
  const recommendedMissing = list.filter((i) => i.severity === 'recommended' && !i.pass).length
  return { ready: requiredMissing === 0, requiredMissing, recommendedMissing }
}

/* ---- Autosave state machine (UI only) ---- */
export type SaveState = 'saved' | 'saving' | 'unsaved'
export const saveStateMeta: Record<SaveState, { label: string; tone: string }> = {
  saved: { label: 'Saved', tone: 'text-success' },
  saving: { label: 'Saving…', tone: 'text-muted-foreground' },
  unsaved: { label: 'Unsaved changes', tone: 'text-warning' },
}

/* ---- Revision history (illustrative — no real version store) ---- */
export type Revision = { id: string; version: number; editor: string; when: string; summary: string; current?: boolean }
export const sampleRevisions: Revision[] = [
  { id: 'r-5', version: 5, editor: 'Jordan Blake', when: 'Today, 2:14 PM', summary: 'Updated intro and added Pinterest image', current: true },
  { id: 'r-4', version: 4, editor: 'Jordan Blake', when: 'Today, 11:02 AM', summary: 'Added 3 product blocks' },
  { id: 'r-3', version: 3, editor: 'Amanda Thompson', when: 'Yesterday', summary: 'Edited headings, fixed alt text' },
  { id: 'r-2', version: 2, editor: 'Jordan Blake', when: 'Dec 1, 2025', summary: 'First full draft' },
  { id: 'r-1', version: 1, editor: 'Jordan Blake', when: 'Nov 30, 2025', summary: 'Created draft' },
]

/* ---- Timezones (small illustrative list) ---- */
export const timezones = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'UTC', 'Europe/London']
