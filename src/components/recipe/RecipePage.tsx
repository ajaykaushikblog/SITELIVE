import { useEffect, useMemo, useState } from 'react'
import type { RecipeFull, Ingredient } from '../../lib/recipes'
import { relatedRecipes } from '../../lib/recipes'
import { trending, beauty, weddings, celebrations, recipes as recipeRow } from '../../lib/content'
import { Container, SectionHeader, Badge, Button } from '../ui/primitives'
import { ArticleCard } from '../ui/ArticleCard'
import { Ad } from '../ui/Ad'
import { Newsletter } from '../ui/Newsletter'
import { Pinterest, Print, Download, Heart, Clock, ChevronDown } from '../ui/icons'
import { PinSaveButton } from '../pinterest/PinSaveButton'
import { SocialShare } from '../pinterest/SocialShare'
import { pinterestSaveUrl } from '../../lib/pinterest'

/* --------------------- SEO / Recipe structured data --------------------- */
function useRecipeSeo(r: RecipeFull) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = r.seo.seoTitle

    const created: HTMLElement[] = []
    const meta = (attr: 'name' | 'property', key: string, content: string) => {
      const el = document.createElement('meta')
      el.setAttribute(attr, key)
      el.setAttribute('content', content)
      document.head.appendChild(el)
      created.push(el)
    }
    meta('name', 'description', r.seo.metaDescription)
    meta('name', 'robots', r.seo.robots)
    meta('property', 'og:title', r.seo.seoTitle)
    meta('property', 'og:description', r.seo.metaDescription)
    meta('property', 'og:image', r.seo.ogImage)
    meta('property', 'og:type', 'article')
    meta('name', 'twitter:card', 'summary_large_image')
    meta('name', 'pinterest:title', r.pinterest.title)
    meta('name', 'pinterest:description', r.pinterest.description)

    const canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    canonical.setAttribute('href', r.seo.canonicalUrl)
    document.head.appendChild(canonical)
    created.push(canonical)

    /* Recipe + BreadcrumbList JSON-LD. aggregateRating only when genuine. */
    const recipeLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: r.title,
      description: r.description,
      image: [r.seo.ogImage, r.pinterest.image],
      author: { '@type': 'Person', name: r.author.name },
      datePublished: r.publishedDate,
      dateModified: r.updatedDate ?? r.publishedDate,
      recipeCategory: r.category,
      keywords: r.tags.join(', '),
      recipeIngredient: r.ingredientGroups.flatMap((g) =>
        g.items.map((it) => formatIngredient(it, 1)),
      ),
      recipeInstructions: r.instructions.map((s) => ({
        '@type': 'HowToStep',
        name: s.heading,
        text: s.text,
      })),
    }
    if (r.prepTime) recipeLd.prepTime = r.prepTime
    if (r.cookTime) recipeLd.cookTime = r.cookTime
    if (r.totalTime) recipeLd.totalTime = r.totalTime
    if (r.servings) recipeLd.recipeYield = `${r.servings} ${r.servingUnit ?? ''}`.trim()
    if (r.nutrition)
      recipeLd.nutrition = { '@type': 'NutritionInformation', calories: r.nutrition.calories }
    if (r.rating)
      recipeLd.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: r.rating.value,
        ratingCount: r.rating.count,
      }

    const ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.text = JSON.stringify([
      recipeLd,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: r.breadcrumb.map((c, i) => ({
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
  }, [r])
}

/* --------------------- helpers --------------------- */
/* Scale a quantity by the serving multiplier and format cleanly (incl. fractions) */
function formatQty(qty: number): string {
  const rounded = Math.round(qty * 100) / 100
  const whole = Math.floor(rounded)
  const frac = rounded - whole
  const fractions: [number, string][] = [
    [0.125, '⅛'], [0.25, '¼'], [0.333, '⅓'], [0.375, '⅜'],
    [0.5, '½'], [0.625, '⅝'], [0.667, '⅔'], [0.75, '¾'], [0.875, '⅞'],
  ]
  let fracStr = ''
  if (frac > 0.05) {
    const match = fractions.reduce((best, f) =>
      Math.abs(f[0] - frac) < Math.abs(best[0] - frac) ? f : best,
    )
    if (Math.abs(match[0] - frac) < 0.06) fracStr = match[1]
    else return String(rounded)
  }
  if (whole === 0 && fracStr) return fracStr
  return `${whole}${fracStr ? ' ' + fracStr : ''}`
}

function formatIngredient(it: Ingredient, mult: number): string {
  const parts: string[] = []
  if (it.qty != null) parts.push(formatQty(it.qty * mult))
  if (it.unit) parts.push(it.unit)
  parts.push(it.name)
  return parts.join(' ')
}

/* --------------------- Breadcrumbs --------------------- */
function Breadcrumbs({ items }: { items: RecipeFull['breadcrumb'] }) {
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

/* --------------------- Rating stars --------------------- */
function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-seasonal" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i < Math.round(value) ? '' : 'text-border'}>
          ★
        </span>
      ))}
    </span>
  )
}

