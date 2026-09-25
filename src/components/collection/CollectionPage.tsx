import { useEffect } from 'react'
import { Container, SectionHeader, Eyebrow, Button } from '../ui/primitives'
import { ArticleCard } from '../ui/ArticleCard'
import { CategoryPageAd, RelatedContentAd } from '../ads'
import { SocialShare } from '../pinterest'
import { ArrowRight, Pinterest } from '../ui/icons'
import { contentType } from '../../lib/admin/cms'
import { collectionContent, SITE_URL, type Collection } from '../../lib/admin/site'
import type { Article } from '../../lib/content'

/* =========================================================================
   Phase 16 — Universal public Collection page (/collections/:slug).

   ONE reusable template renders any collection — now or in the future.
   Reuses the existing card, ad, newsletter and Pinterest/social components.
   SEO is driven by the collection's own settings (Phase 12); temporary
   campaigns can stay noindex.
   ========================================================================= */

/** Map a universal ContentItem into the public Article card shape. */
function toArticle(item: ReturnType<typeof collectionContent>[number]): Article {
  const def = contentType(item.type)
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    href: `${def.routePrefix}/${item.slug}`,
    image: item.featuredImage,
    author: { name: item.author, role: '', avatar: '' },
    date: item.publishedDate ?? item.updatedDate,
    excerpt: '',
  }
}

export function CollectionPage({ collection }: { collection: Collection }) {
  const items = collectionContent(collection)
  const articles = items.map(toArticle)
  const url = `${SITE_URL}/collections/${collection.slug}`

  useEffect(() => {
    document.title = `${collection.seo.title ?? collection.name} — Marigold & Maple`

    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.content = content
      return el
    }

    const desc = collection.seo.description ?? collection.description
    const created: HTMLElement[] = []
    created.push(setMeta('name', 'description', desc))
    created.push(setMeta('name', 'robots', collection.seo.indexable ? 'index, follow' : 'noindex, follow'))
    created.push(setMeta('property', 'og:title', collection.seo.title ?? collection.name))
    created.push(setMeta('property', 'og:description', desc))
    created.push(setMeta('property', 'og:image', collection.coverImage))
    created.push(setMeta('property', 'og:type', 'website'))

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const madeCanonical = !canonical
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = collection.seo.canonical ?? url

    // JSON-LD ItemList
    const ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: collection.name,
      description: desc,
      url,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: articles.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}${a.href}`, name: a.title })),
      },
    })
    document.head.appendChild(ld)

    return () => {
      ld.remove()
      if (madeCanonical) canonical?.remove()
    }
  }, [collection, url, articles])

  return (
    <main>
      {/* Breadcrumbs */}
      <Container width="wide" className="pt-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[0.76rem] text-muted-foreground">
          <a href="/" className="hover:text-foreground">Home</a>
          <span className="text-border">/</span>
          <a href="/collections" className="hover:text-foreground">Collections</a>
          <span className="text-border">/</span>
          <span className="text-foreground">{collection.name}</span>
        </nav>
      </Container>

      {/* Header + cover */}
      <section className="pt-8">
        <Container width="wide">
          <div className="grid overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden bg-secondary lg:aspect-auto">
              <img src={collection.coverImage} alt={collection.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center gap-4 p-7 sm:p-12">
              <Eyebrow>Collection</Eyebrow>
              <h1 className="font-serif text-[2rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-[2.6rem]">
                {collection.name}
              </h1>
              <div className="h-px w-16 bg-seasonal" />
              <p className="max-w-md text-[1rem] leading-relaxed text-muted-foreground">{collection.description}</p>
              <p className="text-[0.78rem] uppercase tracking-[0.12em] text-muted-foreground">
                {articles.length} {articles.length === 1 ? 'idea' : 'ideas'} in this collection
              </p>
              <div className="pt-1">
                <SocialShare url={url} title={collection.name} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Content grid */}
      <section className="pt-14">
        <Container width="wide">
          <SectionHeader title="In this collection" align="left" />
          {articles.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-secondary/30 px-6 py-14 text-center text-muted-foreground">
              This collection doesn’t have any published items yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Ad */}
      <div className="pt-16">
        <Container width="wide">
          <CategoryPageAd />
        </Container>
      </div>

      {/* Related content */}
      <section className="pt-16">
        <Container width="wide">
          <SectionHeader title="More to explore" align="left" href="/collections" />
          <RelatedContentAd />
        </Container>
      </section>

      {/* Newsletter */}
      <section className="pt-20">
        <Container width="wide">
          <div className="overflow-hidden rounded-2xl bg-foreground px-6 py-14 text-center text-background sm:px-12">
            <Pinterest className="mx-auto mb-4 text-background/70" width={26} height={26} />
            <h2 className="mx-auto max-w-xl font-serif text-[1.8rem] font-semibold leading-tight sm:text-[2.3rem]">
              Love this collection? Get more every Sunday
            </h2>
            <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
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
          </div>
        </Container>
      </section>
    </main>
  )
}
