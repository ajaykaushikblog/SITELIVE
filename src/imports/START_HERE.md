# 🚀 START HERE — Marigold & Maple (Continue at Phase 20)

**Read this file first.** It is the onboarding brief for continuing this project on a
**new Figma Make account**. The full technical map lives in
[`src/imports/PROJECT_HANDOFF.md`](src/imports/PROJECT_HANDOFF.md) — read that next.

- **Repo:** https://github.com/ajaykaushikblog/goldmary
- **Project:** Pinterest-first **editorial lifestyle website + universal CMS admin**
- **Stack:** React 19 + Vite 8 + TypeScript 5.7 + Tailwind CSS v4 (no config file) + pnpm
- **Status:** **Phases 1–19 COMPLETE and verified** (`tsc --noEmit` + `vite build` both pass).
  **Only Phase 20 remains** — see §4 below.

---

## 1. First-time setup on the new account

```bash
pnpm install        # restores dependencies from package.json + pnpm-lock.yaml
pnpm dev            # starts the dev server (Figma Make runs this on $PORT / 8443)
pnpm tsc --noEmit   # must be CLEAN before you start building
pnpm build          # must SUCCEED (bundle ~882 kB / gzip ~214 kB — a size warning is expected)
```

If all four are green, the whole project (public site + full CMS) is working. Then begin Phase 20.

---

## 2. ⚠️ IMPORTANT — hidden files may be missing from GitHub

When files are uploaded to GitHub through the **browser drag-and-drop**, hidden files
(names starting with `.`) get **skipped**. The website source (`src/`) and all config
(`package.json`, `vite.config.ts`, etc.) are fully present, but these may be missing:

- **`.figma/make/`** — Figma Make's own run/deploy scripts (`dev`, `install`, `deploy`,
  `deploy-preview`, `format`, `analyze-routes`, `import-assets.mjs`, `langserver`,
  `dev.json`, `site.json`). **Without these, Figma Make may not auto-run/deploy the project.**
- `.gitignore`, `.gitattributes`, `.mise.toml`

**Fix:** push these hidden files via **git command line** (not the browser), or restore the
`.figma/make/` folder from the `.tgz` archive that came with this project. If the app still
runs with `pnpm dev`, the code is fine — this only affects Figma Make's built-in tooling.

---

## 3. What is already built (Phases 1–19)

**Public website** (`src/components/…`, data in `src/lib/…`)
- Homepage, Category, Occasion, Article, Recipe, DIY, Author, Search, Collection pages
- Shared design system: `ui/primitives.tsx` (Button, Badge, Container, SectionHeader…),
  `ui/ArticleCard.tsx`, `ui/Newsletter.tsx`, `ui/icons.tsx`
- Ads (`components/ads/*`), Pinterest & social (`components/pinterest/*`)
- Custom router `src/lib/router.tsx`; design tokens `src/styles/theme.css`

**CMS admin** (`/admin`, chrome in `src/components/admin/AdminLayout.tsx`)
- **P11** Universal CMS core — content table, taxonomy, dashboard (`admin/ui.tsx`, `lib/admin/cms.ts`)
- **P12** SEO Control Center (`admin/seo/*`, `pages/Seo.tsx`, `lib/admin/seo.ts`)
- **P13** Media Library (`admin/media/*`, `lib/admin/media.ts`)
- **P14** Universal block-based Content Editor (`admin/editor/*`, `lib/admin/editor.ts`)
- **P15** Recipe + DIY specialized editors (`admin/editor/specialized/*`, `lib/admin/specialized.ts`)
- **P16** Site builders + Collections (`admin/site/*`, `pages/Collections.tsx`)
- **P17** Universal Monetization & Affiliate (`admin/monetization/*`, `lib/admin/monetization.ts`)
- **P18** Analytics, Reporting & Site Health (`admin/analytics/*`, `lib/admin/analytics.ts`)
- **P19** Final UX/UI, accessibility & consistency audit (tokens, a11y, dead-code cleanup)

> Full file-by-file map + admin route table is in `src/imports/PROJECT_HANDOFF.md`.

---

## 4. 🎯 Phase 20 — THE REMAINING WORK (start here)

Phase 20 has **not been started**. Confirm the exact scope with the owner, then build it
following the guardrails in §5. Recommended scope:

**Primary — Performance & code-splitting**
- Route-level `React.lazy` + dynamic `import()` to split the `/admin` CMS chrome out of the
  public bundle (currently one ~882 kB chunk; build warns >500 kB). Add `Suspense` fallbacks
  using existing loading/skeleton patterns. Goal: public site loads without the full CMS code.
- Review large data seeds in `src/lib/admin/*` for lazy loading.

**Secondary (confirm which the owner wants included)**
- Real backend wiring — persistence / auth / analytics to replace clearly-labeled placeholder
  data (the biggest remaining gap across every admin phase).
- Contributors as a distinct role view (`/admin/contributors` currently shares `Authors`).
- Flesh out the `/admin/newsletter` builder (currently a placeholder route).
- Content Duplication behavior (regenerate slug, status→Draft, new canonical) — currently a
  bulk-action stub in `ContentTable`.
- Low-risk consolidation from the P19 audit: extract the compact "Sunday Edit" sidebar
  newsletter (repeated in Article/Recipe/DIY/Author pages) into one shared component, and have
  `Homepage` render the shared `<Newsletter />` block.

---

## 5. Guardrails (do NOT violate)

- **Preserve the entire existing project** — public site, all routes, SEO, ads, Pinterest,
  responsive behavior, content models, and every admin screen. Don't redesign anything.
- Don't create a parallel app root or make existing routes unreachable.
- **Reuse existing design-system components + tokens** before building anything bespoke.
  Colors via token classes only (`text-foreground`, `bg-card`, `text-primary`, `bg-pinterest`,
  `text-success/warning/error`, …) — **never raw hex**.
- Keep everything **universal / config-driven** — add via data, not new one-off screens.
- **Never fake data.** No real analytics/revenue/indexing/connection claims. Label all
  illustrative data as example/placeholder; show honest "—" for metrics needing a real backend.
- Don't add an unlayered universal `*` CSS reset (it breaks Tailwind's layered rules).
- After each phase, run `pnpm tsc --noEmit` **and** `pnpm build` — both must pass.

---

## 6. How to kick off Phase 20 with the new agent

Paste something like this into the new Figma Make account (after setup in §1):

> "This project is Marigold & Maple — a lifestyle website + universal CMS. Phases 1–19 are
> complete (see `START_HERE.md` and `src/imports/PROJECT_HANDOFF.md`). Do not redesign or
> break anything. Start **Phase 20**: [paste the confirmed Phase 20 scope from §4]. Follow the
> guardrails in `START_HERE.md` §5. Run `pnpm tsc --noEmit` and `pnpm build` when done."
