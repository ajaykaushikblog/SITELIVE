import { useEffect, useMemo, useRef, useState } from 'react'
import type { Article } from '../../lib/content'
import {
  searchContent,
  suggest,
  allFacets,
  sortOptions,
  popularSearches,
  trendingSearches,
  trendingDocs,
  type Facet,
  type FacetKey,
  type SearchDoc,
  type SearchFilters,
  type SearchSort,
} from '../../lib/search'
import { navigate, useSearchString } from '../../lib/router'
import { Container, Button } from '../ui/primitives'
import { ArticleCard } from '../ui/ArticleCard'
import { Ad } from '../ui/Ad'
import { Newsletter } from '../ui/Newsletter'
import { Search, Close, ChevronDown, ArrowRight } from '../ui/icons'

const PAGE = 12

/* Map a unified search document onto the shared card model so results
   reuse the exact site-wide ArticleCard rather than a bespoke style. */
function toArticle(d: SearchDoc): Article {
  return {
    id: d.id,
    title: d.title,
    category: d.category,
    href: d.href,
    image: d.featuredImage,
    author: d.author,
    date: d.publishedDate,
    excerpt: d.excerpt,
    readTime: d.readTime,
  }
}

/* ---- Head management: internal search is intentionally noindex,follow ---- */
function useSearchSeo(query: string, total: number) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = query
      ? `Search: “${query}” — Marigold & Maple`
      : 'Search — Marigold & Maple'

    const metas: HTMLMetaElement[] = []
    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      const el = document.createElement('meta')
      el.setAttribute(attr, key)
      el.content = content
      document.head.appendChild(el)
      metas.push(el)
    }
    // internal search results must never spawn indexable duplicate URLs
    setMeta('name', 'robots', 'noindex, follow')
    setMeta('property', 'og:type', 'website')
    setMeta(
      'property',
      'og:title',
      query ? `Search results for “${query}”` : 'Search Marigold & Maple',
    )
    if (query) {
      setMeta(
        'name',
        'description',
        `${total.toLocaleString()} results for “${query}” across recipes, DIY, weddings, beauty and more.`,
      )
    }

    // canonical points to the bare search route, not the query permutation
    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = 'https://marigoldandmaple.com/search'
    document.head.appendChild(canonical)

    return () => {
      document.title = prevTitle
      metas.forEach((m) => m.remove())
      canonical.remove()
    }
  }, [query, total])
}

/* ============================ Filter controls ============================ */

