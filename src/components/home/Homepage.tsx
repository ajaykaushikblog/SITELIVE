import {
  featured,
  trending,
  seasonalSpotlight,
  popularCategories,
  recipes,
  beauty,
  weddings,
  celebrations,
  type Article,
} from '../../lib/content'
import { Container, SectionHeader, Eyebrow, Button, Badge } from '../ui/primitives'
import { ArticleCard } from '../ui/ArticleCard'
import { HomepageAd, SponsoredContentBlock } from '../ads'
import { sampleSponsored } from '../../lib/ads'
import { ArrowRight, Pinterest } from '../ui/icons'

/* --------------------------- Featured hero --------------------------- */
function FeaturedHero() {
  return (
    <section className="pt-8 sm:pt-12">
      <Container width="wide">
        <a
          href={featured.href}
          className="group grid overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-2"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary lg:aspect-auto">
            <img
              src={featured.image}
              alt={featured.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col justify-center gap-4 p-7 sm:p-12">
            <Eyebrow>{featured.category}</Eyebrow>
            <h1 className="font-serif text-[2rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-[2.7rem]">
              {featured.title}
            </h1>
            <div className="h-px w-16 bg-seasonal" />
            <p className="max-w-md text-[1rem] leading-relaxed text-muted-foreground">
              {featured.excerpt}
            </p>
            <p className="text-[0.78rem] uppercase tracking-[0.12em] text-muted-foreground">
              By <span className="font-semibold text-foreground">{featured.author.name}</span> &middot;{' '}
              {featured.readTime}
            </p>
          </div>
        </a>
      </Container>
    </section>
  )
}

/* --------------------------- Trending row --------------------------- */
function Trending() {
  return (
    <section className="pt-14">
      <Container width="wide">
        <SectionHeader title="Trending Now" align="left" href="/trending" />
        <CardGrid items={trending} />
      </Container>
    </section>
  )
}

/* --------------------------- Seasonal spotlight (swappable) --------------------------- */
function SeasonalSpotlight() {
  const s = seasonalSpotlight
  return (
    <section data-season={s.season} className="pt-16">
      <Container width="wide">
        <div className="mb-9 flex flex-col items-center">
          <Eyebrow className="mb-3">{s.eyebrow}</Eyebrow>
          <h2 className="relative inline-block px-4 text-center font-serif text-[2rem] font-semibold tracking-tight text-seasonal sm:text-[2.5rem]">
            {s.title}
            <span className="absolute inset-x-2 bottom-1 -z-0 h-3 rounded-full bg-seasonal-soft" aria-hidden />
          </h2>
        </div>
        <CardGrid items={s.articles} />
      </Container>
    </section>
  )
}

/* --------------------------- Popular categories --------------------------- */
function PopularCategories() {
  return (
    <section className="pt-16">
      <Container width="wide">
        <SectionHeader title="Browse by Category" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {popularCategories.map((c) => (
            <a key={c.label} href={c.href} className="group relative overflow-hidden rounded-lg bg-secondary">
              <div className="aspect-[4/5]">
                <img
                  src={c.image}
                  alt={c.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-3 text-center font-serif text-[1.05rem] font-semibold text-white">
                {c.label}
              </span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* --------------------------- Reusable 4-card grid --------------------------- */
function CardGrid({ items, badgeTone }: { items: Article[]; badgeTone?: 'seasonal' | 'solid' }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((a) => (
        <ArticleCard key={a.id} article={a} badgeTone={badgeTone} />
      ))}
    </div>
  )
}

/* --------------------------- Topic section --------------------------- */
function TopicSection({ title, href, items }: { title: string; href: string; items: Article[] }) {
  return (
    <section className="pt-16">
      <Container width="wide">
        <SectionHeader title={title} href={href} align="left" />
        <CardGrid items={items} />
      </Container>
    </section>
  )
}

/* --------------------------- Newsletter --------------------------- */
function Newsletter() {
  return (
    <section className="pt-20">
      <Container width="wide">
        <div className="overflow-hidden rounded-2xl bg-foreground px-6 py-14 text-center text-background sm:px-12">
          <Pinterest className="mx-auto mb-4 text-background/70" width={26} height={26} />
          <h2 className="mx-auto max-w-xl font-serif text-[1.8rem] font-semibold leading-tight sm:text-[2.3rem]">
            Get seasonal ideas delivered every Sunday
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[0.95rem] text-background/70">
            Recipes, celebrations, decor and pretty little projects — thoughtfully curated, never spammy.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="h-12 flex-1 rounded-md border border-background/20 bg-background/10 px-4 text-background outline-none placeholder:text-background/50 focus:border-background/50"
            />
            <Button size="lg" className="shrink-0">
              Subscribe <ArrowRight width={16} height={16} />
            </Button>
          </form>
          <p className="mt-3 text-[0.72rem] text-background/50">
            Join 42,000+ readers. Unsubscribe anytime.
          </p>
        </div>
      </Container>
    </section>
  )
}

export function Homepage() {
  return (
    <main>
      <FeaturedHero />
      <Trending />

      {/* Billboard ad — reserved space, never overlaps content */}
      <div className="pt-14">
        <Container width="wide">
          <HomepageAd slotId="homepage_mid" />
        </Container>
      </div>

      <SeasonalSpotlight />
      <PopularCategories />
      <TopicSection title="Recipes & Food" href="/recipes" items={recipes} />
      <TopicSection title="Beauty & Nails" href="/beauty" items={beauty} />

      {/* Native-style sponsored feature, clearly separated from editorial */}
      <div className="pt-16">
        <Container width="wide">
          <SponsoredContentBlock item={sampleSponsored} />
        </Container>
      </div>

      {/* Leaderboard ad between topic blocks */}
      <div className="pt-16">
        <Container width="wide">
          <HomepageAd slotId="footer" />
        </Container>
      </div>

      <TopicSection title="Weddings & Celebrations" href="/weddings" items={weddings} />
      <TopicSection title="Birthdays & Showers" href="/birthdays" items={celebrations} />
      <Newsletter />
    </main>
  )
}
