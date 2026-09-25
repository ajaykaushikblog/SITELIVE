import { useEffect, useMemo, useState } from 'react'
import type { AuthorProfile, ContentCard, ContentType, SocialLink } from '../../lib/authorProfiles'
import { contentForAuthor, topicsForAuthor } from '../../lib/authorProfiles'
import { Container, SectionHeader, Eyebrow, Button } from '../ui/primitives'
import { ArticleCard } from '../ui/ArticleCard'
import { Ad } from '../ui/Ad'
import { Newsletter } from '../ui/Newsletter'
import { Pinterest, Facebook, Instagram } from '../ui/icons'

/* --------------------- SEO / structured data --------------------- */
function useAuthorSeo(p: AuthorProfile) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = p.seo.seoTitle

    const created: HTMLElement[] = []
    const meta = (attr: 'name' | 'property', key: string, content: string) => {
      const el = document.createElement('meta')
      el.setAttribute(attr, key)
      el.setAttribute('content', content)
      document.head.appendChild(el)
      created.push(el)
    }
    meta('name', 'description', p.seo.metaDescription)
    meta('name', 'robots', p.seo.robots)
    meta('property', 'og:title', p.seo.seoTitle)
    meta('property', 'og:description', p.seo.metaDescription)
    meta('property', 'og:image', p.seo.ogImage)
    meta('property', 'og:type', 'profile')

    const canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    canonical.setAttribute('href', p.seo.canonicalUrl)
    document.head.appendChild(canonical)
    created.push(canonical)

    const ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.text = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: p.name,
          jobTitle: p.professionalTitle,
          description: p.shortBio,
          image: p.seo.ogImage,
          ...(p.website ? { url: p.website } : {}),
          ...(p.email ? { email: p.email } : {}),
          knowsAbout: p.expertise.map((e) => e.label),
          sameAs: p.socialLinks.map((s) => s.href),
          worksFor: { '@type': 'Organization', name: 'Marigold & Maple' },
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://marigoldandmaple.com/' },
          { '@type': 'ListItem', position: 2, name: 'Authors', item: 'https://marigoldandmaple.com/authors' },
          { '@type': 'ListItem', position: 3, name: p.name, item: p.seo.canonicalUrl },
        ],
      },
    ])
    document.head.appendChild(ld)
    created.push(ld)

    return () => {
      document.title = prevTitle
      created.forEach((el) => el.remove())
    }
  }, [p])
}