/* --------------------- Quick info stats --------------------- */
function QuickInfo({ r }: { r: RecipeFull }) {
  const stats: { label: string; value?: string | number }[] = [
    { label: 'Prep', value: r.prepTime },
    { label: 'Cook', value: r.cookTime },
    { label: 'Total', value: r.totalTime },
    { label: 'Servings', value: r.servings ? `${r.servings}${r.servingUnit ? ' ' + r.servingUnit : ''}` : undefined },
    { label: 'Calories', value: r.calories },
    { label: 'Difficulty', value: r.difficulty },
    { label: 'Cost', value: r.cost },
  ].filter((s) => s.value != null)

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-card px-4 py-4 text-center">
          <dt className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {s.label}
          </dt>
          <dd className="mt-1 font-serif text-[1.15rem] font-semibold text-foreground">{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/* --------------------- Action buttons --------------------- */
function ActionBar({ r, onPrint }: { r: RecipeFull; onPrint: () => void }) {
  const [saved, setSaved] = useState(false)
  const savePin = (e: React.MouseEvent) => {
    e.preventDefault()
    window.open(
      pinterestSaveUrl({
        url: r.seo.canonicalUrl,
        image: r.pinterest.image,
        description: r.pinterest.description || r.title,
      }),
      '_blank',
      'noopener,width=750,height=650',
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button variant="pinterest" size="md" onClick={savePin}>
        <Pinterest width={16} height={16} /> Save Recipe
      </Button>
      <Button variant="outline" size="md" onClick={onPrint}>
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
        url={r.seo.canonicalUrl}
        title={r.pinterest.title || r.title}
        description={r.pinterest.description}
        image={r.pinterest.image}
        showLabel={false}
      />
    </div>
  )
}

/* --------------------- Serving adjuster + ingredients --------------------- */
function IngredientsSection({ r }: { r: RecipeFull }) {
  const base = r.servings ?? 1
  const [servings, setServings] = useState(base)
  const mult = servings / base
  const scalable = r.servings != null

  return (
    <section id="ingredients" className="scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
        <h2 className="font-serif text-[1.6rem] font-semibold tracking-tight text-foreground sm:text-[1.9rem]">
          Ingredients
        </h2>
        {scalable && (
          <div className="flex items-center gap-3">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Servings
            </span>
            <div className="inline-flex items-center rounded-full border border-border">
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-foreground transition-colors hover:bg-secondary"
                aria-label="Decrease servings"
              >
                −
              </button>
              <span className="min-w-[2.5rem] text-center font-serif text-[1.15rem] font-semibold text-foreground">
                {servings}
              </span>
              <button
                onClick={() => setServings((s) => s + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-foreground transition-colors hover:bg-secondary"
                aria-label="Increase servings"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {scalable && mult !== 1 && (
        <p className="mt-3 text-[0.8rem] italic text-seasonal">
          Quantities scaled for {servings} {r.servingUnit ?? 'servings'}.
        </p>
      )}

      <div className="mt-5 space-y-6">
        {r.ingredientGroups.map((g, gi) => (
          <div key={gi}>
            {g.title && (
              <h3 className="mb-2 font-serif text-[1.15rem] font-semibold text-foreground">{g.title}</h3>
            )}
            <ul className="space-y-2.5">
              {g.items.map((it, ii) => (
                <li key={ii} className="flex items-start gap-3 text-[1.02rem] leading-relaxed text-foreground/90">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-seasonal" />
                  <span>
                    <span className="font-semibold text-foreground">{formatIngredient(it, mult)}</span>
                    {it.note && <span className="text-muted-foreground"> — {it.note}</span>}
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

/* --------------------- Instructions --------------------- */
function Instructions({ r }: { r: RecipeFull }) {
  return (
    <section id="instructions" className="scroll-mt-24">
      <h2 className="border-b border-border pb-3 font-serif text-[1.6rem] font-semibold tracking-tight text-foreground sm:text-[1.9rem]">
        Instructions
      </h2>
      <ol className="mt-6 space-y-8">
        {r.instructions.map((s, i) => (
          <li key={i} className="flex gap-4 sm:gap-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-seasonal font-serif text-[1.05rem] font-semibold text-white">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              {s.heading && (
                <h3 className="font-serif text-[1.2rem] font-semibold text-foreground">{s.heading}</h3>
              )}
              <p className="mt-1 text-[1.05rem] leading-[1.8] text-foreground/90">{s.text}</p>
              {s.image && (
                <div className="mt-4 overflow-hidden rounded-lg bg-secondary">
                  <img src={s.image} alt={s.heading ?? `Step ${i + 1}`} loading="lazy" className="w-full object-cover" />
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

/* --------------------- Notes / tips list blocks --------------------- */
function TipBlock({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <h3 className="font-serif text-[1.15rem] font-semibold text-foreground">{title}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-[1rem] leading-relaxed text-foreground/90">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-seasonal" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

function NotesSection({ r }: { r: RecipeFull }) {
  const hasAny =
    r.notes?.length ||
    r.tips?.length ||
    r.variations?.length ||
    r.substitutions?.length ||
    r.storage ||
    r.makeAhead
  if (!hasAny) return null
  return (
    <section className="rounded-xl border border-border bg-card p-6 sm:p-7">
      <h2 className="font-serif text-[1.4rem] font-semibold text-foreground">Notes & Tips</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <TipBlock title="Recipe Notes" items={r.notes} />
        <TipBlock title="Tips" items={r.tips} />
        <TipBlock title="Variations" items={r.variations} />
        <TipBlock title="Substitutions" items={r.substitutions} />
        {r.makeAhead && <TipBlock title="Make Ahead" items={[r.makeAhead]} />}
        {r.storage && <TipBlock title="Storage" items={[r.storage]} />}
      </div>
    </section>
  )
}

/* --------------------- Equipment --------------------- */
function Equipment({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <section>
      <h2 className="border-b border-border pb-3 font-serif text-[1.4rem] font-semibold text-foreground">
        Equipment
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2.5">
        {items.map((e) => (
          <li key={e} className="rounded-full bg-secondary px-4 py-1.5 text-[0.85rem] font-medium text-secondary-foreground">
            {e}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* --------------------- Nutrition --------------------- */
function NutritionSection({ n }: { n?: RecipeFull['nutrition'] }) {
  if (!n) return null
  const rows: { label: string; value?: string }[] = [
    { label: 'Calories', value: n.calories },
    { label: 'Protein', value: n.protein },
    { label: 'Carbs', value: n.carbohydrates },
    { label: 'Fat', value: n.fat },
    { label: 'Fiber', value: n.fiber },
    { label: 'Sugar', value: n.sugar },
    { label: 'Sodium', value: n.sodium },
  ].filter((r) => r.value)
  if (rows.length === 0) return null
  return (
    <section className="rounded-xl border border-border bg-secondary/50 p-6 sm:p-7">
      <h2 className="font-serif text-[1.4rem] font-semibold text-foreground">Nutrition</h2>
      <p className="mt-1 text-[0.8rem] text-muted-foreground">Estimated per serving.</p>
      <dl className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {r.label}
            </dt>
            <dd className="mt-0.5 font-serif text-[1.2rem] font-semibold text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* --------------------- Affiliate products --------------------- */
function ProductsSection({ items }: { items?: RecipeFull['products'] }) {
  if (!items || items.length === 0) return null
  return (
    <section>
      <h2 className="border-b border-border pb-3 font-serif text-[1.4rem] font-semibold text-foreground">
        Tools & Products Used
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

/* --------------------- Printable recipe card --------------------- */
function RecipeCard({ r }: { r: RecipeFull }) {
  return (
    <section id="recipe-card" className="scroll-mt-24 overflow-hidden rounded-2xl border-2 border-seasonal/40 bg-card">
      <div className="border-b border-border bg-seasonal-soft px-6 py-5 text-center">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-seasonal">Recipe Card</p>
        <h2 className="mt-1 font-serif text-[1.6rem] font-semibold text-foreground">{r.title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-[0.9rem] text-muted-foreground">{r.description}</p>
        {r.rating && (
          <div className="mt-2 flex items-center justify-center gap-2 text-[0.85rem] text-muted-foreground">
            <Stars value={r.rating.value} />
            <span>{r.rating.value.toFixed(1)} · {r.rating.count} ratings</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-px border-b border-border bg-border sm:grid-cols-4">
        {[
          { label: 'Prep', value: r.prepTime },
          { label: 'Cook', value: r.cookTime },
          { label: 'Total', value: r.totalTime },
          { label: 'Serves', value: r.servings ? String(r.servings) : undefined },
        ]
          .filter((s) => s.value)
          .map((s) => (
            <div key={s.label} className="bg-card px-3 py-3 text-center">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
              <p className="mt-0.5 font-serif text-[1rem] font-semibold text-foreground">{s.value}</p>
            </div>
          ))}
      </div>

      <div className="grid gap-8 p-6 sm:grid-cols-[1fr_1.4fr] sm:p-7">
        <div>
          <h3 className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-seasonal">Ingredients</h3>
          <div className="space-y-4">
            {r.ingredientGroups.map((g, gi) => (
              <div key={gi}>
                {g.title && <p className="mb-1 text-[0.85rem] font-semibold text-foreground">{g.title}</p>}
                <ul className="space-y-1.5">
                  {g.items.map((it, ii) => (
                    <li key={ii} className="text-[0.9rem] text-foreground/90">
                      • {formatIngredient(it, 1)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-seasonal">Instructions</h3>
          <ol className="space-y-2.5">
            {r.instructions.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-[0.9rem] leading-relaxed text-foreground/90">
                <span className="font-serif font-semibold text-seasonal">{i + 1}.</span>
                <span>{s.heading ? <span className="font-semibold">{s.heading}. </span> : null}{s.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {r.nutrition?.calories && (
        <div className="border-t border-border px-6 py-3 text-center text-[0.8rem] text-muted-foreground">
          <span className="font-semibold text-foreground">Nutrition (per serving):</span>{' '}
          {[r.nutrition.calories, r.nutrition.protein && `${r.nutrition.protein} protein`, r.nutrition.carbohydrates && `${r.nutrition.carbohydrates} carbs`, r.nutrition.fat && `${r.nutrition.fat} fat`]
            .filter(Boolean)
            .join(' · ')}
        </div>
      )}
      <div className="border-t border-border px-6 py-3 text-center text-[0.8rem] text-muted-foreground">
        Recipe by <span className="font-semibold text-foreground">{r.author.name}</span> · Marigold &amp; Maple
      </div>
    </section>
  )
}

/* --------------------- Author bio (matches article layer) --------------------- */
function AuthorBio({ author }: { author: RecipeFull['author'] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row">
        <img src={author.avatar} alt={author.name} className="h-20 w-20 shrink-0 rounded-full object-cover" />
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">Recipe by</p>
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

/* --------------------- Sticky sidebar (matches article layer) --------------------- */
function Sidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-8">
        <Ad format="half-page" />
        <div>
          <p className="mb-4 border-b border-border pb-2 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Trending Recipes
          </p>
          <div className="space-y-5">
            {recipeRow.slice(0, 4).map((a) => (
              <ArticleCard key={a.id} article={a} variant="horizontal" />
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-foreground p-6 text-center text-background">
          <Pinterest className="mx-auto mb-2 text-background/70" width={22} height={22} />
          <p className="font-serif text-[1.15rem] font-semibold leading-tight">The Sunday Edit</p>
          <p className="mt-1 text-[0.82rem] text-background/70">Seasonal recipes in your inbox weekly.</p>
          <form onSubmit={(e) => e.preventDefault()} className="mt-3 space-y-2">
            <input
              type="email"
              aria-label="Email address"
              placeholder="you@email.com"
              className="h-10 w-full rounded-md border border-background/20 bg-background/10 px-3 text-[0.85rem] text-background outline-none placeholder:text-background/50 focus:border-background/50"
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

/* --------------------- Jump-to bar --------------------- */
function JumpBar() {
  const links = [
    { label: 'Ingredients', href: '#ingredients' },
    { label: 'Instructions', href: '#instructions' },
    { label: 'Recipe Card', href: '#recipe-card' },
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
export function RecipePage({ recipe }: { recipe: RecipeFull }) {
  useRecipeSeo(recipe)
  const scrollToCard = () =>
    document.getElementById('recipe-card')?.scrollIntoView({ behavior: 'smooth' })

  const related = useMemo(() => relatedRecipes(recipe), [recipe])
  const more = useMemo(
    () => [...beauty, ...weddings, ...celebrations, ...trending].slice(0, 4),
    [],
  )

  return (
    <main data-season={recipe.season} className="pb-4">
      <Container width="wide">
        <Breadcrumbs items={recipe.breadcrumb} />

        {/* Header */}
        <header className="mx-auto max-w-3xl pt-6 text-center">
          <div className="mb-4 flex justify-center">
            <Badge>{recipe.subcategory || recipe.category}</Badge>
          </div>
          <h1 className="font-serif text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-[3rem]">
            {recipe.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[1.1rem] leading-relaxed text-muted-foreground">
            {recipe.description}
          </p>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div className="flex items-center gap-3">
              <img src={recipe.author.avatar} alt={recipe.author.name} className="h-11 w-11 rounded-full object-cover" />
              <div className="text-left">
                <p className="text-[0.9rem] font-semibold text-foreground">By {recipe.author.name}</p>
                <p className="text-[0.78rem] text-muted-foreground">
                  {recipe.publishedDate}
                  {recipe.updatedDate && ` · Updated ${recipe.updatedDate}`}
                </p>
              </div>
            </div>
            {recipe.rating && (
              <>
                <span className="hidden h-8 w-px bg-border sm:block" />
                <div className="flex items-center gap-2 text-[0.85rem] text-muted-foreground">
                  <Stars value={recipe.rating.value} />
                  <span>
                    <span className="font-semibold text-foreground">{recipe.rating.value.toFixed(1)}</span> ({recipe.rating.count})
                  </span>
                </div>
              </>
            )}
            {recipe.totalTime && (
              <>
                <span className="hidden h-8 w-px bg-border sm:block" />
                <span className="inline-flex items-center gap-1.5 text-[0.85rem] text-muted-foreground">
                  <Clock width={14} height={14} /> {recipe.totalTime}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Hero image */}
        <figure className="group relative mx-auto mt-8 max-w-5xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-secondary">
            <img src={recipe.featuredImage} alt={recipe.imageAlt} className="h-full w-full object-cover" />
            <PinSaveButton
              url={recipe.seo.canonicalUrl}
              image={recipe.pinterest.image || recipe.featuredImage}
              description={recipe.pinterest.description || recipe.title}
              className="!right-4 !top-4 !px-4 !py-2 !text-[0.8rem]"
            />
          </div>
          {(recipe.imageCaption || recipe.imageCredit) && (
            <figcaption className="mt-2 flex flex-wrap justify-between gap-2 text-[0.8rem] text-muted-foreground">
              {recipe.imageCaption && <span className="italic">{recipe.imageCaption}</span>}
              {recipe.imageCredit && <span className="shrink-0">{recipe.imageCredit}</span>}
            </figcaption>
          )}
        </figure>

        <div className="mx-auto mt-8 max-w-5xl">
          <QuickInfo r={recipe} />
          <div className="mt-6">
            <ActionBar r={recipe} onPrint={scrollToCard} />
          </div>
          <JumpBar />
        </div>

        {/* Top ad */}
        <div className="mt-10">
          <Ad format="leaderboard" />
        </div>

        {/* Two-column: recipe body + sticky sidebar */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="mx-auto w-full max-w-[760px] space-y-12 lg:mx-0">
            <IngredientsSection r={recipe} />
            <Equipment items={recipe.equipment} />

            {/* recipe-middle ad */}
            <Ad format="rectangle" />

            <Instructions r={recipe} />
            <NotesSection r={recipe} />
            <NutritionSection n={recipe.nutrition} />
            <ProductsSection items={recipe.products} />
            <RecipeCard r={recipe} />

            {/* tags */}
            <div className="flex flex-wrap gap-2 border-t border-border pt-6">
              {recipe.tags.map((t) => (
                <span key={t} className="rounded-full bg-secondary px-3 py-1 text-[0.75rem] text-secondary-foreground">
                  #{t}
                </span>
              ))}
            </div>

            <AuthorBio author={recipe.author} />
          </div>

          <Sidebar />
        </div>

        {/* Related recipes — ~10 */}
        <section className="pt-16">
          <SectionHeader title="Related Recipes" align="left" />
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
    </main>
  )
}
