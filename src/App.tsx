import { useEffect } from 'react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Homepage } from './components/home/Homepage'
import { CategoryPage } from './components/category/CategoryPage'
import { ArticlePage } from './components/article/ArticlePage'
import { RecipePage } from './components/recipe/RecipePage'
import { categories } from './lib/categories'
import { getArticle } from './lib/articles'
import { getRecipe } from './lib/recipes'
import { DIYPage } from './components/diy/DIYPage'
import { getDIY } from './lib/diy'
import { AuthorPage } from './components/author/AuthorPage'
import { getAuthorProfile } from './lib/authorProfiles'
import { SearchPage } from './components/search/SearchPage'
import { CollectionPage } from './components/collection/CollectionPage'
import { getCollection } from './lib/admin/site'
import { AdminLayout } from './components/admin/AdminLayout'
import { SiteCodeInjector } from './components/SiteCodeInjector'
import { NotFound } from './components/NotFound'
import { usePathname, useLinkInterceptor } from './lib/router'
import { apiConfigured } from './lib/api/client'
import { useAdminPath } from './lib/api/useAdminPath'
import { DEFAULT_ADMIN_PATH } from './lib/adminPath'

function Router() {
  const pathname = usePathname()
  const parts = pathname.replace(/^\/+/, '').split('/')
  const slug = parts[0]

  if (pathname === '/' || slug === '') return <Homepage />

  // Universal Search Results Page: /search?q=...
  if (slug === 'search') return <SearchPage />

  // Universal Article Page: /article/:slug
  if (slug === 'article') {
    const article = getArticle(parts[1] ?? '')
    if (article) return <ArticlePage article={article} />
  }

  // Universal Recipe Page: /recipe/:slug
  if (slug === 'recipe') {
    const recipe = getRecipe(parts[1] ?? '')
    if (recipe) return <RecipePage recipe={recipe} />
  }

  // Universal Collection Page: /collections/:slug
  if (slug === 'collections' && parts[1]) {
    const collection = getCollection(parts[1])
    if (collection) return <CollectionPage collection={collection} />
  }

  // Universal Author Profile Page: /author/:slug
  if (slug === 'author') {
    const profile = getAuthorProfile(parts[1] ?? '')
    if (profile) return <AuthorPage profile={profile} />
  }

  // Universal DIY / Tutorial Page: /diy/:slug (bare /diy falls through to the category)
  if (slug === 'diy' && parts[1]) {
    const project = getDIY(parts[1])
    if (project) return <DIYPage project={project} />
  }

  const config = categories[slug]
  if (config) return <CategoryPage config={config} />

  // Any not-yet-built category route falls back to a live template so every
  // nav link resolves. Defaults to the Christmas config's structure.
  return <CategoryPage config={categories.christmas} />
}

export default function App() {
  const onClick = useLinkInterceptor()
  useEffect(() => {
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [onClick])

  const pathname = usePathname()
  const { adminPath, ready: pathReady } = useAdminPath()
  const seg0 = pathname.replace(/^\/+/, '').split('/')[0]
  const baseSeg = adminPath.replace(/^\/+/, '')
  const customized = adminPath !== DEFAULT_ADMIN_PATH

  // Wait for the configured admin path before deciding admin routing, so we
  // don't briefly render the CMS at the old /admin when a custom path is set.
  if (apiConfigured && !pathReady && (seg0 === baseSeg || seg0 === 'admin')) {
    return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground"><p className="text-[0.85rem]">Loading…</p></div>
  }

  // CMS admin runs on its own chrome, without the public header/footer.
  if (seg0 === baseSeg) return <AdminLayout />
  // Old /admin must 404 once a custom admin URL is configured.
  if (customized && seg0 === 'admin') return <NotFound />

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteCodeInjector />
      <Header />
      <Router />
      <Footer />
    </div>
  )
}
