import type { Block } from '../../lib/articles'
import { Badge } from '../ui/primitives'
import { Ad } from '../ui/Ad'
import { Newsletter } from '../ui/Newsletter'
import { Pinterest, ArrowRight } from '../ui/icons'

/* Stable id from heading text — used for TOC anchor links */
export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

/* Extract H2 headings for an auto Table of Contents */
export function tocHeadings(content: Block[]) {
  return content
    .filter((b): b is Extract<Block, { type: 'heading' }> => b.type === 'heading' && b.level === 2)
    .map((h) => ({ id: slugify(h.text), text: h.text }))
}

const calloutStyles = {
  tip: { ring: 'border-success/40 bg-success/8', label: 'Tip', color: 'text-success' },
  info: { ring: 'border-seasonal/40 bg-seasonal-soft', label: 'Good to know', color: 'text-seasonal' },
  note: { ring: 'border-border bg-secondary', label: 'Note', color: 'text-foreground' },
} as const

function SaveBtn() {
  return (
    <button
      onClick={(e) => e.preventDefault()}
      className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-pinterest px-3 py-1.5 text-[0.72rem] font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
    >
      <Pinterest width={14} height={14} /> Save
    </button>
  )
}

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-[1.06rem] leading-[1.8] text-foreground/90">{block.text}</p>

    case 'heading':
      return block.level === 2 ? (
        <h2
          id={slugify(block.text)}
          className="scroll-mt-24 pt-2 font-serif text-[1.6rem] font-semibold leading-tight tracking-tight text-foreground sm:text-[1.9rem]"
        >
          {block.text}
        </h2>
      ) : (
        <h3 className="font-serif text-[1.2rem] font-semibold text-foreground sm:text-[1.35rem]">
          {block.text}
        </h3>
      )

    case 'image':
      return (
        <figure className="group relative">
          <div className="relative overflow-hidden rounded-lg bg-secondary">
            <img src={block.src} alt={block.alt} loading="lazy" className="w-full object-cover" />
            <SaveBtn />
          </div>
          {(block.caption || block.credit) && (
            <figcaption className="mt-2 flex flex-wrap justify-between gap-2 text-[0.8rem] text-muted-foreground">
              {block.caption && <span className="italic">{block.caption}</span>}
              {block.credit && <span className="shrink-0">{block.credit}</span>}
            </figcaption>
          )}
        </figure>
      )

    case 'gallery':
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {block.images.map((im, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-secondary">
              <img src={im.src} alt={im.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <SaveBtn />
            </div>
          ))}
        </div>
      )

    case 'quote':
      return (
        <blockquote className="border-l-2 border-seasonal pl-5">
          <p className="font-serif text-[1.35rem] font-medium italic leading-snug text-foreground sm:text-[1.55rem]">
            “{block.text}”
          </p>
          {block.cite && (
            <cite className="mt-2 block text-[0.8rem] not-italic uppercase tracking-[0.14em] text-muted-foreground">
              — {block.cite}
            </cite>
          )}
        </blockquote>
      )

    case 'list':
      return block.ordered ? (
        <ol className="ml-1 list-inside list-decimal space-y-2 text-[1.04rem] leading-relaxed text-foreground/90 marker:font-semibold marker:text-seasonal">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      ) : (
        <ul className="space-y-2.5">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[1.04rem] leading-relaxed text-foreground/90">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-seasonal" />
              {it}
            </li>
          ))}
        </ul>
      )

    case 'checklist':
      return (
        <ul className="space-y-2.5 rounded-lg border border-border bg-card p-5">
          {block.items.map((it, i) => (
            <li key={i} className="flex items-start gap-3 text-[1rem] text-foreground/90">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-seasonal text-[0.7rem] text-white">
                ✓
              </span>
              {it}
            </li>
          ))}
        </ul>
      )

    case 'callout': {
      const s = calloutStyles[block.variant]
      return (
        <aside className={`rounded-lg border ${s.ring} p-5`}>
          <p className={`mb-1 text-[0.7rem] font-bold uppercase tracking-[0.16em] ${s.color}`}>
            {block.title ?? s.label}
          </p>
          <p className="text-[0.98rem] leading-relaxed text-foreground/90">{block.text}</p>
        </aside>
      )
    }

    case 'video':
      return (
        <div className="relative aspect-video overflow-hidden rounded-lg bg-foreground">
          <img src={block.poster} alt={block.title} className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg">
              ▶
            </span>
          </div>
          <span className="absolute bottom-3 left-4 text-[0.85rem] font-medium text-white">{block.title}</span>
        </div>
      )

    case 'product':
      return (
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-secondary">
            <img src={block.image} alt={block.name} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              We recommend
            </p>
            <p className="mt-0.5 font-serif text-[1.1rem] font-semibold text-foreground">{block.name}</p>
            <p className="mt-0.5 text-[0.85rem] text-muted-foreground">{block.blurb}</p>
          </div>
          <a
            href={block.href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[0.82rem] font-semibold text-primary-foreground"
          >
            {block.price ? `Shop ${block.price}` : 'Shop'} <ArrowRight width={14} height={14} />
          </a>
        </div>
      )

    case 'ad':
      return <Ad format={block.format} />

    case 'newsletter':
      return <Newsletter />

    case 'divider':
      return (
        <div className="flex items-center justify-center gap-2 py-1 text-muted-foreground" aria-hidden>
          <span className="h-px w-10 bg-border" />
          <span className="text-seasonal">✦</span>
          <span className="h-px w-10 bg-border" />
        </div>
      )

    case 'related':
      return (
        <a href={block.article.href} className="group flex items-center gap-4 rounded-lg bg-secondary/60 p-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md">
            <img src={block.article.image} alt={block.article.title} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-seasonal">Related</p>
            <p className="font-serif text-[1.02rem] font-semibold leading-snug text-foreground group-hover:text-primary">
              {block.article.title}
            </p>
          </div>
        </a>
      )
  }
}
