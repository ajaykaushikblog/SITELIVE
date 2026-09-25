import { useMemo, useState } from 'react'
import { Button } from '../../ui/primitives'
import {
  AdminPageHeader,
  Panel,
  StatCard,
  Badge,
  Field,
  Textarea,
  Select,
  PillButton,
  ConceptNote,
  ConfirmBar,
  EmptyState,
} from '../ui'
import {
  seoDashboardCards,
  seoHealthCategories,
  healthLevelMeta,
  seoAuditRows,
  auditHealthMeta,
  redirects,
  redirectWarningMeta,
  notFoundHits,
  orphanPages,
  sitemapCategories,
  sitemapEligibility,
  sitemapValidation,
  defaultRobotsTxt,
  searchEngines,
  connectionMeta,
  indexNowEvents,
  schemaTypesStatus,
  schemaStatusMeta,
  imageSeoChecks,
  seoSettingsSections,
  seoChangeLog,
  type AuditHealth,
} from '../../../lib/admin/seo'

const levelBadge = (level: AuditHealth) => auditHealthMeta[level]

const PlaceholderBanner = () => (
  <div className="mb-4">
    <ConceptNote>
      All values are illustrative placeholders for the interface. Live crawling, indexing status,
      sitemap generation and search-engine APIs connect during the production/backend phase.
    </ConceptNote>
  </div>
)

