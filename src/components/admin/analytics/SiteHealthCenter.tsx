import { AdminPageHeader, Panel, Badge, StatCard, PillButton } from '../ui'
import { SubNav, siteHealthNav, ExampleBanner, HealthBadge } from './shared'
import {
  healthCategories,
  brokenLinks,
  linkStatusMeta,
  notFoundLog,
  redirectIssues,
  sitemaps,
  indexingBuckets,
  indexingWarnings,
  imageIssues,
  webVitals,
  systemServices,
  serviceStateMeta,
  activityLog,
} from '../../../lib/admin/analytics'

/* =========================================================================
   Phase 18 — Site Health Center.

   Descriptive technical monitoring: performance, SEO, indexing, links,
   images, security, availability, plus broken-link / 404 / redirect / sitemap
   / indexing / image health detail pages. Connects conceptually to the SEO
   Control Center (Phase 12) and Media Library (Phase 13). No arbitrary overall
   "website score"; statuses pair a label with colour for accessibility.
   ========================================================================= */

export function SiteHealthCenter({ section = '' }: { section?: string }) {
  return (
    <div>
      <SubNav items={siteHealthNav} active={section} />
      {section === '' && <OverviewPage />}
      {section === 'links' && <LinksPage />}
      {section === '404' && <NotFoundPage />}
      {section === 'redirects' && <RedirectsPage />}
      {section === 'sitemap' && <SitemapPage />}
      {section === 'indexing' && <IndexingPage />}
      {section === 'images' && <ImagesPage />}
      {section === 'performance' && <PerformancePage />}
    </div>
  )
}

function OverviewPage() {
  const counts = {
    healthy: healthCategories.filter((h) => h.status === 'healthy').length,
    warning: healthCategories.filter((h) => h.status === 'warning').length,
    attention: healthCategories.filter((h) => h.status === 'attention').length,
  }
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Site Health']} title="Site Health" description="Technical health across performance, SEO, indexing, links, images, security and availability. No single overall score — each area stands on its own." />
      <ExampleBanner>Some checks require connected services (crawler, CWV, uptime). Those show as Warning until connected.</ExampleBanner>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Healthy" value={counts.healthy} tone="muted" />
        <StatCard label="Warnings" value={counts.warning} tone="muted" />
        <StatCard label="Needs attention" value={counts.attention} tone="muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {healthCategories.map((h) => (
          <Panel key={h.id} title={h.category} actions={<HealthBadge status={h.status} />}>
            <p className="text-[0.82rem] text-muted-foreground">{h.message}</p>
            <p className="mt-3 text-[0.72rem] text-muted-foreground">Last checked: {h.lastChecked}</p>
          </Panel>
        ))}
      </div>
    </div>
  )
}

