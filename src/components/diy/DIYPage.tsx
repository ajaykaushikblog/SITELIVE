import { useEffect, useMemo, useState } from 'react'
import type { DIYFull, Material } from '../../lib/diy'
import { relatedProjects } from '../../lib/diy'
import { trending, beauty, weddings, celebrations, seasonalSpotlight } from '../../lib/content'
import { Container, SectionHeader, Badge, Button } from '../ui/primitives'
import { ArticleCard } from '../ui/ArticleCard'
import { Ad } from '../ui/Ad'
import { Newsletter } from '../ui/Newsletter'
import { Pinterest, Print, Download, Heart, Clock, Close, ChevronDown } from '../ui/icons'
import { PinSaveButton } from '../pinterest/PinSaveButton'
import { SocialShare } from '../pinterest/SocialShare'
import { pinterestSaveUrl } from '../../lib/pinterest'

/* --------------------- SEO / HowTo structured data --------------------- */
function useDIYSeo(d: DIYFull) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = d.seo.seoTitle

    const created: HTMLElement[] = []
    const meta = (attr: 'name' | 'property', key: string, content: string) => {
      const el = document.createElement('meta')
      el.setAttribute(attr, key)
      el.setAttribute('content', content)
      document.head.appendChild(el)
      created.push(el)
    }
    meta('name', 'description', d.seo.metaDescription)
    meta('name', 'robots', d.seo.robots)
    meta('property', 'og:title', d.seo.seoTitle)
    meta('property', 'og:description', d.seo.metaDescription)
    meta('property', 'og:image', d.seo.ogImage)
    meta('property', 'og:type', 'article')
    meta('name', 'twitter:card', 'summary_large_image')
    meta('name', 'pinterest:title', d.pinterest.title)
    meta('name', 'pinterest:description', d.pinterest.description)

    const canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    canonical.setAttribute('href', d.seo.canonicalUrl)
    document.head.appendChild(canonical)
    created.push(canonical)

    const howTo: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: d.title,
      description: d.description,
      image: [d.seo.ogImage, d.pinterest.image],
      author: { '@type': 'Person', name: d.author.name },
      datePublished: d.publishedDate,
      dateModified: d.updatedDate ?? d.publishedDate,
      supply: d.materialGroups.flatMap((g) =>
        g.items.map((m) => ({ '@type': 'HowToSupply', name: formatMaterial(m) })),
      ),
      step: d.steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.title,
        text: s.text,
        ...(s.image ? { image: s.image } : {}),
      })),
    }
    if (d.tools?.length)
      howTo.tool = d.tools.map((t) => ({ '@type': 'HowToTool', name: t }))
    if (d.timeRequired) howTo.totalTime = d.timeRequired
    if (d.estimatedCost)
      howTo.estimatedCost = { '@type': 'MonetaryAmount', currency: 'USD', value: d.estimatedCost.replace(/[^0-9.]/g, '') }

    const ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.text = JSON.stringify([
      howTo,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: d.breadcrumb.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.label,
          item: `https://marigoldandmaple.com${c.href}`,
        })),
      },
    ])
    document.head.appendChild(ld)
    created.push(ld)

    return () => {
      document.title = prevTitle
      created.forEach((el) => el.remove())
    }
  }, [d])
}

function formatMaterial(m: Material): string {
  const parts: string[] = []
  if (m.qty != null) parts.push(String(m.qty))
  if (m.unit) parts.push(m.unit)
  parts.push(m.name)
  return parts.join(' ')
}

/* --------------------- Lightbox (zoom) --------------------- */
type LightboxImg = { src: string; alt: string }
function Lightbox({ img, onClose }: { img: LightboxImg; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground"
        aria-label="Close"
      >
        <Close width={18} height={18} />
      </button>
      <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <img src={img.src} alt={img.alt} className="max-h-[80vh] w-auto rounded-lg object-contain" />
        {img.alt && <figcaption className="mt-2 text-center text-[0.85rem] text-background/80">{img.alt}</figcaption>}
      </figure>
    </div>
  )
}