/* ============================ 1–2. Dashboard + health ============================ */
export function SeoDashboard() {
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'SEO', 'Dashboard']}
        title="SEO Control Center"
        description="Centralized technical SEO for the entire website."
        actions={
          <a href="/admin/seo/audit">
            <Button size="md">Open audit</Button>
          </a>
        }
      />
      <PlaceholderBanner />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {seoDashboardCards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} tone={c.tone === 'warn' ? 'default' : 'default'} />
        ))}
      </section>

      <h2 className="mb-3 mt-10 font-serif text-[1.4rem] font-semibold text-foreground">Health overview</h2>
      <p className="mb-4 text-[0.85rem] text-muted-foreground">
        Status by category. This is a technical health summary — not a search-engine ranking score, and
        it does not claim the site is indexed or ranking.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {seoHealthCategories.map((cat) => (
          <div key={cat.label} className="rounded-lg border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[0.9rem] font-semibold text-foreground">{cat.label}</p>
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${healthLevelMeta[cat.level].tone.split(' ')[0]}`} />
            </div>
            <Badge label={healthLevelMeta[cat.level].label} tone={healthLevelMeta[cat.level].tone} />
            <p className="mt-2 text-[0.76rem] text-muted-foreground">{cat.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Audit table', href: '/admin/seo/audit' },
          { label: 'Redirects', href: '/admin/seo/redirects' },
          { label: '404 monitor', href: '/admin/seo/404' },
          { label: 'Orphan pages', href: '/admin/seo/orphans' },
          { label: 'XML sitemaps', href: '/admin/seo/sitemap' },
          { label: 'robots.txt', href: '/admin/seo/robots' },
          { label: 'Indexing & IndexNow', href: '/admin/seo/indexing' },
          { label: 'Structured data', href: '/admin/seo/schema' },
          { label: 'Image SEO', href: '/admin/seo/images' },
          { label: 'SEO settings', href: '/admin/seo/settings' },
          { label: 'Change log', href: '/admin/seo/history' },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="rounded-lg border border-border bg-card px-4 py-3 text-[0.85rem] font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-secondary"
          >
            {l.label} →
          </a>
        ))}
      </div>
    </div>
  )
}

/* ============================ SEO audit table ============================ */
export function SeoAudit() {
  const [health, setHealth] = useState<'all' | AuditHealth>('all')
  const [type, setType] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const PAGE = 12

  const types = useMemo(() => ['all', ...Array.from(new Set(seoAuditRows.map((r) => r.contentType)))], [])
  const rows = useMemo(
    () =>
      seoAuditRows.filter(
        (r) =>
          (health === 'all' || r.health === health) &&
          (type === 'all' || r.contentType === type) &&
          (!search || r.url.toLowerCase().includes(search.toLowerCase()) || r.title.toLowerCase().includes(search.toLowerCase())),
      ),
    [health, type, search],
  )
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE))
  const cur = Math.min(page, pageCount)
  const shown = rows.slice((cur - 1) * PAGE, cur * PAGE)
  const yn = (v: boolean) => (v ? <span className="text-success">✓</span> : <span className="text-error">✕</span>)

  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'SEO', 'Audit']} title="SEO Audit" description={`${rows.length} pages`} />
      <PlaceholderBanner />

      <div className="mb-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search URL or title…"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40"
        />
        <Select
          value={health}
          onChange={(v) => {
            setHealth(v as typeof health)
            setPage(1)
          }}
          options={[
            { value: 'all', label: 'All health' },
            { value: 'error', label: 'Errors' },
            { value: 'warning', label: 'Warnings' },
            { value: 'healthy', label: 'Healthy' },
          ]}
        />
        <Select value={type} onChange={(v) => setType(v)} options={types.map((t) => ({ value: t, label: t === 'all' ? 'All types' : t }))} />
        <Select value="url" onChange={() => {}} options={[{ value: 'url', label: 'Sort: URL' }]} />
      </div>

      {shown.length === 0 ? (
        <EmptyState title="No pages match" hint="Adjust the filters above." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[980px] text-left text-[0.82rem]">
            <thead className="bg-secondary/60 text-[0.66rem] uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-3"></th>
                <th className="px-3 py-3 font-semibold">URL</th>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">Index</th>
                <th className="px-3 py-3 font-semibold">Canonical</th>
                <th className="px-3 py-3 font-semibold">Sitemap</th>
                <th className="px-3 py-3 font-semibold">Title</th>
                <th className="px-3 py-3 font-semibold">Meta</th>
                <th className="px-3 py-3 font-semibold">Schema</th>
                <th className="px-3 py-3 font-semibold">Alt</th>
                <th className="px-3 py-3 font-semibold">Links</th>
                <th className="px-3 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className={`border-t border-border ${selected.has(r.id) ? 'bg-seasonal-soft/40' : 'bg-card'}`}>
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() =>
                        setSelected((s) => {
                          const n = new Set(s)
                          n.has(r.id) ? n.delete(r.id) : n.add(r.id)
                          return n
                        })
                      }
                    />
                  </td>
                  <td className="max-w-[240px] px-3 py-2.5">
                    <span className="block truncate font-mono text-[0.74rem] text-foreground">{r.url}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.contentType}</td>
                  <td className="px-3 py-2.5">
                    <Badge label={r.index} tone={r.index === 'index' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'} />
                  </td>
                  <td className="px-3 py-2.5 capitalize text-muted-foreground">{r.canonical}</td>
                  <td className="px-3 py-2.5">{yn(r.inSitemap)}</td>
                  <td className="px-3 py-2.5">{yn(r.hasTitle)}</td>
                  <td className="px-3 py-2.5">{yn(r.hasMeta)}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.schema}</td>
                  <td className="px-3 py-2.5">{yn(r.altOk)}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.internalLinks}</td>
                  <td className="px-3 py-2.5">
                    <Badge label={levelBadge(r.health).label} tone={levelBadge(r.health).tone} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-[0.82rem]">
          <span className="text-muted-foreground">
            Page {cur} of {pageCount}
          </span>
          <div className="flex gap-2">
            <PillButton onClick={() => setPage(Math.max(1, cur - 1))}>Previous</PillButton>
            <PillButton onClick={() => setPage(Math.min(pageCount, cur + 1))}>Next</PillButton>
          </div>
        </div>
      )}

      <ConfirmBar count={selected.size} onClear={() => setSelected(new Set())}>
        <PillButton tone="invert">Set index/noindex</PillButton>
        <PillButton tone="invert">Update sitemap</PillButton>
        <PillButton tone="invert">Regenerate metadata</PillButton>
        <PillButton tone="invert">Change canonical</PillButton>
      </ConfirmBar>
    </div>
  )
}

/* ============================ Redirect manager ============================ */
export function RedirectManager() {
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'SEO', 'Redirects']}
        title="Redirect Manager"
        description="Manage 301 and 302 redirects."
        actions={<Button size="md">+ Add redirect</Button>}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-[0.83rem]">
            <thead className="bg-secondary/60 text-[0.66rem] uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Destination</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((r) => (
                <tr key={r.id} className="border-t border-border bg-card">
                  <td className="px-4 py-3 font-mono text-[0.74rem] text-foreground">{r.source}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[0.74rem] text-muted-foreground">{r.destination}</span>
                    {r.warning && (
                      <span className="mt-1 block text-[0.68rem] font-semibold text-warning">⚠ {redirectWarningMeta[r.warning]}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={r.type} tone="bg-secondary text-secondary-foreground" />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={r.status}
                      tone={r.status === 'active' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Panel title="Add redirect">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">
            <Field label="Source URL" mono placeholder="/old-url" />
            <Field label="Destination URL" mono placeholder="/new-url" />
            <Select label="Redirect type" value="301" options={[{ value: '301', label: '301 — Permanent' }, { value: '302', label: '302 — Temporary' }]} />
            <Textarea label="Notes" rows={2} placeholder="Why this redirect exists…" />
            <Select label="Status" value="active" options={['active', 'disabled']} />
            <Button size="md" type="submit">
              Create redirect
            </Button>
            <p className="text-[0.72rem] text-muted-foreground">
              Chains and loops are detected and flagged; redirects are never chained automatically.
            </p>
          </form>
        </Panel>
      </div>
    </div>
  )
}

/* ============================ 404 monitor ============================ */
export function NotFoundManager() {
  const statusTone: Record<string, string> = {
    new: 'bg-warning/15 text-warning',
    ignored: 'bg-muted text-muted-foreground',
    resolved: 'bg-success/15 text-success',
  }
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'SEO', '404 Errors']} title="404 Monitor" description="Requested URLs that returned not-found." />
      <PlaceholderBanner />
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[760px] text-left text-[0.83rem]">
          <thead className="bg-secondary/60 text-[0.66rem] uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Requested URL</th>
              <th className="px-4 py-3 font-semibold">First</th>
              <th className="px-4 py-3 font-semibold">Last</th>
              <th className="px-4 py-3 font-semibold">Hits</th>
              <th className="px-4 py-3 font-semibold">Suggested</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notFoundHits.map((n) => (
              <tr key={n.id} className="border-t border-border bg-card">
                <td className="px-4 py-3 font-mono text-[0.74rem] text-foreground">{n.url}</td>
                <td className="px-4 py-3 text-muted-foreground">{n.first}</td>
                <td className="px-4 py-3 text-muted-foreground">{n.last}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{n.hits}</td>
                <td className="px-4 py-3 font-mono text-[0.72rem] text-muted-foreground">{n.suggestion ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge label={n.status} tone={statusTone[n.status]} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <PillButton>Create 301</PillButton>
                    <PillButton>Ignore</PillButton>
                    <PillButton>Resolve</PillButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ============================ Orphan pages ============================ */
export function OrphanPagesView() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'SEO', 'Orphan Pages']} title="Orphan Page Monitor" description="Published pages with few or no internal links." />
      <PlaceholderBanner />
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[760px] text-left text-[0.83rem]">
          <thead className="bg-secondary/60 text-[0.66rem] uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Page</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 font-semibold">Internal links</th>
              <th className="px-4 py-3 font-semibold">Suggested related</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orphanPages.map((o) => (
              <tr key={o.id} className="border-t border-border bg-card">
                <td className="max-w-[280px] px-4 py-3">
                  <p className="truncate font-medium text-foreground">{o.title}</p>
                  <span className="font-mono text-[0.7rem] text-muted-foreground">{o.url}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{o.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.published}</td>
                <td className="px-4 py-3">
                  <Badge
                    label={String(o.internalLinks)}
                    tone={o.internalLinks === 0 ? 'bg-error/12 text-error' : 'bg-warning/15 text-warning'}
                  />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{o.suggestion}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <a href={o.url}>
                      <PillButton>View</PillButton>
                    </a>
                    <PillButton>Add link</PillButton>
                    <PillButton>Ignore</PillButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ============================ Sitemap system ============================ */
export function SitemapManager() {
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'SEO', 'Sitemap']}
        title="XML Sitemaps"
        description="Sitemap index and per-type sitemaps."
        actions={<Button size="md">Regenerate sitemap</Button>}
      />
      <PlaceholderBanner />

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Status" value="Valid" />
        <StatCard label="Last generated" value="2h ago" />
        <StatCard label="URLs included" value="3,588" />
        <StatCard label="Errors" value="1" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[560px] text-left text-[0.83rem]">
            <thead className="bg-secondary/60 text-[0.66rem] uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Sitemap</th>
                <th className="px-4 py-3 font-semibold">URLs</th>
                <th className="px-4 py-3 font-semibold">Excluded</th>
                <th className="px-4 py-3 font-semibold">Errors</th>
                <th className="px-4 py-3 font-semibold">Generated</th>
              </tr>
            </thead>
            <tbody>
              {sitemapCategories.map((s) => (
                <tr key={s.id} className="border-t border-border bg-card">
                  <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.urls.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.excluded}</td>
                  <td className="px-4 py-3">
                    <Badge label={String(s.errors)} tone={s.errors ? 'bg-error/12 text-error' : 'bg-success/15 text-success'} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.lastGenerated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <Panel title="Eligibility rules">
            <p className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-success">Included</p>
            <ul className="mb-3 flex flex-wrap gap-1.5">
              {sitemapEligibility.included.map((i) => (
                <li key={i} className="rounded-full bg-success/12 px-2 py-0.5 text-[0.7rem] text-success">
                  {i}
                </li>
              ))}
            </ul>
            <p className="mb-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-error">Excluded</p>
            <ul className="flex flex-wrap gap-1.5">
              {sitemapEligibility.excluded.map((i) => (
                <li key={i} className="rounded-full bg-error/10 px-2 py-0.5 text-[0.7rem] text-error">
                  {i}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Validation">
            <ul className="space-y-2">
              {sitemapValidation.map((v) => (
                <li key={v.label} className="flex items-center justify-between text-[0.82rem]">
                  <span className="text-foreground">{v.label}</span>
                  <Badge label={`${v.count} · ${auditHealthMeta[v.level].label}`} tone={auditHealthMeta[v.level].tone} />
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}

/* ============================ robots.txt ============================ */
export function RobotsManager() {
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'SEO', 'Robots.txt']}
        title="robots.txt Manager"
        description="Crawl directives for the site."
        actions={<Button size="md">Save robots.txt</Button>}
      />
      <div className="mb-4">
        <ConceptNote>
          This is a future production configuration draft. It is not served live yet, and it avoids blocking
          CSS, JavaScript or public assets.
        </ConceptNote>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Editor">
          <textarea
            defaultValue={defaultRobotsTxt}
            rows={20}
            className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-[0.76rem] leading-relaxed text-foreground outline-none focus:border-foreground/40"
          />
        </Panel>
        <div className="space-y-4">
          <Panel title="Preview">
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-secondary/40 p-3 font-mono text-[0.74rem] leading-relaxed text-muted-foreground">
              {defaultRobotsTxt}
            </pre>
          </Panel>
          <Panel title="Validation">
            <ul className="space-y-2 text-[0.82rem]">
              <li className="flex items-center justify-between">
                <span className="text-foreground">Syntax</span>
                <Badge label="Valid" tone="bg-success/15 text-success" />
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Sitemap declared</span>
                <Badge label="Yes" tone="bg-success/15 text-success" />
              </li>
              <li className="flex items-center justify-between">
                <span className="text-foreground">Blocks public assets</span>
                <Badge label="No" tone="bg-success/15 text-success" />
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}

/* ============================ Indexing + IndexNow ============================ */
export function IndexingManager() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'SEO', 'Indexing']} title="Indexing & Search Engines" description="Connect webmaster tools and configure IndexNow." />
      <div className="mb-4">
        <ConceptNote>No search-engine accounts are connected. Statuses below reflect the real (unconfigured) state — none are faked.</ConceptNote>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {searchEngines.map((e) => (
          <Panel key={e.id} title={e.name}>
            <p className="mb-3 text-[0.82rem] text-muted-foreground">{e.tool}</p>
            <Badge label={connectionMeta[e.state].label} tone={connectionMeta[e.state].tone} />
            <div className="mt-4 space-y-2.5">
              <Field label="Verification code" mono placeholder="Paste verification meta / token" />
              <Button size="md" variant="outline">
                Connect
              </Button>
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <Panel title="IndexNow">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">
            <label className="flex items-center gap-2 text-[0.85rem] text-foreground">
              <input type="checkbox" /> Enable IndexNow
            </label>
            <Field label="API key" mono placeholder="32+ character key" />
            <Field label="Verification file" mono placeholder="/{key}.txt" />
            <div className="grid grid-cols-2 gap-2 text-[0.78rem] text-muted-foreground">
              <span>Submission status</span>
              <span className="text-right">
                <Badge label="Not configured" tone="bg-muted text-muted-foreground" />
              </span>
            </div>
            <Field label="Last submission" value="" placeholder="—" />
            <Field label="Last error" value="" placeholder="—" />
            <p className="text-[0.72rem] text-muted-foreground">
              IndexNow can notify participating engines about URL changes, but does not guarantee instant
              crawling or indexing — and does not guarantee Google indexing.
            </p>
          </form>
        </Panel>
        <Panel title="Event log">
          <ul className="divide-y divide-border">
            {indexNowEvents.map((ev) => (
              <li key={ev.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <Badge
                  label={ev.event}
                  tone={
                    ev.event === 'Published'
                      ? 'bg-success/15 text-success'
                      : ev.event === 'Updated'
                        ? 'bg-primary/12 text-primary'
                        : 'bg-error/12 text-error'
                  }
                />
                <span className="min-w-0 flex-1 truncate font-mono text-[0.74rem] text-foreground">{ev.url}</span>
                <span className="shrink-0 text-[0.74rem] text-muted-foreground">{ev.when}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

/* ============================ Structured data ============================ */
export function SchemaCenter() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'SEO', 'Structured Data']} title="Structured Data Control Center" description="Schema types across the site." />
      <PlaceholderBanner />

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[560px] text-left text-[0.83rem]">
          <thead className="bg-secondary/60 text-[0.66rem] uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Schema type</th>
              <th className="px-4 py-3 font-semibold">Applies to</th>
              <th className="px-4 py-3 font-semibold">Pages</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {schemaTypesStatus.map((s) => (
              <tr key={s.type} className="border-t border-border bg-card">
                <td className="px-4 py-3 font-mono text-[0.78rem] font-semibold text-foreground">{s.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.scope}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.count.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge label={schemaStatusMeta[s.status].label} tone={schemaStatusMeta[s.status].tone} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Article schema preview">
          <SchemaPreview
            fields={[
              ['@type', 'Article'],
              ['headline', '25 Elegant Christmas Nail Ideas for the Holidays'],
              ['description', 'Festive, elegant manicure inspiration for the season.'],
              ['image', '/images/christmas-nails-hero.jpg'],
              ['author', 'Jordan Blake (Person)'],
              ['datePublished', '2025-12-02'],
              ['dateModified', '2025-12-04'],
              ['publisher', 'Marigold & Maple (Organization)'],
              ['mainEntityOfPage', '/article/christmas-nail-ideas'],
            ]}
          />
        </Panel>
        <Panel title="Recipe schema preview">
          <SchemaPreview
            note="Uses the existing recipe structured-data architecture. Ratings only appear when genuine rating data exists."
            fields={[
              ['@type', 'Recipe'],
              ['name', 'Easy Creamy Garlic Pasta'],
              ['image', '/images/garlic-pasta.jpg'],
              ['author', 'Maya Reyes (Person)'],
              ['description', 'A fast, comforting weeknight pasta.'],
              ['prepTime', 'PT10M'],
              ['cookTime', 'PT15M'],
              ['totalTime', 'PT25M'],
              ['recipeYield', '4 servings'],
              ['recipeIngredient', '8 items'],
              ['recipeInstructions', '6 steps'],
              ['nutrition', 'NutritionInformation'],
              ['aggregateRating', '— (no rating data yet)'],
            ]}
          />
        </Panel>
      </div>
    </div>
  )
}

function SchemaPreview({ fields, note }: { fields: [string, string][]; note?: string }) {
  return (
    <div>
      {note && <p className="mb-3 text-[0.76rem] text-muted-foreground">{note}</p>}
      <dl className="overflow-hidden rounded-lg border border-border font-mono text-[0.76rem]">
        {fields.map(([k, v], i) => (
          <div key={k} className={`flex gap-3 px-3 py-2 ${i % 2 ? 'bg-secondary/30' : 'bg-card'}`}>
            <dt className="w-40 shrink-0 text-muted-foreground">{k}</dt>
            <dd className="min-w-0 flex-1 break-words text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ============================ Image SEO ============================ */
export function ImageSeo() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'SEO', 'Images']} title="Image SEO" description="Alt text, dimensions and format health." />
      <PlaceholderBanner />

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {imageSeoChecks.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="font-serif text-[1.6rem] font-semibold text-foreground">{c.count}</span>
              <Badge label={auditHealthMeta[c.level].label} tone={auditHealthMeta[c.level].tone} />
            </div>
            <p className="mt-1 text-[0.8rem] text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </section>

      <Panel title="Image metadata fields">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Filename" mono placeholder="descriptive-file-name.webp" />
          <Field label="Alt text" placeholder="Describe the image for accessibility & SEO" />
          <Field label="Title" placeholder="Image title" />
          <Field label="Caption" placeholder="Optional caption" />
          <Field label="Width" type="number" placeholder="1600" />
          <Field label="Height" type="number" placeholder="1067" />
        </div>
        <Textarea label="Description" rows={2} placeholder="Longer description used for image sitemaps." />
        <p className="mt-3 text-[0.72rem] text-muted-foreground">
          Future WebP/AVIF generation and responsive sizes are configured during backend implementation.
        </p>
      </Panel>
    </div>
  )
}

/* ============================ SEO settings ============================ */
export function SeoSettings() {
  const [section, setSection] = useState(seoSettingsSections[0])
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'SEO', 'Settings']} title="SEO Settings" description="Global, reusable SEO configuration." actions={<Button size="md">Save settings</Button>} />
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex flex-row flex-wrap gap-1.5 lg:flex-col">
          {seoSettingsSections.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSection(s)}
              className={`rounded-md px-3 py-2 text-left text-[0.83rem] font-medium transition-colors ${
                section === s ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </nav>
        <Panel title={section}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {section === 'Global SEO' && (
              <>
                <Field label="Title separator" value=" | " />
                <Field label="Title suffix" value="Marigold & Maple" />
                <Textarea label="Default meta description" rows={3} value="Seasonal recipes, decor, DIY and celebration ideas." />
              </>
            )}
            {section === 'Indexing' && (
              <>
                <Select label="Default robots" value="index, follow" options={['index, follow', 'noindex, follow', 'noindex, nofollow']} />
                <label className="flex items-center gap-2 text-[0.85rem] text-foreground">
                  <input type="checkbox" defaultChecked /> Allow indexing of the entire site
                </label>
              </>
            )}
            {section === 'Internal Search' && (
              <>
                <label className="flex items-center gap-2 text-[0.85rem] text-foreground">
                  <input type="checkbox" /> Index internal search pages
                </label>
                <ConceptNote>
                  Default: OFF. Arbitrary internal search and filter URLs should generally be
                  <span className="font-mono"> noindex, follow</span> so thin, near-duplicate pages don't get indexed.
                </ConceptNote>
                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Filter / facet rules
                  </p>
                  {['?category=', '?occasion=', '?tag=', '?style=', '?color='].map((f) => (
                    <div key={f} className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-mono text-[0.78rem] text-foreground">{f}</span>
                      <Select value="noindex" options={[{ value: 'noindex', label: 'Noindex (default)' }, { value: 'curated', label: 'Curated landing (index)' }]} />
                    </div>
                  ))}
                  <p className="text-[0.72rem] text-muted-foreground">
                    Curated landing pages can be indexable; arbitrary combinations stay noindex to avoid thin URLs.
                  </p>
                </div>
              </>
            )}
            {section === 'Robots' && (
              <p className="text-[0.85rem] text-muted-foreground">
                Manage crawl directives in the <a href="/admin/seo/robots" className="font-semibold text-primary hover:underline">robots.txt editor</a>.
              </p>
            )}
            {section === 'Sitemaps' && (
              <p className="text-[0.85rem] text-muted-foreground">
                Configure per-type sitemaps in the <a href="/admin/seo/sitemap" className="font-semibold text-primary hover:underline">sitemap manager</a>.
              </p>
            )}
            {section === 'Canonical' && (
              <>
                <Select label="Default canonical strategy" value="self" options={[{ value: 'self', label: 'Self-referencing' }, { value: 'custom', label: 'Custom per page' }]} />
                <label className="flex items-center gap-2 text-[0.85rem] text-foreground">
                  <input type="checkbox" defaultChecked /> Warn on duplicate canonicals
                </label>
              </>
            )}
            {section === 'Structured Data' && (
              <p className="text-[0.85rem] text-muted-foreground">
                Review schema coverage in the <a href="/admin/seo/schema" className="font-semibold text-primary hover:underline">structured data center</a>.
              </p>
            )}
            {section === 'Open Graph' && (
              <>
                <Field label="Default OG image" placeholder="https://… (1.91:1)" />
                <Field label="Default X/Twitter handle" placeholder="@marigoldmaple" />
              </>
            )}
            {section === 'Pinterest' && (
              <>
                <label className="flex items-center gap-2 text-[0.85rem] text-foreground">
                  <input type="checkbox" defaultChecked /> Enable rich pins metadata
                </label>
                <Field label="Default Pinterest image" placeholder="https://… (2:3)" />
              </>
            )}
            {section === 'IndexNow' && (
              <p className="text-[0.85rem] text-muted-foreground">
                Configure IndexNow in the <a href="/admin/seo/indexing" className="font-semibold text-primary hover:underline">indexing section</a>.
              </p>
            )}
            {section === 'Redirects' && (
              <p className="text-[0.85rem] text-muted-foreground">
                Manage redirects in the <a href="/admin/seo/redirects" className="font-semibold text-primary hover:underline">redirect manager</a>.
              </p>
            )}
            {section === 'Images' && (
              <p className="text-[0.85rem] text-muted-foreground">
                Review image health in the <a href="/admin/seo/images" className="font-semibold text-primary hover:underline">image SEO dashboard</a>.
              </p>
            )}
            <div className="pt-1">
              <Button size="md" type="submit">
                Save changes
              </Button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  )
}

/* ============================ Change log ============================ */
export function SeoChangeLog() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'SEO', 'Change Log']} title="SEO Change Log" description="History of SEO-related changes." />
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[760px] text-left text-[0.83rem]">
          <thead className="bg-secondary/60 text-[0.66rem] uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Change</th>
              <th className="px-4 py-3 font-semibold">Page</th>
              <th className="px-4 py-3 font-semibold">From</th>
              <th className="px-4 py-3 font-semibold">To</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">When</th>
            </tr>
          </thead>
          <tbody>
            {seoChangeLog.map((c) => (
              <tr key={c.id} className="border-t border-border bg-card">
                <td className="px-4 py-3 font-medium text-foreground">{c.change}</td>
                <td className="px-4 py-3 font-mono text-[0.72rem] text-muted-foreground">{c.page}</td>
                <td className="max-w-[180px] truncate px-4 py-3 text-muted-foreground">{c.from}</td>
                <td className="max-w-[180px] truncate px-4 py-3 text-foreground">{c.to}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.user}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