function LinksPage() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Site Health', 'Links']} title="Broken Links" description="Internal, external and affiliate links flagged for review. Connects to the SEO Redirect Manager (Phase 12)." />
      <ExampleBanner>Link checks are illustrative until a link crawler is connected.</ExampleBanner>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">URL</th>
                <th className="py-2 pr-4 font-semibold">Source page</th>
                <th className="py-2 pr-4 font-semibold">Type</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
                <th className="py-2 pr-4 font-semibold">First detected</th>
                <th className="py-2 pr-4 font-semibold">Last checked</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {brokenLinks.map((l, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-mono text-[0.72rem] text-foreground">{l.url}</td>
                  <td className="py-2.5 pr-4 font-mono text-[0.72rem] text-muted-foreground">{l.source}</td>
                  <td className="py-2.5 pr-4 capitalize text-muted-foreground">{l.type}</td>
                  <td className="py-2.5 pr-4"><Badge label={linkStatusMeta[l.status].label} tone={linkStatusMeta[l.status].tone} /></td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{l.firstDetected}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{l.lastChecked}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex gap-1.5">
                      <a href={l.source} className="rounded-md border border-border px-2 py-1 text-[0.72rem] font-semibold text-foreground hover:bg-secondary">Open</a>
                      <PillButton>Edit source</PillButton>
                      <a href="/admin/seo/redirects" className="rounded-md border border-border px-2 py-1 text-[0.72rem] font-semibold text-foreground hover:bg-secondary">Create redirect</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function NotFoundPage() {
  const statusMeta: Record<string, string> = { new: 'bg-warning/15 text-warning', ignored: 'bg-muted text-muted-foreground', resolved: 'bg-success/15 text-success' }
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Site Health', '404']} title="404 Monitoring" description="Requested URLs that returned 404, with suggested destinations. Connects to the SEO Redirect Manager." />
      <ExampleBanner>404 hits are placeholder data until request logging is connected.</ExampleBanner>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Requested URL</th>
                <th className="py-2 pr-4 font-semibold text-right">Hits</th>
                <th className="py-2 pr-4 font-semibold">First</th>
                <th className="py-2 pr-4 font-semibold">Last</th>
                <th className="py-2 pr-4 font-semibold">Suggested</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {notFoundLog.map((n, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-mono text-[0.72rem] text-foreground">{n.url}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{n.hits}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{n.firstDetected}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{n.lastDetected}</td>
                  <td className="py-2.5 pr-4 font-mono text-[0.72rem] text-muted-foreground">{n.suggested}</td>
                  <td className="py-2.5 pr-4"><Badge label={n.status} tone={statusMeta[n.status]} /></td>
                  <td className="py-2.5 pr-4">
                    <div className="flex gap-1.5">
                      <a href="/admin/seo/redirects" className="rounded-md border border-border px-2 py-1 text-[0.72rem] font-semibold text-foreground hover:bg-secondary">Create 301</a>
                      <PillButton>Ignore</PillButton>
                      <PillButton>Resolve</PillButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function RedirectsPage() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Site Health', 'Redirects']} title="Redirect Health" description="Monitors redirect chains, loops, redirects to 404, invalid destinations and excessive hops. Connects to the Redirect Manager." />
      <ExampleBanner />
      <div className="grid gap-4 sm:grid-cols-2">
        {redirectIssues.map((r) => (
          <Panel key={r.type} title={r.type} actions={<HealthBadge status={r.status} />}>
            <p className="text-[0.82rem] text-muted-foreground">{r.detail}</p>
          </Panel>
        ))}
      </div>
      <div className="mt-6"><a href="/admin/seo/redirects" className="rounded-md border border-border px-3 py-2 text-[0.82rem] font-semibold text-foreground hover:bg-secondary">Open Redirect Manager</a></div>
    </div>
  )
}

function SitemapPage() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Site Health', 'Sitemap']} title="Sitemap Health" description="Status of the sitemap index and each child sitemap. Submission status is not claimed without a real integration." />
      <ExampleBanner>URL counts are illustrative. Submission to search engines requires a connected integration.</ExampleBanner>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Sitemap</th>
                <th className="py-2 pr-4 font-semibold text-right">URLs</th>
                <th className="py-2 pr-4 font-semibold">Last generated</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {sitemaps.map((s) => (
                <tr key={s.name} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{s.name}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{s.urls.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{s.lastGenerated}</td>
                  <td className="py-2.5 pr-4"><HealthBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function IndexingPage() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Site Health', 'Indexing']} title="Indexing Health" description="Indexation state across the site. These are UI states from your own settings until connected to crawler/search-engine data." />
      <ExampleBanner>Indexation buckets reflect CMS settings, not live search-engine data.</ExampleBanner>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {indexingBuckets.map((b) => <StatCard key={b.label} label={b.label} value={b.count.toLocaleString()} tone="muted" />)}
      </div>
      <Panel title="Warning categories">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Category</th>
                <th className="py-2 pr-4 font-semibold text-right">Count</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {indexingWarnings.map((w) => (
                <tr key={w.category} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{w.category}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{w.count}</td>
                  <td className="py-2.5 pr-4"><HealthBadge status={w.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function ImagesPage() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Site Health', 'Images']} title="Image Health" description="Image issues across content. Connects to the Media Library (Phase 13)." />
      <ExampleBanner />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {imageIssues.map((iss) => (
          <Panel key={iss.category} title={iss.category} actions={<HealthBadge status={iss.status} />}>
            <p className="font-serif text-[1.6rem] font-semibold text-muted-foreground">{iss.count}</p>
            <a href="/admin/media" className="mt-2 inline-block text-[0.76rem] font-semibold text-primary hover:underline">Review in Media Library →</a>
          </Panel>
        ))}
      </div>
    </div>
  )
}

function PerformancePage() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Site Health', 'Performance']} title="Performance Monitoring" description="Core Web Vitals and load metrics. Real measurements require a connected field-data source." />
      <ExampleBanner>No Core Web Vitals data is measured yet — targets are shown, values render as “—”.</ExampleBanner>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Metric</th>
                <th className="py-2 pr-4 font-semibold">Abbr.</th>
                <th className="py-2 pr-4 font-semibold text-right">Value</th>
                <th className="py-2 pr-4 font-semibold text-right">Target</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {webVitals.map((v) => (
                <tr key={v.abbr} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{v.metric}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{v.abbr}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{v.example}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{v.target}</td>
                  <td className="py-2.5 pr-4"><HealthBadge status={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ============================ System (§30–31) ============================ */
export function SystemStatus() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'System', 'Status']} title="System Status" description="Connection state of the services this CMS will use in production. Nothing is claimed as connected that isn't." />
      <ExampleBanner>This is a front-end prototype — external services are not connected.</ExampleBanner>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {systemServices.map((s) => {
          const m = serviceStateMeta[s.state]
          return (
            <Panel key={s.name} title={s.name} actions={<span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${m.tone}`}><span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} aria-hidden />{m.label}</span>}>
              <p className="text-[0.82rem] text-muted-foreground">{s.note}</p>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}

export function SystemActivity() {
  const resultMeta: Record<string, string> = { success: 'bg-success/15 text-success', warning: 'bg-warning/15 text-warning', failed: 'bg-error/12 text-error' }
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'System', 'Activity']} title="Activity Log" description="A descriptive record of actions taken in the CMS." />
      <ExampleBanner>Illustrative log entries — full audit logging arrives with the backend.</ExampleBanner>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">User</th>
                <th className="py-2 pr-4 font-semibold">Action</th>
                <th className="py-2 pr-4 font-semibold">Area</th>
                <th className="py-2 pr-4 font-semibold">Timestamp</th>
                <th className="py-2 pr-4 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody>
              {activityLog.map((a) => (
                <tr key={a.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{a.user}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{a.action}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{a.area}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{a.timestamp}</td>
                  <td className="py-2.5 pr-4"><Badge label={a.result} tone={resultMeta[a.result]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