function FacetChip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[0.8rem] font-medium transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:border-foreground/40'
      }`}
    >
      {children}
    </button>
  )
}

function FacetGroup({
  facet,
  selected,
  onToggle,
  onClear,
}: {
  facet: Facet
  selected: string[]
  onToggle: (key: FacetKey, value: string) => void
  onClear: (key: FacetKey) => void
}) {
  const [open, setOpen] = useState(true)
  const COLLAPSE = 8
  const [showAll, setShowAll] = useState(false)
  const values = showAll ? facet.values : facet.values.slice(0, COLLAPSE)

  return (
    <div className="border-b border-border py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted-foreground"
      >
        <span>
          {facet.label}
          {selected.length > 0 && <span className="ml-1.5 text-primary">({selected.length})</span>}
        </span>
        <ChevronDown
          width={15}
          height={15}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="mt-3.5">
          <div className="flex flex-wrap gap-2">
            <FacetChip active={selected.length === 0} onClick={() => onClear(facet.key)}>
              All
            </FacetChip>
            {values.map((v) => (
              <FacetChip
                key={v}
                active={selected.includes(v)}
                onClick={() => onToggle(facet.key, v)}
              >
                {v}
              </FacetChip>
            ))}
          </div>
          {facet.values.length > COLLAPSE && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 text-[0.78rem] font-semibold text-primary hover:text-foreground"
            >
              {showAll ? 'Show less' : `Show all ${facet.values.length}`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function FilterPanel({
  filters,
  onToggle,
  onClear,
}: {
  filters: SearchFilters
  onToggle: (key: FacetKey, value: string) => void
  onClear: (key: FacetKey) => void
}) {
  return (
    <div>
      {allFacets.map((facet) => (
        <FacetGroup
          key={facet.key}
          facet={facet}
          selected={filters[facet.key] ?? []}
          onToggle={onToggle}
          onClear={onClear}
        />
      ))}
    </div>
  )
}

/* ============================ Search field ============================ */

function SearchField({
  value,
  onChange,
  onSubmit,
  suggestions,
  onPick,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  suggestions: string[]
  onPick: (s: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const showSuggest = focused && suggestions.length > 0

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setFocused(false)
          onSubmit()
        }}
        className="flex items-stretch gap-2"
      >
        <div className="relative flex flex-1 items-center rounded-xl border border-border bg-card focus-within:border-foreground/40">
          <Search className="pointer-events-none absolute left-4 text-muted-foreground" />
          <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search for recipes, wedding ideas, DIY projects…"
            aria-label="Search"
            className="h-14 w-full rounded-xl bg-transparent pl-12 pr-4 text-[1rem] text-foreground outline-none placeholder:text-muted-foreground"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Clear"
              className="absolute right-3 text-muted-foreground hover:text-foreground"
            >
              <Close width={18} height={18} />
            </button>
          )}
        </div>
        <Button type="submit" size="lg" className="shrink-0 px-6">
          Search
        </Button>
      </form>

      {showSuggest && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-[0_16px_40px_-24px_rgba(38,32,27,0.5)]">
          <p className="px-4 pt-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Suggestions
          </p>
          <ul className="py-1.5">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setFocused(false)
                    onPick(s)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-[0.9rem] text-foreground hover:bg-secondary"
                >
                  <Search width={15} height={15} className="text-muted-foreground" />
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ============================ Discovery (empty query) ============================ */

function TermPills({
  title,
  terms,
  onPick,
}: {
  title: string
  terms: string[]
  onPick: (t: string) => void
}) {
  return (
    <div>
      <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-wrap gap-2.5">
        {terms.map((t) => (
          <button
            key={t}
            onClick={() => onPick(t)}
            className="rounded-full border border-border bg-card px-4 py-2 text-[0.85rem] font-medium text-foreground transition-colors hover:border-foreground/40 hover:text-primary"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}

function Discovery({ onPick }: { onPick: (t: string) => void }) {
  const trend = trendingDocs(6)
  return (
    <div className="py-4">
      <div className="grid gap-8 sm:grid-cols-2">
        <TermPills title="Popular Searches" terms={popularSearches} onPick={onPick} />
        <TermPills title="Trending Searches" terms={trendingSearches} onPick={onPick} />
      </div>
      <div className="mt-12">
        <p className="mb-5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Trending Content
        </p>
        <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
          {trend.map((d) => (
            <ArticleCard key={d.id} article={toArticle(d)} badgeTone="neutral" />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================ No results ============================ */

function NoResults({ query, onPick }: { query: string; onPick: (t: string) => void }) {
  return (
    <div className="py-6">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-serif text-[1.6rem] font-semibold text-foreground sm:text-[2rem]">
          No results found for “{query}”
        </h2>
        <ul className="mx-auto mt-5 inline-flex flex-col gap-1.5 text-left text-[0.95rem] text-muted-foreground">
          <li>• Check your spelling</li>
          <li>• Try using fewer or more general words</li>
          <li>• Search for a related topic below</li>
        </ul>
      </div>
      <div className="mt-12 space-y-10">
        <TermPills title="Popular Occasions" terms={popularSearches} onPick={onPick} />
        <div>
          <p className="mb-5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Trending Content
          </p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
            {trendingDocs(6).map((d) => (
              <ArticleCard key={d.id} article={toArticle(d)} badgeTone="neutral" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================ Page ============================ */

export function SearchPage() {
  const searchStr = useSearchString()
  const q = (new URLSearchParams(searchStr).get('q') ?? '').trim()

  const [input, setInput] = useState(q)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [sort, setSort] = useState<SearchSort>('Relevance')
  const [visible, setVisible] = useState(PAGE)
  const [mobileFilters, setMobileFilters] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  // keep the field in sync when the URL query changes (e.g. header search)
  useEffect(() => setInput(q), [q])

  const result = useMemo(() => searchContent(q, filters, sort), [q, filters, sort])
  useEffect(() => setVisible(PAGE), [q, filters, sort])

  const suggestions = useMemo(
    () => (input.trim() && input.trim() !== q ? suggest(input) : []),
    [input, q],
  )

  const runSearch = (term: string) => {
    const t = term.trim()
    navigate(t ? `/search?q=${encodeURIComponent(t)}` : '/search')
  }

  const toggle = (key: FacetKey, value: string) =>
    setFilters((prev) => {
      const cur = prev[key] ?? []
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
      const copy = { ...prev }
      if (next.length) copy[key] = next
      else delete copy[key]
      return copy
    })

  const clearGroup = (key: FacetKey) =>
    setFilters((prev) => {
      const copy = { ...prev }
      delete copy[key]
      return copy
    })

  const activeChips = useMemo(
    () =>
      (Object.entries(filters) as [FacetKey, string[]][]).flatMap(([key, vals]) =>
        vals.map((v) => ({ key, value: v })),
      ),
    [filters],
  )
  const activeCount = activeChips.length

  useSearchSeo(q, result.total)

  const hasQueryOrFilters = q.length > 0 || activeCount > 0
  const shown = result.docs.slice(0, visible)

  return (
    <>
      {/* Top advertisement */}
      <Container width="wide" className="pt-6">
        <Ad format="leaderboard" />
      </Container>

      {/* Search hero */}
      <section className="border-b border-border bg-secondary/40">
        <Container width="wide" className="py-12 text-center sm:py-16">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-seasonal">
            Search
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl font-serif text-[2rem] font-semibold leading-tight tracking-tight text-foreground sm:text-[2.6rem]">
            What are you looking for today?
          </h1>
          <div className="mt-8">
            <SearchField
              value={input}
              onChange={setInput}
              onSubmit={() => runSearch(input)}
              suggestions={suggestions}
              onPick={(s) => {
                setInput(s)
                runSearch(s)
              }}
            />
          </div>
        </Container>
      </section>

      <Container width="wide" className="py-10">
        {!hasQueryOrFilters ? (
          <Discovery
            onPick={(t) => {
              setInput(t)
              runSearch(t)
            }}
          />
        ) : (
          <>
            {/* Summary + sort row */}
            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                {q ? (
                  <>
                    <p className="text-[0.8rem] uppercase tracking-[0.14em] text-muted-foreground">
                      Search results for
                    </p>
                    <h2 className="mt-1 font-serif text-[1.5rem] font-semibold text-foreground sm:text-[1.9rem]">
                      “{q}”
                    </h2>
                  </>
                ) : (
                  <h2 className="font-serif text-[1.5rem] font-semibold text-foreground sm:text-[1.9rem]">
                    Browsing all content
                  </h2>
                )}
                <p className="mt-1.5 text-[0.9rem] text-muted-foreground">
                  {result.total.toLocaleString()} {result.total === 1 ? 'result' : 'results'}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Mobile filter trigger */}
                <button
                  onClick={() => setMobileFilters(true)}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-[0.85rem] font-medium text-foreground lg:hidden"
                >
                  Filters
                  {activeCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.68rem] font-bold text-primary-foreground">
                      {activeCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-[0.85rem] font-medium text-foreground"
                  >
                    <span className="text-muted-foreground">Sort:</span> {sort}
                    <ChevronDown
                      width={15}
                      height={15}
                      className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-[0_16px_40px_-24px_rgba(38,32,27,0.5)]">
                      {sortOptions.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setSort(s)
                            setSortOpen(false)
                          }}
                          className={`block w-full px-4 py-2 text-left text-[0.88rem] hover:bg-secondary ${
                            s === sort ? 'font-semibold text-primary' : 'text-foreground'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {activeCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-4">
                {activeChips.map(({ key, value }) => (
                  <button
                    key={key + value}
                    onClick={() => toggle(key, value)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[0.78rem] font-medium text-foreground hover:bg-primary/20"
                  >
                    {value}
                    <Close width={13} height={13} />
                  </button>
                ))}
                <button
                  onClick={() => setFilters({})}
                  className="text-[0.78rem] font-semibold text-primary hover:text-foreground"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Body: filters rail + results */}
            <div className="mt-8 grid gap-10 lg:grid-cols-[248px_minmax(0,1fr)]">
              {/* Desktop filters rail */}
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <FilterPanel filters={filters} onToggle={toggle} onClear={clearGroup} />
                  {/* Desktop sticky sidebar advertisement */}
                  <div className="mt-8">
                    <Ad format="half-page" />
                  </div>
                </div>
              </aside>

              {/* Results */}
              <div>
                {result.total === 0 ? (
                  <NoResults
                    query={q}
                    onPick={(t) => {
                      setInput(t)
                      setFilters({})
                      runSearch(t)
                    }}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
                      {shown.map((d, i) => (
                        <div key={d.id} className="contents">
                          <ArticleCard article={toArticle(d)} badgeTone="neutral" />
                          {/* Inline advertisement woven into the grid */}
                          {(i + 1) % 8 === 0 && i + 1 < shown.length && (
                            <div className="col-span-full my-2 flex justify-center">
                              <Ad format="rectangle" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Load more */}
                    {visible < result.total && (
                      <div className="mt-12 flex flex-col items-center gap-3">
                        <p className="text-[0.82rem] text-muted-foreground">
                          Showing {shown.length} of {result.total.toLocaleString()}
                        </p>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setVisible((v) => v + PAGE)}
                        >
                          Load more results <ArrowRight width={16} height={16} />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </Container>

      <Newsletter />

      {/* Mobile filter bottom sheet */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileFilters(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search filters"
            className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-background shadow-[0_-16px_40px_-24px_rgba(38,32,27,0.5)]"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="font-serif text-[1.2rem] font-semibold text-foreground">
                Filters {activeCount > 0 && <span className="text-primary">({activeCount})</span>}
              </h3>
              <button
                onClick={() => setMobileFilters(false)}
                aria-label="Close filters"
                className="text-muted-foreground hover:text-foreground"
              >
                <Close />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              <FilterPanel filters={filters} onToggle={toggle} onClear={clearGroup} />
            </div>
            <div className="flex items-center gap-3 border-t border-border px-5 py-4">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => setFilters({})}
              >
                Clear all
              </Button>
              <Button size="md" className="flex-1" onClick={() => setMobileFilters(false)}>
                Show {result.total.toLocaleString()} results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