/* --------------------- Breadcrumbs --------------------- */
function Breadcrumbs({ items }: { items: DIYFull['breadcrumb'] }) {
  return (
    <nav aria-label="Breadcrumb" className="pt-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.78rem] text-muted-foreground">
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={c.href} className="flex items-center gap-1.5">
              {last ? (
                <span className="truncate font-semibold text-foreground">{c.label}</span>
              ) : (
                <a href={c.href} className="transition-colors hover:text-primary">
                  {c.label}
                </a>
              )}
              {!last && <span className="text-border">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* --------------------- Quick details --------------------- */
function QuickDetails({ d }: { d: DIYFull }) {
  const stats: { label: string; value?: string }[] = [
    { label: 'Difficulty', value: d.difficulty },
    { label: 'Time', value: d.timeRequired },
    { label: 'Cost', value: d.estimatedCost },
    { label: 'Project', value: d.projectType },
  ].filter((s) => s.value != null)
  if (stats.length === 0) return null

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-card px-4 py-4 text-center">
          <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">{s.label}</dt>
          <dd className="mt-1 font-serif text-[1.15rem] font-semibold text-foreground">{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/* --------------------- Action bar (matches Recipe page) --------------------- */
function ActionBar({ d }: { d: DIYFull }) {
  const [saved, setSaved] = useState(false)
  const savePin = (e: React.MouseEvent) => {
    e.preventDefault()
    window.open(
      pinterestSaveUrl({
        url: d.seo.canonicalUrl,
        image: d.pinterest.image,
        description: d.pinterest.description || d.title,
      }),
      '_blank',
      'noopener,width=750,height=650',
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button variant="pinterest" size="md" onClick={savePin}>
        <Pinterest width={16} height={16} /> Save Project
      </Button>
      <Button variant="outline" size="md" onClick={() => window.print()}>
        <Print width={16} height={16} /> Print
      </Button>
      <Button variant="outline" size="md" onClick={() => window.print()}>
        <Download width={16} height={16} /> PDF
      </Button>
      <button
        onClick={() => setSaved((s) => !s)}
        aria-pressed={saved}
        className={`inline-flex h-11 items-center gap-2 rounded-md border px-4 text-[0.85rem] font-semibold transition-colors ${
          saved ? 'border-transparent bg-seasonal text-white' : 'border-foreground/25 text-foreground hover:border-foreground'
        }`}
      >
        <Heart width={16} height={16} /> {saved ? 'Saved' : 'Save'}
      </button>
      <SocialShare
        url={d.seo.canonicalUrl}
        title={d.pinterest.title || d.title}
        description={d.pinterest.description}
        image={d.pinterest.image}
        showLabel={false}
      />
    </div>
  )
}

/* --------------------- Materials --------------------- */
function Materials({ d }: { d: DIYFull }) {
  return (
    <section id="materials" className="scroll-mt-24">
      <h2 className="border-b border-border pb-3 font-serif text-[1.6rem] font-semibold tracking-tight text-foreground sm:text-[1.9rem]">
        Materials
      </h2>
      <div className="mt-5 space-y-6">
        {d.materialGroups.map((g, gi) => (
          <div key={gi}>
            {g.title && (
              <h3 className="mb-2 font-serif text-[1.15rem] font-semibold text-foreground">{g.title}</h3>
            )}
            <ul className="space-y-2.5">
              {g.items.map((m, mi) => (
                <li key={mi} className="flex items-start gap-3 text-[1.02rem] leading-relaxed text-foreground/90">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-seasonal" />
                  <span>
                    <span className="font-semibold text-foreground">{formatMaterial(m)}</span>
                    {m.note && <span className="text-muted-foreground"> — {m.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/* --------------------- Tools --------------------- */
function Tools({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <section>
      <h2 className="border-b border-border pb-3 font-serif text-[1.4rem] font-semibold text-foreground">Tools</h2>
      <ul className="mt-4 flex flex-wrap gap-2.5">
        {items.map((t) => (
          <li key={t} className="rounded-full bg-secondary px-4 py-1.5 text-[0.85rem] font-medium text-secondary-foreground">
            {t}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* --------------------- Steps --------------------- */
function Steps({ d, onZoom }: { d: DIYFull; onZoom: (img: LightboxImg) => void }) {
  return (
    <section id="steps" className="scroll-mt-24">
      <h2 className="border-b border-border pb-3 font-serif text-[1.6rem] font-semibold tracking-tight text-foreground sm:text-[1.9rem]">
        Step-by-Step
      </h2>
      <ol className="mt-6 space-y-10">
        {d.steps.map((s, i) => (
          <li key={i} className="flex gap-4 sm:gap-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-seasonal font-serif text-[1.05rem] font-semibold text-white">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              {s.title && <h3 className="font-serif text-[1.2rem] font-semibold text-foreground">{s.title}</h3>}
              <p className="mt-1 text-[1.05rem] leading-[1.8] text-foreground/90">{s.text}</p>
              {s.image && (
                <button
                  onClick={() => onZoom({ src: s.image!, alt: s.title ?? `Step ${i + 1}` })}
                  className="group mt-4 block w-full overflow-hidden rounded-lg bg-secondary"
                >
                  <img
                    src={s.image}
                    alt={s.title ?? `Step ${i + 1}`}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </button>
              )}
              {s.gallery && s.gallery.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {s.gallery.map((im, gi) => (
                    <button
                      key={gi}
                      onClick={() => onZoom(im)}
                      className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary"
                    >
                      <img
                        src={im.src}
                        alt={im.alt}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              )}
              {s.video && (
                <div className="mt-4 aspect-video overflow-hidden rounded-lg bg-foreground">
                  <video src={s.video} controls className="h-full w-full" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* --------------------- Tips / notes blocks --------------------- */
function TipBlock({ title, items, tone = 'default' }: { title: string; items?: string[]; tone?: 'default' | 'warn' }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <h3 className={`font-serif text-[1.15rem] font-semibold ${tone === 'warn' ? 'text-primary' : 'text-foreground'}`}>
        {title}
      </h3>
      <ul className="mt-2 space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-[1rem] leading-relaxed text-foreground/90">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone === 'warn' ? 'bg-primary' : 'bg-seasonal'}`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

function NotesSection({ d }: { d: DIYFull }) {
  const hasAny =
    d.tips?.length ||
    d.notes?.length ||
    d.commonMistakes?.length ||
    d.variations?.length ||
    d.substitutions?.length ||
    d.safetyNotes?.length ||
    d.storage ||
    d.makeAhead
  if (!hasAny) return null
  return (
    <section className="rounded-xl border border-border bg-card p-6 sm:p-7">
      <h2 className="font-serif text-[1.4rem] font-semibold text-foreground">Tips & Notes</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <TipBlock title="Tips" items={d.tips} />
        <TipBlock title="Helpful Notes" items={d.notes} />
        <TipBlock title="Common Mistakes" items={d.commonMistakes} tone="warn" />
        <TipBlock title="Variations" items={d.variations} />
        <TipBlock title="Substitutions" items={d.substitutions} />
        <TipBlock title="Safety Notes" items={d.safetyNotes} tone="warn" />
        {d.makeAhead && <TipBlock title="Make Ahead" items={[d.makeAhead]} />}
        {d.storage && <TipBlock title="Storage" items={[d.storage]} />}
      </div>
    </section>
  )
}

/* --------------------- Finished gallery --------------------- */
function FinishedGallery({ images, onZoom }: { images?: LightboxImg[]; onZoom: (img: LightboxImg) => void }) {
  if (!images || images.length === 0) return null
  return (
    <section>
      <h2 className="border-b border-border pb-3 font-serif text-[1.4rem] font-semibold text-foreground">
        The Finished Project
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((im, i) => (
          <button
            key={i}
            onClick={() => onZoom(im)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-secondary"
          >
            <img
              src={im.src}
              alt={im.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-pinterest px-2.5 py-1 text-[0.68rem] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Pinterest width={12} height={12} /> Save
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

/* --------------------- Products --------------------- */
function ProductsSection({ items }: { items?: DIYFull['products'] }) {
  if (!items || items.length === 0) return null
  return (
    <section>
      <h2 className="border-b border-border pb-3 font-serif text-[1.4rem] font-semibold text-foreground">
        Tools & Supplies
      </h2>
      <div className="mt-4 space-y-3">
        {items.map((p) => (
          <div key={p.name} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
              <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-[1.05rem] font-semibold text-foreground">{p.name}</p>
              <p className="text-[0.85rem] text-muted-foreground">{p.blurb}</p>
            </div>
            <a
              href={p.href}
              className="inline-flex shrink-0 items-center rounded-md bg-primary px-4 py-2 text-[0.82rem] font-semibold text-primary-foreground"
            >
              {p.price ? `Shop ${p.price}` : 'Shop'}
            </a>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[0.75rem] italic text-muted-foreground">
        This section may contain affiliate links. We may earn a small commission at no extra cost to you.
      </p>
    </section>
  )
}

/* --------------------- Author bio --------------------- */
function AuthorBio({ author }: { author: DIYFull['author'] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row">
        <img src={author.avatar} alt={author.name} className="h-20 w-20 shrink-0 rounded-full object-cover" />
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">Project by</p>
          <h3 className="mt-1 font-serif text-[1.4rem] font-semibold text-foreground">{author.name}</h3>
          <p className="text-[0.82rem] text-seasonal">{author.role}</p>
          <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">{author.bio}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {author.expertise.map((e) => (
              <span key={e} className="rounded-full bg-secondary px-3 py-1 text-[0.72rem] font-medium text-secondary-foreground">
                {e}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-[0.82rem]">
            <a href={author.href} className="font-semibold text-primary hover:text-foreground">
              View profile →
            </a>
            {author.socials.map((s) => (
              <a key={s.label} href={s.href} className="text-muted-foreground hover:text-primary">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------- Sticky sidebar --------------------- */
function Sidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-8">
        <Ad format="half-page" />
        <div>
          <p className="mb-4 border-b border-border pb-2 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Popular Projects
          </p>
          <div className="space-y-5">
            {seasonalSpotlight.articles.slice(0, 4).map((a) => (
              <ArticleCard key={a.id} article={a} variant="horizontal" />
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-foreground p-6 text-center text-background">
          <Pinterest className="mx-auto mb-2 text-background/70" width={22} height={22} />
          <p className="font-serif text-[1.15rem] font-semibold leading-tight">The Sunday Edit</p>
          <p className="mt-1 text-[0.82rem] text-background/70">Seasonal projects in your inbox weekly.</p>
          <form onSubmit={(e) => e.preventDefault()} className="mt-3 space-y-2">
            <input
              type="email"
              placeholder="you@email.com"
              className="h-10 w-full rounded-md border border-background/20 bg-background/10 px-3 text-[0.85rem] text-background outline-none placeholder:text-background/50"
            />
            <button className="h-10 w-full rounded-md bg-primary text-[0.82rem] font-semibold text-primary-foreground">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}

/* --------------------- Jump bar --------------------- */
function JumpBar() {
  const links = [
    { label: 'Materials', href: '#materials' },
    { label: 'Steps', href: '#steps' },
  ]
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-1.5 text-[0.8rem] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {l.label} <ChevronDown width={13} height={13} />
        </a>
      ))}
    </div>
  )
}

/* --------------------- Page --------------------- */
export function DIYPage({ project }: { project: DIYFull }) {
  useDIYSeo(project)
  const [zoom, setZoom] = useState<LightboxImg | null>(null)

  const related = useMemo(() => relatedProjects(project), [project])
  const more = useMemo(() => [...beauty, ...weddings, ...celebrations, ...trending].slice(0, 4), [])

  return (
    <main data-season={project.season} className="pb-4">
      <Container width="wide">
        <Breadcrumbs items={project.breadcrumb} />

        {/* Header */}
        <header className="mx-auto max-w-3xl pt-6 text-center">
          <div className="mb-4 flex justify-center">
            <Badge>{project.subcategory || project.category}</Badge>
          </div>
          <h1 className="font-serif text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-[3rem]">
            {project.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[1.1rem] leading-relaxed text-muted-foreground">
            {project.description}
          </p>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div className="flex items-center gap-3">
              <img src={project.author.avatar} alt={project.author.name} className="h-11 w-11 rounded-full object-cover" />
              <div className="text-left">
                <p className="text-[0.9rem] font-semibold text-foreground">By {project.author.name}</p>
                <p className="text-[0.78rem] text-muted-foreground">
                  {project.publishedDate}
                  {project.updatedDate && ` · Updated ${project.updatedDate}`}
                </p>
              </div>
            </div>
            {project.readTime && (
              <>
                <span className="hidden h-8 w-px bg-border sm:block" />
                <span className="inline-flex items-center gap-1.5 text-[0.85rem] text-muted-foreground">
                  <Clock width={14} height={14} /> {project.readTime}
                </span>
              </>
            )}
            {project.difficulty && (
              <>
                <span className="hidden h-8 w-px bg-border sm:block" />
                <span className="text-[0.85rem] text-muted-foreground">
                  Difficulty: <span className="font-semibold text-foreground">{project.difficulty}</span>
                </span>
              </>
            )}
          </div>
        </header>

        {/* Featured image */}
        <figure className="group relative mx-auto mt-8 max-w-5xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-secondary">
            <img src={project.featuredImage} alt={project.imageAlt} className="h-full w-full object-cover" />
            <PinSaveButton
              url={project.seo.canonicalUrl}
              image={project.pinterest.image || project.featuredImage}
              description={project.pinterest.description || project.title}
              className="!right-4 !top-4 !px-4 !py-2 !text-[0.8rem]"
            />
          </div>
          {(project.imageCaption || project.imageCredit) && (
            <figcaption className="mt-2 flex flex-wrap justify-between gap-2 text-[0.8rem] text-muted-foreground">
              {project.imageCaption && <span className="italic">{project.imageCaption}</span>}
              {project.imageCredit && <span className="shrink-0">{project.imageCredit}</span>}
            </figcaption>
          )}
        </figure>

        <div className="mx-auto mt-8 max-w-5xl">
          <QuickDetails d={project} />
          <div className="mt-6">
            <ActionBar d={project} />
          </div>
          <JumpBar />
        </div>

        {/* Top ad */}
        <div className="mt-10">
          <Ad format="leaderboard" />
        </div>

        {/* Two-column: tutorial + sticky sidebar */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="mx-auto w-full max-w-[760px] space-y-12 lg:mx-0">
            <Materials d={project} />
            <Tools items={project.tools} />

            {/* middle tutorial ad */}
            <Ad format="rectangle" />

            <Steps d={project} onZoom={setZoom} />
            <NotesSection d={project} />
            <FinishedGallery images={project.finishedGallery} onZoom={setZoom} />
            <ProductsSection items={project.products} />

            {/* tags */}
            <div className="flex flex-wrap gap-2 border-t border-border pt-6">
              {project.tags.map((t) => (
                <span key={t} className="rounded-full bg-secondary px-3 py-1 text-[0.75rem] text-secondary-foreground">
                  #{t}
                </span>
              ))}
            </div>

            <AuthorBio author={project.author} />
          </div>

          <Sidebar />
        </div>

        {/* Related projects — ~10 */}
        <section className="pt-16">
          <SectionHeader title="Related Projects" align="left" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((a, i) => (
              <ArticleCard key={`${a.id}-${i}`} article={a} variant="compact" />
            ))}
          </div>
        </section>

        {/* Bottom ad */}
        <div className="pt-14">
          <Ad format="leaderboard" />
        </div>

        {/* More inspiration */}
        <section className="pt-16">
          <SectionHeader title="More Inspiration" align="left" href="/ideas" />
          <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {more.map((a, i) => (
              <ArticleCard key={`more-${a.id}-${i}`} article={a} />
            ))}
          </div>
        </section>
      </Container>

      <Newsletter />

      {zoom && <Lightbox img={zoom} onClose={() => setZoom(null)} />}
    </main>
  )
}