/* --------------------- Social icons --------------------- */
const XIcon = (pr: { width?: number; height?: number }) => (
  <svg width={pr.width ?? 18} height={pr.height ?? 18} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5.3-6.9L4.8 22H1.7l7.8-8.9L1 2h6.9l4.8 6.3L18.9 2Zm-2.4 18h1.9L7.6 4H5.6l10.9 16Z" />
  </svg>
)
const TikTok = (pr: { width?: number; height?: number }) => (
  <svg width={pr.width ?? 18} height={pr.height ?? 18} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 2c.3 2.2 1.6 3.7 3.8 3.9v2.5c-1.3.1-2.5-.3-3.8-1v6.6c0 4.2-3.4 6.9-7 6-2.5-.6-4.1-3-3.8-5.6.3-2.7 2.8-4.6 5.5-4.3.2 0 .4.1.6.1v2.6c-.3-.1-.6-.2-.9-.2-1.2 0-2.2 1-2.2 2.2s1 2.2 2.2 2.2 2.3-1 2.3-2.4V2h2.9Z" />
  </svg>
)
const YouTube = (pr: { width?: number; height?: number }) => (
  <svg width={pr.width ?? 18} height={pr.height ?? 18} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 12s0-3.1-.4-4.6a2.5 2.5 0 0 0-1.8-1.8C19.3 5.2 12 5.2 12 5.2s-7.3 0-8.8.4A2.5 2.5 0 0 0 1.4 7.4C1 8.9 1 12 1 12s0 3.1.4 4.6a2.5 2.5 0 0 0 1.8 1.8c1.5.4 8.8.4 8.8.4s7.3 0 8.8-.4a2.5 2.5 0 0 0 1.8-1.8C23 15.1 23 12 23 12ZM9.8 15.3V8.7l6 3.3-6 3.3Z" />
  </svg>
)
const Globe = (pr: { width?: number; height?: number }) => (
  <svg width={pr.width ?? 18} height={pr.height ?? 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
  </svg>
)

function SocialButton({ link }: { link: SocialLink }) {
  const icon = {
    Instagram: <Instagram width={18} height={18} />,
    Pinterest: <Pinterest width={18} height={18} />,
    Facebook: <Facebook width={18} height={18} />,
    X: <XIcon />,
    TikTok: <TikTok />,
    YouTube: <YouTube />,
    Website: <Globe />,
  }[link.platform]
  return (
    <a
      href={link.href}
      aria-label={link.platform}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
    >
      {icon}
    </a>
  )
}

/* --------------------- Breadcrumbs --------------------- */
function Breadcrumbs({ name }: { name: string }) {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Authors', href: '/authors' },
    { label: name, href: '' },
  ]
  return (
    <nav aria-label="Breadcrumb" className="pt-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.78rem] text-muted-foreground">
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={c.label} className="flex items-center gap-1.5">
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

/* --------------------- Stats --------------------- */
function Stats({ p }: { p: AuthorProfile }) {
  const stats = [
    { label: 'Articles', value: p.articleCount },
    { label: 'Recipes', value: p.recipeCount },
    { label: 'DIY Projects', value: p.diyCount },
    { label: 'Years', value: p.yearsExperience },
  ].filter((s) => s.value != null)
  if (stats.length === 0) return null
  return (
    <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
      {stats.map((s) => (
        <div key={s.label}>
          <span className="font-serif text-[1.5rem] font-semibold text-foreground">
            {s.value!.toLocaleString()}
          </span>
          <span className="ml-1.5 text-[0.8rem] uppercase tracking-[0.12em] text-muted-foreground">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  )
}

/* --------------------- Filters --------------------- */
const FILTERS: ContentType[] = ['Article', 'Recipe', 'DIY', 'Guide', 'Ideas']

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-[0.82rem] font-semibold transition-colors ${
        active
          ? 'border-transparent bg-foreground text-background'
          : 'border-border bg-card text-foreground hover:border-foreground'
      }`}
    >
      {children}
    </button>
  )
}

const PAGE_SIZE = 9

/* --------------------- Page --------------------- */
export function AuthorPage({ profile }: { profile: AuthorProfile }) {
  useAuthorSeo(profile)

  const allContent = useMemo(() => contentForAuthor(profile.name), [profile])

  /* Pool up the author's real content so load-more is meaningful at scale */
  const pooled = useMemo(() => {
    if (allContent.length === 0) return []
    const out: ContentCard[] = []
    for (let i = 0; i < 30; i++) {
      const src = allContent[i % allContent.length]
      out.push({ ...src, id: `${src.id}-${i}` })
    }
    return out
  }, [allContent])

  const topics = useMemo(() => topicsForAuthor(allContent), [allContent])

  const [filter, setFilter] = useState<'All' | ContentType>('All')
  const [count, setCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const list = filter === 'All' ? pooled : pooled.filter((c) => c.contentType === filter)
    return list
  }, [pooled, filter])

  const visible = filtered.slice(0, count)
  const featured = allContent[0]
  /* which filters actually have content */
  const availableFilters = FILTERS.filter((f) => pooled.some((c) => c.contentType === f))

  return (
    <main className="pb-4">
      <Container width="wide">
        <Breadcrumbs name={profile.name} />

        {/* Profile header */}
        <section className="mt-4 grid gap-8 rounded-2xl border border-border bg-card p-6 sm:p-9 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <img
              src={profile.profileImage}
              alt={profile.name}
              className="h-36 w-36 rounded-full object-cover ring-4 ring-seasonal-soft"
            />
            <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              {profile.socialLinks.map((s) => (
                <SocialButton key={s.platform} link={s} />
              ))}
            </div>
          </div>

          <div>
            <Eyebrow>{profile.professionalTitle}</Eyebrow>
            <h1 className="mt-2 font-serif text-[2.2rem] font-semibold leading-tight tracking-tight text-foreground sm:text-[2.8rem]">
              {profile.name}
            </h1>
            <p className="mt-3 max-w-2xl text-[1.1rem] leading-relaxed text-muted-foreground">
              {profile.shortBio}
            </p>

            <div className="mt-5 space-y-3">
              {profile.longBio.map((para, i) => (
                <p key={i} className="max-w-2xl text-[0.98rem] leading-relaxed text-foreground/85">
                  {para}
                </p>
              ))}
            </div>

            {/* meta row */}
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.85rem] text-muted-foreground">
              {profile.location && (
                <span className="inline-flex items-center gap-1.5">
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a href={profile.website} className="font-semibold text-primary hover:text-foreground">
                  Visit website →
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="font-semibold text-primary hover:text-foreground">
                  Contact
                </a>
              )}
            </div>

            {profile.credentials && profile.credentials.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {profile.credentials.map((c) => (
                  <li key={c} className="rounded-full bg-secondary px-3 py-1 text-[0.75rem] font-medium text-secondary-foreground">
                    {c}
                  </li>
                ))}
              </ul>
            )}

            <Stats p={profile} />
          </div>
        </section>

        {/* Expertise */}
        <section className="mt-10">
          <p className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Areas of Expertise
          </p>
          <div className="flex flex-wrap gap-2.5">
            {profile.expertise.map((e) =>
              e.href ? (
                <a
                  key={e.label}
                  href={e.href}
                  className="rounded-full border border-border bg-card px-4 py-2 text-[0.85rem] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {e.label}
                </a>
              ) : (
                <span key={e.label} className="rounded-full border border-border bg-card px-4 py-2 text-[0.85rem] font-semibold text-foreground">
                  {e.label}
                </span>
              ),
            )}
          </div>
        </section>

        {/* Top ad */}
        <div className="mt-10">
          <Ad format="leaderboard" />
        </div>

        {/* Featured */}
        {featured && (
          <section className="mt-12">
            <SectionHeader title={`Featured From ${profile.name.split(' ')[0]}`} align="left" />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <ArticleCard article={featured} variant="large" />
              <div className="hidden lg:block">
                <Ad format="half-page" />
              </div>
            </div>
          </section>
        )}

        {/* Latest + filters + sidebar */}
        <section className="mt-14">
          <SectionHeader title={`Latest From ${profile.name.split(' ')[0]}`} align="left" />

          {/* filters */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <Chip active={filter === 'All'} onClick={() => { setFilter('All'); setCount(PAGE_SIZE) }}>
              All
            </Chip>
            {availableFilters.map((f) => (
              <Chip
                key={f}
                active={filter === f}
                onClick={() => { setFilter(f); setCount(PAGE_SIZE) }}
              >
                {f === 'DIY' ? 'DIY' : `${f}s`}
              </Chip>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              {visible.length > 0 ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                  No {filter.toLowerCase()} content yet.
                </p>
              )}

              {count < filtered.length && (
                <div className="mt-10 flex justify-center">
                  <Button variant="outline" size="lg" onClick={() => setCount((c) => c + PAGE_SIZE)}>
                    Load more
                  </Button>
                </div>
              )}
              <p className="mt-4 text-center text-[0.8rem] text-muted-foreground">
                Showing {Math.min(count, filtered.length)} of {filtered.length}
              </p>
            </div>

            {/* sticky sidebar ad */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                <Ad format="half-page" />
                <div className="rounded-xl bg-foreground p-6 text-center text-background">
                  <Pinterest className="mx-auto mb-2 text-background/70" width={22} height={22} />
                  <p className="font-serif text-[1.15rem] font-semibold leading-tight">Follow {profile.name.split(' ')[0]}</p>
                  <p className="mt-1 text-[0.82rem] text-background/70">New posts in your inbox weekly.</p>
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
          </div>
        </section>

        {/* Explore topics */}
        {topics.length > 0 && (
          <section className="mt-16">
            <SectionHeader title={`Explore ${profile.name.split(' ')[0]}'s Topics`} align="left" />
            <div className="flex flex-wrap gap-2.5">
              {topics.map((t) => (
                <a
                  key={t.label}
                  href={t.href}
                  className="rounded-full border border-border bg-card px-4 py-2 text-[0.85rem] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {t.label}
                </a>
              ))}
            </div>
          </section>
        )}
      </Container>

      <div className="mt-16">
        <Newsletter />
      </div>
    </main>
  )
}
