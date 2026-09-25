import { useEffect } from 'react'
import type { ArticleFull } from '../../lib/articles'
import { relatedFor } from '../../lib/articles'
import { trending, beauty, weddings, celebrations, recipes } from '../../lib/content'
import { Container, SectionHeader, Eyebrow, Badge } from '../ui/primitives'
import { ArticleCard } from '../ui/ArticleCard'
import {
  TopBannerAd,
  BottomArticleAd,
  SidebarAd,
  MobileInlineAd,
  AffiliateProductBlock,
} from '../ads'
import { sampleAffiliateProducts } from '../../lib/ads'
import { Newsletter } from '../ui/Newsletter'
import { BlockRenderer, tocHeadings } from './blocks'
import { Pinterest, Clock } from '../ui/icons'
import { SocialShare } from '../pinterest/SocialShare'
import { PinSaveButton } from '../pinterest/PinSaveButton'

/* --------------------- SEO / structured data (in document head) --------------------- */
function useArticleSeo(a: ArticleFull) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = a.seo.seoTitle

    const created: HTMLElement[] = []
    const meta = (attr: 'name' | 'property', key: string, content: string) => {
      const el = document.createElement('meta')
      el.setAttribute(attr, key)
      el.setAttribute('content', content)
      document.head.appendChild(el)
      created.push(el)
    }
    meta('name', 'description', a.seo.metaDescription)
    meta('name', 'robots', a.seo.robots)
    meta('property', 'og:title', a.seo.seoTitle)
    meta('property', 'og:description', a.seo.metaDescription)
    meta('property', 'og:image', a.seo.ogImage)
    meta('property', 'og:type', 'article')
    meta('name', 'twitter:card', 'summary_large_image')
    meta('name', 'pinterest:title', a.pinterest.title)
    meta('name', 'pinterest:description', a.pinterest.description)

    const canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    canonical.setAttribute('href', a.seo.canonicalUrl)
    document.head.appendChild(canonical)
    created.push(canonical)

    const ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.text = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': a.seo.schemaType,
        headline: a.title,
        description: a.excerpt,
        image: a.seo.ogImage,
        datePublished: a.publishedDate,
        dateModified: a.updatedDate ?? a.publishedDate,
        author: { '@type': 'Person', name: a.author.name },
        publisher: { '@type': 'Organization', name: 'Marigold & Maple' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: a.breadcrumb.map((c, i) => ({
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
  }, [a])
}

/* --------------------- Breadcrumbs --------------------- */
function Breadcrumbs({ items }: { items: ArticleFull['breadcrumb'] }) {
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

/* --------------------- Table of contents --------------------- */
function TableOfContents({ items }: { items: { id: string; text: string }[] }) {
  if (items.length < 3) return null // optional: hide when too few headings
  return (
    <nav className="rounded-lg border border-border bg-card p-5">
      <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        In this article
      </p>
      <ol className="space-y-2">
        {items.map((h, i) => (
          <li key={h.id} className="flex gap-2 text-[0.9rem]">
            <span className="text-seasonal">{String(i + 1).padStart(2, '0')}</span>
            <a href={`#${h.id}`} className="text-foreground transition-colors hover:text-primary">
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* --------------------- Author bio --------------------- */
function AuthorBio({ author }: { author: ArticleFull['author'] }) {
  return (
    <section className="mt-14 rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row">
        <img
          src={author.avatar}
          alt={author.name}
          className="h-20 w-20 shrink-0 rounded-full object-cover"
        />
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Written by
          </p>
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
        <SidebarAd />
        <div>
          <p className="mb-4 border-b border-border pb-2 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Trending Now
          </p>
          <div className="space-y-5">
            {trending.slice(0, 4).map((a) => (
              <ArticleCard key={a.id} article={a} variant="horizontal" />
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-foreground p-6 text-center text-background">
          <Pinterest className="mx-auto mb-2 text-background/70" width={22} height={22} />
          <p className="font-serif text-[1.15rem] font-semibold leading-tight">The Sunday Edit</p>
          <p className="mt-1 text-[0.82rem] text-background/70">Seasonal ideas in your inbox weekly.</p>
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

/* --------------------- Page --------------------- */
export function ArticlePage({ article }: { article: ArticleFull }) {
  useArticleSeo(article)
  const toc = tocHeadings(article.content)
  const pool = [...beauty, ...weddings, ...celebrations, ...recipes, ...trending]
  const related = relatedFor(article, pool)
  const more = pool.slice(6, 10)

  return (
    <main data-season={article.season} className="pb-4">
      <Container width="wide">
        <Breadcrumbs items={article.breadcrumb} />

        {/* Header — comfortable centered measure */}
        <header className="mx-auto max-w-3xl pt-6 text-center">
          <div className="mb-4 flex justify-center">
            <Badge>{article.subcategory || article.category}</Badge>
          </div>
          <h1 className="font-serif text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-[3rem]">
            {article.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[1.1rem] leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>

          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="flex items-center gap-3">
              <img src={article.author.avatar} alt={article.author.name} className="h-11 w-11 rounded-full object-cover" />
              <div className="text-left">
                <p className="text-[0.9rem] font-semibold text-foreground">By {article.author.name}</p>
                <p className="flex items-center gap-2 text-[0.78rem] text-muted-foreground">
                  <span>{article.publishedDate}</span>
                  <span className="text-border">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock width={13} height={13} /> {article.readTime}
                  </span>
                </p>
              </div>
            </div>
            <span className="hidden h-8 w-px bg-border sm:block" />
            <SocialShare
              url={article.seo.canonicalUrl}
              title={article.pinterest.title || article.title}
              description={article.pinterest.description || article.excerpt}
              image={article.pinterest.image}
            />
          </div>
          {article.updatedDate && (
            <p className="mt-3 text-[0.75rem] text-muted-foreground">Updated {article.updatedDate}</p>
          )}
        </header>

        {/* Featured image */}
        <figure className="group relative mx-auto mt-8 max-w-5xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-secondary">
            <img src={article.featuredImage} alt={article.imageAlt} className="h-full w-full object-cover" />
            <PinSaveButton
              url={article.seo.canonicalUrl}
              image={article.pinterest.image || article.featuredImage}
              description={article.pinterest.description || article.title}
              className="!right-4 !top-4 !px-4 !py-2 !text-[0.8rem]"
            />
          </div>
          {(article.imageCaption || article.imageCredit) && (
            <figcaption className="mt-2 flex flex-wrap justify-between gap-2 text-[0.8rem] text-muted-foreground">
              {article.imageCaption && <span className="italic">{article.imageCaption}</span>}
              {article.imageCredit && <span className="shrink-0">{article.imageCredit}</span>}
            </figcaption>
          )}
        </figure>

        {/* Top ad (config-driven article_top slot) */}
        <TopBannerAd slotId="article_top" className="mt-10" />

        {/* Two-column: article + sticky sidebar */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="mx-auto w-full max-w-[720px] lg:mx-0">
            {toc.length >= 3 && (
              <div className="mb-8">
                <TableOfContents items={toc} />
              </div>
            )}
            <div className="editorial-body space-y-6">
              {article.content.map((block, i) => (
                <BlockRenderer key={i} block={block} />
              ))}
            </div>

            {/* Mobile-only inline unit (never the desktop sticky sidebar) */}
            <MobileInlineAd slotId="mobile_inline_1" />

            {/* Affiliate product recommendations */}
            <AffiliateProductBlock
              title="Shop This Look"
              products={sampleAffiliateProducts}
              className="mt-8"
            />

            {/* Bottom share + tags */}
            <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-3 py-1 text-[0.75rem] text-secondary-foreground">
                    #{t}
                  </span>
                ))}
              </div>
              <SocialShare
                url={article.seo.canonicalUrl}
                title={article.pinterest.title || article.title}
                description={article.pinterest.description || article.excerpt}
                image={article.pinterest.image}
              />
            </div>

            <AuthorBio author={article.author} />
          </article>

          <Sidebar />
        </div>

        {/* Related — ~10 */}
        <section className="pt-16">
          <SectionHeader title="You May Also Like" align="left" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((a, i) => (
              <ArticleCard key={`${a.id}-${i}`} article={a} variant="compact" />
            ))}
          </div>
        </section>

        {/* Bottom ad (config-driven article_bottom slot) */}
        <BottomArticleAd slotId="article_bottom" className="pt-14" />

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
