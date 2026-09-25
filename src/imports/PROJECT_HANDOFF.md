# Marigold & Maple — Project Handoff

A large, Pinterest-first **editorial lifestyle website + universal CMS admin**, built in
Figma Make (React 19 + Vite 8 + TypeScript 5.7 + Tailwind CSS v4, pnpm).

This document is a complete map of the project so work can continue on another account.
It lists **every file**, what it does, the architecture/conventions to keep, and the next
phases. The source of truth is the code itself — this is the index to it.

> **How to continue:** carry this file + the `src/` tree into the new project. Keep the
> universal, config-driven, token-based architecture. Never invent fake analytics
> (label placeholders clearly). After each phase run `pnpm tsc --noEmit` **and** `pnpm build`.

---

## 1. Stack & conventions

- **React 19 + Vite 8 + TypeScript 5.7**, package manager **pnpm**.
- **Tailwind CSS v4** via `@tailwindcss/vite` (no config file, no PostCSS). `@import 'tailwindcss';`
  lives in `src/index.css`.
- **Design tokens** in `src/styles/theme.css` via `@theme inline` → Tailwind utilities.
  Seasonal accents via `[data-season='fall'|'christmas'|'valentines'|'halloween'|'wedding']`
  and `.dark`. Use token classes (`text-foreground`, `bg-card`, `bg-seasonal-soft`,
  `text-success`, `text-warning`, `text-error`, `text-primary`, etc.) — **never raw hex**.
- **Fonts:** serif display + sans body, wired in `src/index.css` (CSS `@import` first).
- **Router:** custom history-based router in `src/lib/router.tsx` — `usePathname`,
  `useSearchString`, `navigate`, `useLinkInterceptor`. Plain `<a href>` works because
  `App.tsx` installs the global link interceptor.
- **SEO on public pages:** `useEffect` sets title/meta/canonical/JSON-LD. **Admin pages set
  `noindex, nofollow`** (via `useAdminSeo`).
- **Universal / config-driven:** one reusable component/model per concept, not one-offs.
  New content types, taxonomies, ad slots, pin templates and SEO rows are added by data, not
  by new bespoke screens.
