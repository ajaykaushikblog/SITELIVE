import { useMemo, useState } from 'react'
import type { CategoryConfig } from '../../lib/categories'
import { sortOptions, relatedCategories, type SortOption } from '../../lib/categories'
import { Container, SectionHeader, Eyebrow, Button, Badge } from '../ui/primitives'
import { ArticleCard } from '../ui/ArticleCard'
import { Ad } from '../ui/Ad'
import { Newsletter } from '../ui/Newsletter'
import { ChevronDown, ArrowRight } from '../ui/icons'

/* --------------------------- Breadcrumbs --------------------------- */
function Breadcrumbs({ items }: { items: CategoryConfig['breadcrumb'] }) {
  return (
    <nav aria-label="Breadcrumb" className="pt-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.78rem] text-muted-foreground">
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={c.href} className="flex items-center gap-1.5">
              {last ? (
                <span className="font-semibold text-foreground">{c.label}</span>
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

/* --------------------------- Category hero --------------------------- */
function CategoryHero({ config }: { config: CategoryConfig }) {
  return (
    <section className="pt-8 sm:pt-10">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>{config.kind}</Eyebrow>
        <h1 className="mt-3 font-serif text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-[3.2rem]">
          {config.name}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[1.02rem] leading-relaxed text-muted-foreground">
          {config.description}
        </p>
        <p className="mt-4 text-[0.75rem] uppercase tracking-[0.16em] text-muted-foreground">
          {config.articleCount.toLocaleString()} articles &amp; ideas
        </p>
      </div>
      <div className="mt-8 aspect-[16/6] overflow-hidden rounded-xl bg-secondary">
        <img src={config.image} alt={config.name} className="h-full w-full object-cover" />
      </div>
    </section>
  )
}

/* --------------------------- Subcategory nav --------------------------- */
function SubcategoryNav({ items }: { items: CategoryConfig['subcategories'] }) {
  return (
    <nav className="pt-8">
      <div className="flex snap-x gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:justify-center">
        {items.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="snap-start whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-[0.85rem] font-medium text-foreground transition-colors hover:border-seasonal hover:text-seasonal"
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

/* --------------------------- Featured block --------------------------- */
function FeaturedBlock({ config }: { config: CategoryConfig }) {
  const f = config.featured
  return (
    <section className="pt-14">
      <SectionHeader title="Featured" align="left" />
      <div className="grid gap-7 lg:grid-cols-[1.5fr_1fr]">
        <a href={f.href} className="group flex flex-col">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-secondary">
            <img
              src={f.image}
              alt={f.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 p-3">
              <Badge>{f.category}</Badge>
            </div>
          </div>
          <h3 className="mt-4 font-serif text-[1.5rem] font-semibold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-[1.9rem]">
            {f.title}
          </h3>
          <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">{f.excerpt}</p>
          <p className="mt-3 text-[0.75rem] uppercase tracking-[0.12em] text-muted-foreground">
            By <span className="font-semibold text-foreground">{f.author.name}</span> &middot; {f.readTime}
          </p>
        </a>
        <div className="flex flex-col gap-6 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          {config.supporting.map((a) => (
            <ArticleCard key={a.id} article={a} variant="horizontal" />
          ))}
        </div>
      </div>
    </section>
  )
}

/* --------------------------- Filter chip --------------------------- */
function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors ${
        active
          ? 'border-seasonal bg-seasonal text-white'
          : 'border-border bg-card text-foreground hover:border-foreground/40'
      }`}
    >
      {label}
    </button>
  )
}

/* --------------------------- Toolbar: filters + sort --------------------------- */
const filterGroupLabels: { key: keyof CategoryConfig['filters']; label: string }[] = [
  { key: 'subcategory', label: 'Subcategory' },
  { key: 'occasion', label: 'Occasion' },
  { key: 'season', label: 'Season' },
  { key: 'contentType', label: 'Content Type' },
  { key: 'style', label: 'Style' },
  { key: 'audience', label: 'Audience' },
]

function Toolbar({
  config,
  active,
  toggle,
  clearAll,
  sort,
  setSort,
  showing,
}: {
  config: CategoryConfig
  active: Set<string>
  toggle: (v: string) => void
  clearAll: () => void
  sort: SortOption
  setSort: (s: SortOption) => void
  showing: number
}) {
  const [open, setOpen] = useState(false)
  return (
    <section className="pt-16">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-[1.6rem] font-semibold tracking-tight text-foreground sm:text-[1.9rem]">
            Latest in {config.name}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-4 text-[0.85rem] font-medium text-foreground hover:border-foreground/40"
            aria-expanded={open}
          >
            Filters
            {active.size > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-seasonal px-1.5 text-[0.68rem] font-bold text-white">
                {active.size}
              </span>
            )}
            <ChevronDown width={15} height={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          <label className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-[0.85rem] text-foreground">
            <span className="text-muted-foreground">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="cursor-pointer bg-transparent pr-1 font-medium outline-none"
            >
              {sortOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {open && (
        <div className="mt-5 space-y-5 rounded-lg border border-border bg-card p-5">
          {filterGroupLabels.map((g) => {
            const opts = config.filters[g.key]
            if (!opts.length) return null
            return (
              <div key={g.key}>
                <p className="mb-2.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {g.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {opts.map((o) => {
                    const val = `${g.key}:${o}`
                    return <Chip key={val} label={o} active={active.has(val)} onClick={() => toggle(val)} />
                  })}
                </div>
              </div>
            )
          })}
          {active.size > 0 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-[0.8rem] text-muted-foreground">
                {active.size} filter{active.size > 1 ? 's' : ''} applied
              </span>
              <button onClick={clearAll} className="text-[0.8rem] font-semibold text-primary hover:text-foreground">
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      <p className="mt-4 text-[0.8rem] text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{showing}</span> of{' '}
        {config.articleCount.toLocaleString()} articles
      </p>
    </section>
  )
}

/* --------------------------- Related categories --------------------------- */
function RelatedCategories({ current }: { current: string }) {
  return (
    <section className="pt-16">
      <SectionHeader title="Explore More" />
      <div className="flex flex-wrap justify-center gap-2.5">
        {relatedCategories
          .filter((c) => c.href !== `/${current}`)
          .map((c) => (
            <a
              key={c.href}
              href={c.href}
              className="rounded-full border border-border bg-card px-5 py-2.5 text-[0.9rem] font-medium text-foreground transition-colors hover:border-seasonal hover:text-seasonal"
            >
              {c.label}
            </a>
          ))}
      </div>
    </section>
  )
}

/* --------------------------- Page --------------------------- */
const PAGE_SIZE = 8

export function CategoryPage({ config }: { config: CategoryConfig }) {
  const [active, setActive] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState<SortOption>('Latest')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const toggle = (v: string) =>
    setActive((prev) => {
      const next = new Set(prev)
      next.has(v) ? next.delete(v) : next.add(v)
      return next
    })

  const sorted = useMemo(() => {
    const list = [...config.latest]
    // Lightweight deterministic reordering to demonstrate sort behavior.
    if (sort === 'Popular') list.reverse()
    if (sort === 'Most Saved') list.sort((a, b) => a.title.length - b.title.length)
    if (sort === "Editor's Picks") list.sort((a, b) => a.title.localeCompare(b.title))
    return list
  }, [config.latest, sort])

  const shown = sorted.slice(0, visible)

  return (
    <main data-season={config.season} className="pb-4">
      <Container width="wide">
        <Breadcrumbs items={config.breadcrumb} />
        <CategoryHero config={config} />
        <SubcategoryNav items={config.subcategories} />
        <FeaturedBlock config={config} />

        {/* Billboard ad between featured and latest */}
        <div className="pt-16">
          <Ad format="billboard" />
        </div>

        <Toolbar
          config={config}
          active={active}
          toggle={toggle}
          clearAll={() => setActive(new Set())}
          sort={sort}
          setSort={setSort}
          showing={Math.min(visible, sorted.length)}
        />

        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((a, i) => (
            <ArticleCard key={`${a.id}-${i}`} article={a} />
          ))}
        </div>

        {/* Leaderboard ad after the grid */}
        <div className="pt-12">
          <Ad format="leaderboard" />
        </div>

        {visible < sorted.length && (
          <div className="flex justify-center pt-10">
            <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
              Load more <ArrowRight width={16} height={16} />
            </Button>
          </div>
        )}

        <RelatedCategories current={config.slug} />
      </Container>
      <Newsletter />
    </main>
  )
}