- **Responsive:** mobile-first. Global safety net in `src/index.css` (`@layer base`):
  `overflow-x: hidden` on **`html` only** (never `body`, or the sticky header breaks),
  `max-width:100%` media, wrap/balance headings, reduced-motion + coarse-pointer handling.
  **Never add an unlayered universal `*` reset** (it overrides Tailwind's layered rules).

### Commands
```
pnpm dev            # dev server (already running on $PORT / 8443 in Figma Make)
pnpm tsc --noEmit   # type-check — must be clean
pnpm build          # production build — must succeed
```

---

## 2. Entry & shell

| File | Purpose |
|---|---|
| `index.html` | Vite shell, `#root`, loads `src/main.tsx`. |
| `src/main.tsx` | Mounts `App`, imports `src/index.css`. |
| `src/App.tsx` | Installs link interceptor. If path starts `/admin` → `<AdminLayout />`; else public `<Header/> <Router/> <Footer/>`. `Router()` resolves `/`, `/search`, `/article/:slug`, `/recipe/:slug`, `/author/:slug`, `/diy/:slug`, and category slugs (fallback to `categories.christmas`). |
| `src/index.css` | Tailwind import, font wiring, `.editorial-body`, responsive safety net. |
| `src/styles/theme.css` | Design tokens (`@theme inline`), seasonal + dark variants. |
| `src/vite-env.d.ts` | Vite types. |

---

## 3. Public website

### Data libraries (`src/lib/`)
| File | Exports / purpose |
|---|---|
| `content.ts` | Homepage/section feeds: `featured`, `trending`, `seasonalSpotlight`, `popularCategories`, `recipes`, `beauty`, `weddings`, `celebrations`, type `Article`. |
| `articles.ts` | `ArticleFull` type, `getArticle`, `articlesBySlug`, `relatedFor`. Rich model (content blocks, author, pinterest{}, seo{}, taxonomy arrays, status). |
| `recipes.ts` | Recipe model + `getRecipe`, recipe structured-data data. |
| `diy.ts` | DIY/tutorial model + `getDIY`. |
| `authorProfiles.ts` | `AuthorProfile` type, `authorProfiles`, `getAuthorProfile`, `contentForAuthor`, `topicsForAuthor`. |
| `categories.ts` | `CategoryConfig`, `categories` (christmas, weddings, nails, recipes, diy), `sortOptions`, `relatedCategories`. |
| `search.ts` | Universal search index + query logic. |
| `ads.ts` | Ad slot registry: `allSlots`, `slotSummary`, `adFormats`, `analyticsFields`, `affiliateDisclosure`, `sampleSponsored`, types (`AdSlotConfig`, `AdFormat`, `AdDevice`, `AffiliateProduct`, `SponsoredItem`). |
| `pinterest.ts` | `SITE_URL`, `PIN_SPEC`, `PinTemplateId` (9 templates), `pinTemplates`, `getTemplate`, `canonical()`, `pinterestSaveUrl()`, `facebookShareUrl()`, `xShareUrl()`, `validatePin()`, `pinContentSamples`. |
| `router.tsx` | Custom router (see conventions). |

### Public components (`src/components/`)
| File | Purpose |
|---|---|
| `layout/Header.tsx` | Public header + mobile drawer nav with expandable groups. |
| `layout/Footer.tsx` | Responsive footer (tablet grid, padded tap targets). |
| `home/Homepage.tsx` | Featured hero, trending, seasonal spotlight, categories, topic sections, sponsored block, newsletter. |
| `category/CategoryPage.tsx` | Universal category template + collapsible filters. |
| `article/ArticlePage.tsx`, `article/blocks.tsx` | Article template + content-block renderers. |
| `recipe/RecipePage.tsx` | Recipe template (structured data, action bar, save/share). |
| `diy/DIYPage.tsx` | DIY/tutorial template. |
| `author/AuthorPage.tsx` | Author profile (`/author/:slug`). |
| `search/SearchPage.tsx` | Universal search results + bottom-sheet filters. |
| `ui/primitives.tsx` | `Container`, `Button` (primary/secondary/outline/text/pinterest; sm/md/lg), `Badge`, `Eyebrow`, `SectionHeader`. |
| `ui/icons.tsx` | Inline SVG icon set (Search, Menu, Close, ChevronDown, ArrowRight, Print, Download, Share, Heart, Pinterest, Facebook, Instagram, Clock, X, Link, Check, Plus, Copy, Trash, Star). |
| `ui/ArticleCard.tsx` | Card w/ `PinSaveButton`. |
| `ui/Newsletter.tsx`, `ui/Ad.tsx` | Shared newsletter block, ad wrapper. |
| `ads/AdSlot.tsx`, `ads/index.ts` | Reusable `AdSlot` + named placements (TopBanner, InContent, Sidebar/StickySidebar, MobileInline, Homepage, Category, Related) + `AffiliateProductBlock`, `SponsoredContentBlock`. Reserves dimensions (no layout shift), device targeting, "Advertisement" label. |

### Pinterest / social system (`src/components/pinterest/`) — Phase 9
| File | Purpose |
|---|---|
| `PinSaveButton.tsx` | Pinterest "Save" button (uses `pinterestSaveUrl`). |
| `SocialShare.tsx` | Facebook / X / copy-link share row. |
| `PinTemplateVisual.tsx` | Renders a pin visual for a `PinTemplateId` (CSS container queries). |
| `PinTemplateSelector.tsx` | Template picker. |
| `PinterestPreview.tsx` | CMS "Pinterest Preview" card. Props: `title, description, image, template, destination`. |
| `SocialPreview.tsx` | OG/social card (1.91:1). Props: `title, description, image, destination, siteName?`. |
| `index.ts` | Barrel export for all of the above. |

---

## 4. CMS Admin — Phase 11 (Universal CMS)

Runs on its own chrome under `/admin` (no public header/footer), `noindex,nofollow`.
Sidebar + top bar + internal path router. Editorial dashboard aesthetic (**not** WordPress).

### Admin data (`src/lib/admin/`)
| File | Purpose |
|---|---|
| `cms.ts` | **Universal content model.** `ContentTypeId` (article/recipe/diy/listicle/guide/product-guide) + `contentTypes` registry; `ContentStatus` (draft/review/scheduled/published/unpublished/trash) + `statusMeta`; `ContentItem` type + `contentItems` seed; `corpusTotals`; taxonomy (`taxonomyKinds`, `taxonomyByKind`, `TaxonomyTerm`); media (`mediaItems`, `MediaItem`, `mediaTotal`); authors (`adminAuthors`, reuses `authorProfiles`); `activityLog`; `healthChecks`; roles/permissions (`roles`, `permissions`, `rolePermissions`); `editorBlocks` palette; `robotsOptions`, `schemaTypes`, `pinTemplateOptions`; `queryContent()` helper; `SITE_URL_FALLBACK`. |

### Admin shell + primitives (`src/components/admin/`)
| File | Purpose |
|---|---|
| `ui.tsx` | **Reusable admin primitives:** `useAdminSeo(title)`, `AdminPageHeader`, `StatCard`, `Badge`, `Panel`, `Field`, `Textarea`, `Select`, `Tabs`, `EmptyState`, `ConceptNote`, `ConfirmBar`, `PillButton`. |
| `AdminLayout.tsx` | The shell: sidebar `nav` config (Dashboard, Content, Taxonomy, Media, People, Monetization, SEO, Site, System), top bar + global search, mobile drawer + scrim, and `renderPage(parts)` internal router. `isActive` + `exactOnly` set for nav highlighting. |
| `AdminPinterest.tsx` | (Phase 9) Content → Pinterest manager (multi-pin add/duplicate/delete/primary, validation, template selector, live previews). |
| `monetization/*` | (Phase 17) Universal monetization suite — see §7. |
| `analytics/*` | (Phase 18) Analytics, reporting & site health — see §7. |
| `site/*` | (Phase 16) Homepage / Navigation / Footer managers + `ContentPicker`. |

> **Note (Phase 19):** the old standalone `AdminMonetization.tsx` was **removed** as dead code
> (it duplicated shared primitives). The live monetization UI is `monetization/Monetization.tsx`.

### Admin pages (`src/components/admin/pages/`)
| File | Purpose |
|---|---|
| `Dashboard.tsx` | Stat cards + recently-updated + quick actions + team + recent activity. Placeholder-labeled. |
| `ContentTable.tsx` | **Universal content table** — powers All Content + every filtered view via `lockType` / `lockStatus` props. Search, filters, sort, pagination, bulk selection + `ConfirmBar` actions. |
| `ContentEditor.tsx` | **Universal editor** (new + edit). Title→slug, reorderable block editor, Desktop/Tablet/Mobile preview, right-panel `Tabs`: Content / Taxonomy / SEO / Pinterest / Social / Publishing. SEO tab embeds `SeoPanel` + `InternalLinkAssistant`. Non-destructive draft/review workflow. |
| `Taxonomy.tsx` | **Universal taxonomy manager** — hierarchical or flat for every `TaxonomyKind`, not hard-coded to one occasion. |
| `Media.tsx` | Media library (grid/list, detail panel, usage info, Pinterest-ready flag). |
| `Authors.tsx` | Author cards, link to public `/author/:slug`. |
| `System.tsx` | `ActivityLog`, `SiteHealth`, `ImportExport`, `Settings`, `Roles`, `Placeholder`. |
| `Seo.tsx` | **Phase 12 SEO pages** (see below). |

---

## 5. SEO Control Center — Phase 12

### SEO data (`src/lib/admin/seo.ts`)
Validation helpers (`validateLength`, `TITLE_RANGE`, `META_RANGE`, `validationMeta`);
dashboard cards; health categories; `seoAuditRows` (derived from content + taxonomy + authors);
`redirects`; `notFoundHits`; `orphanPages`; `sitemapCategories` + eligibility + validation;
`defaultRobotsTxt`; `searchEngines` + `connectionMeta`; `indexNowEvents`; `schemaTypesStatus`;
`imageSeoChecks`; `seoSettingsSections`; `seoChangeLog`. All clearly labeled placeholders.

### SEO components (`src/components/admin/seo/`)
| File | Purpose |
|---|---|
| `SeoPreviews.tsx` | `GooglePreview` (SERP snippet) + `ValidationMeter` (char-count states). |
| `SeoPanel.tsx` | **Universal SEO editor panel** — title/meta + validation, canonical (auto/custom + warnings), robots (index/follow + noarchive/nosnippet/noimageindex + summary), sitemap inclusion, primary URL, breadcrumb title, live Google/Social/Pinterest previews. Reusable by any content type / taxonomy / author page. |
| `InternalLinkAssistant.tsx` | Relevance-scored internal-link suggestions from shared taxonomy. |

### SEO routes (all under `/admin/seo/*`, routed in `AdminLayout`)
`SeoDashboard` (`/admin/seo`), `SeoAudit` (`/audit`), `RedirectManager` (`/redirects`),
`NotFoundManager` (`/404`), `OrphanPagesView` (`/orphans`), `SitemapManager` (`/sitemap`),
`RobotsManager` (`/robots`), `IndexingManager` (`/indexing`, incl. IndexNow),
`SchemaCenter` (`/schema`, Article + Recipe previews), `ImageSeo` (`/images`),
`SeoSettings` (`/settings`), `SeoChangeLog` (`/history`) — all in `pages/Seo.tsx`.

---

## 6. Admin route map (internal router in `AdminLayout.renderPage`)

```
/admin                              Dashboard
/admin/content                      ContentTable (all)
/admin/content/new/:type            ContentEditor (new: article|recipe|diy|listicle|guide|product-guide)
/admin/content/:id                  ContentEditor (edit existing item)
/admin/articles|recipes|diy|guides|listicles|product-guides   ContentTable (locked type)
/admin/drafts|scheduled|published|trash                       ContentTable (locked status)
/admin/content/collections          Collections (Phase 16)
/admin/taxonomy/:kind               Taxonomy  (categories|subcategories|occasions|seasons|tags|styles|colors|audiences)
/admin/media[/pinterest|/galleries|/unused|/settings]  Media
/admin/authors | /admin/contributors Authors
/admin/monetization                 Monetization (dashboard)                          # Phase 17
/admin/monetization/ads|products|links|sponsored|rules|revenue|settings              # Phase 17
/admin/pinterest                    AdminPinterest
/admin/analytics                    Analytics (overview)                              # Phase 18
/admin/analytics/content[/:id]|categories|authors|search|pinterest|social|advertising|
   affiliate|sponsored|newsletter|devices|geography|reports|alerts                    # Phase 18
/admin/seo                          SeoDashboard
/admin/seo/audit|redirects|404|orphans|sitemap|robots|indexing|schema|images|settings|history
/admin/site/homepage|navigation|footer  Homepage/Navigation/Footer managers          # Phase 16
/admin/newsletter | /admin/settings Placeholder / Settings
/admin/site-health                  SiteHealthCenter (overview)                       # Phase 18
/admin/site-health/links|404|redirects|sitemap|indexing|images|performance           # Phase 18
/admin/system/activity              SystemActivity                                    # Phase 18
/admin/system/status                SystemStatus                                      # Phase 18
/admin/activity                     ActivityLog (legacy alias)
/admin/import-export                ImportExport
/admin/roles                        Roles
```

---

## 7. Phase history

- **P8** Monetization / ad system (`ads.ts`, `AdSlot`, `AdminMonetization`).
- **P9** Universal Pinterest & sharing (`src/components/pinterest/*`, `pinterest.ts`, previews).
- **P10** Responsive / mobile UX audit (global CSS safety net, Footer, drawers).
- **P11** Universal CMS admin (`lib/admin/cms.ts`, `admin/ui.tsx`, `AdminLayout`, all `pages/*`).
- **P12** Universal Technical SEO Control Center (`lib/admin/seo.ts`, `admin/seo/*`, `pages/Seo.tsx`).
- **P13** Media Library (`lib/admin/media.ts`, `admin/media/*` — MediaLibrary, MediaUpload, MediaDetailPanel, MediaSubpages, MediaPicker). Placeholder uploads/processing, clearly labeled.
- **P14** Universal block-based Content Editor (`lib/admin/editor.ts`, `admin/editor/*` — AddBlockMenu, BlockBody, BlockList, EditorExtras, RichTextToolbar, SettingsRail; `pages/ContentEditor.tsx`). 24 block types, autosave/checklist/revisions/preview/TOC.
- **P15** Specialized Recipe + DIY editors that EXTEND P14 (`lib/admin/specialized.ts`, `admin/editor/specialized/*` — RecipeSections, DiySections, Shared, SpecPreview). `recipeData`/`diyData` optional fields on `EditorContent`; routes `/admin/content/new|:id/edit/recipe|diy`; details/blocks tab; content-type conversion; schema.org/Recipe + /HowTo previews. Placeholder persistence/PDF/nutrition/calc, clearly labeled.

- **P16** Site builders + Collections (`admin/site/*` — HomepageManager, NavigationManager, FooterManager, ContentPicker; `pages/Collections.tsx`). Config-driven homepage sections, nav/footer editing, curated collections. Placeholder persistence, clearly labeled.
- **P17** Universal Monetization & Affiliate (`lib/admin/monetization.ts`, `admin/monetization/*` — Monetization, MonetizationOverrides, shared). Ad networks, affiliate products/links, product collections, sponsored campaigns, placements, rules engine, disclosure settings; connects to `ads.ts`. Content-editor override panel (defaults "Inherit global"). No provider claimed connected; revenue shown as honest "—".
- **P18** Universal Analytics, Site Health & Reporting (`lib/admin/analytics.ts`, `admin/analytics/*` — Analytics, SiteHealthCenter, shared). `AnalyticsMetric`/`Report`/`HealthCheck`/`Alert` models; deterministic seeded example data; traffic/content/category/author/search/pinterest/social/ad/affiliate/sponsored/newsletter/device/geo reports; report builder + alerts; site health (links/404/redirects/sitemap/indexing/images/CWV); system activity + status. Accessible SVG charts with tabular alternatives; status = label+dot (never color alone); all data labeled example; no fake connectivity/scores.
- **P19** Final UX/UI, accessibility & consistency audit. Consolidated Pinterest brand color into `--pinterest`/`--pinterest-hover` tokens (was hardcoded in 10 files); added `aria-label`/focus states to public inputs (Newsletter, header search, recipe signup); added `role="dialog"`/`aria-modal` to the mobile search-filters sheet; aligned "Recipes & Food" terminology; removed dead `AdminMonetization.tsx`. No redesign, no functionality removed.

**Status: Phases 1–20 all built; `tsc --noEmit` + `vite build` pass (bundle ~882 kB / gzip ~214 kB).**
Phase 20 = final production audit, architecture review & backend handoff — see
[`PHASE_20_FINAL_AUDIT.md`](PHASE_20_FINAL_AUDIT.md).

## 8. Phase 20 — NOT YET BUILT (start here on the new account)

Phase 20 is the **only remaining phase**. It has not been started. Recommended scope
(pick/confirm with the product owner before building — keep it universal & token-based):

**Primary candidate — Performance & code-splitting pass:**
- Route-level `React.lazy` + dynamic `import()` to split the `/admin` chrome from the public
  bundle (currently one ~882 kB chunk; build warns >500 kB). Add `Suspense` fallbacks using the
  existing loading/skeleton patterns. Target: public site loads without the full CMS.
- Audit large data seeds in `src/lib/admin/*` for lazy loading.

**Secondary candidates (confirm which the owner wants in P20):**
- Real backend wiring (persistence / auth / analytics) to replace all clearly-labeled
  placeholder data — the single biggest remaining gap across every admin phase.
- Contributors as a distinct role view (currently `/admin/contributors` shares `Authors`).
- Flesh out remaining `Placeholder` routes: `/admin/newsletter` builder.
- Content Duplication behavior (regenerate slug, status→Draft, new canonical) — currently a
  bulk-action stub in `ContentTable`.
- Optional consolidation carried over from the P19 audit (low risk, low priority): extract the
  compact "Sunday Edit" sidebar newsletter (repeated in ArticlePage/RecipePage/DIYPage/AuthorPage)
  into one shared component; have `Homepage` render the shared `<Newsletter />` block.

**Before starting P20:** run `pnpm install`, then `pnpm dev`, confirm `pnpm tsc --noEmit` and
`pnpm build` are green on the fresh account, then build the confirmed scope.

## 9. Guardrails (do not violate)
- Preserve the public site, routes, SEO, ads, Pinterest, responsive behavior, content models.
- Don't create a parallel app root or make existing routes unreachable.
- Reuse existing design-system components + tokens before building bespoke UI.
- Keep everything universal/config-driven; add via data, not new one-off screens.
- Label all illustrative data as placeholder; never present fake analytics/ratings/indexing.
- Run `pnpm tsc --noEmit` + `pnpm build` after each phase.
```
```
