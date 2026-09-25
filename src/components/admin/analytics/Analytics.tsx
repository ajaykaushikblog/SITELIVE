import { useMemo, useState } from 'react'
import { Button } from '../../ui/primitives'
import { Plus } from '../../ui/icons'
import { AdminPageHeader, Panel, Badge, Select, EmptyState, PillButton, StatCard, Field } from '../ui'
import {
  SubNav,
  analyticsNav,
  ExampleBanner,
  DateRangeBar,
  MetricGrid,
  Chart,
  ComparisonBadge,
  Pagination,
  useTableState,
  ExportControl,
} from './shared'
import { contentType, contentTypes } from '../../../lib/admin/cms'
import {
  trafficMetrics,
  trafficSources,
  topLandingPages,
  trendSeries,
  contentPerformance,
  dimensionPerformance,
  authorPerformance,
  popularSearches,
  noResultSearches,
  contentOpportunities,
  pinterestMetrics,
  topPins,
  socialPerformance,
  adPerformance,
  affiliatePerformance,
  sponsoredPerformance,
  newsletterMetrics,
  deviceReport,
  geoReport,
  savedReports,
  availableMetrics,
  availableDimensions,
  availableFilters,
  alerts,
  alertConditions,
  type DateRangeId,
} from '../../../lib/admin/analytics'

/* =========================================================================
   Phase 18 — Universal Analytics.

   Descriptive, aggregated, website-level reporting. Every screen shares the
   analytics sub-nav + date-range bar and reuses the accessible Chart (which
   always offers a tabular alternative). No provider is connected: numbers are
   labelled example data and comparisons are descriptive (Increased / Decreased
   / Unchanged), never subjective judgements.
   ========================================================================= */

export function Analytics({ section = '', detailId }: { section?: string; detailId?: string }) {
  const [range, setRange] = useState<DateRangeId>('30 Days')

  return (
    <div>
      <SubNav items={analyticsNav} active={section} />
      {section === '' && <OverviewPage range={range} setRange={setRange} />}
      {section === 'content' && (detailId ? <ContentDetail id={detailId} range={range} setRange={setRange} /> : <ContentPage range={range} setRange={setRange} />)}
      {section === 'categories' && <CategoriesPage range={range} setRange={setRange} />}
      {section === 'authors' && <AuthorsPage range={range} setRange={setRange} />}
      {section === 'search' && <SearchPage />}
      {section === 'pinterest' && <PinterestPage range={range} setRange={setRange} />}
      {section === 'social' && <SocialPage range={range} setRange={setRange} />}
      {section === 'advertising' && <AdvertisingPage range={range} setRange={setRange} />}
      {section === 'affiliate' && <AffiliatePage range={range} setRange={setRange} />}
      {section === 'sponsored' && <SponsoredPage />}
      {section === 'newsletter' && <NewsletterPage range={range} setRange={setRange} />}
      {section === 'devices' && <DevicesPage range={range} setRange={setRange} />}
      {section === 'geography' && <GeographyPage range={range} setRange={setRange} />}
      {section === 'reports' && <ReportsPage />}
      {section === 'alerts' && <AlertsPage />}
    </div>
  )
}

type RangeProps = { range: DateRangeId; setRange: (r: DateRangeId) => void }

/* ============================ Overview ============================ */
function OverviewPage({ range, setRange }: RangeProps) {
  const [compare, setCompare] = useState('previous')
  const sources = trafficSources(range)
  const landing = topLandingPages(range)
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Analytics']}
        title="Analytics"
        description="Descriptive, aggregated reporting across traffic, content, Pinterest, social, advertising, affiliate and more."
        actions={<ExportControl />}
      />
      <ExampleBanner />
      <DateRangeBar range={range} onRange={setRange} compare={compare} onCompare={setCompare} />
      <MetricGrid metrics={trafficMetrics(range)} />

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Chart title="Sessions trend (example)" data={trendSeries('sess-' + range, 14, 400, 1600)} type="area" />
        <Chart title="Page views trend (example)" data={trendSeries('pv-' + range, 14, 600, 2400)} type="line" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Top traffic sources">
          <ul className="space-y-2.5">
            {sources.map((s) => (
              <li key={s.source} className="flex items-center gap-3 text-[0.85rem]">
                <span className="w-32 shrink-0 font-medium text-foreground">{s.source}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <span className="block h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${s.pct}%` }} />
                </span>
                <span className="w-10 shrink-0 text-right text-muted-foreground">{s.pct}%</span>
                <span className="w-16 shrink-0 text-right text-muted-foreground">{s.visits.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Top landing pages">
          <ul className="divide-y divide-border">
            {landing.map((l) => (
              <li key={l.href} className="flex items-center justify-between gap-3 py-2 text-[0.85rem]">
                <a href={l.href} className="min-w-0 truncate text-foreground hover:underline">{l.title}</a>
                <span className="shrink-0 font-medium text-muted-foreground">{l.views.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

/* ============================ Content ============================ */
function ContentPage({ range, setRange }: RangeProps) {
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState<'views' | 'sessions' | 'title'>('views')
  const rows = useMemo(() => {
    let list = contentPerformance(range).filter((r) => {
      if (type !== 'all' && r.item.type !== type) return false
      if (q && !r.item.title.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
    list = list.slice().sort((a, b) => (sort === 'title' ? a.item.title.localeCompare(b.item.title) : b[sort] - a[sort]))
    return list
  }, [range, type, q, sort])
  const { slice, page, pages, setPage } = useTableState(rows, 8)

  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Content']} title="Content Performance" description="Views, sessions and engagement per piece. No overall quality score — just descriptive metrics." actions={<ExportControl />} />
      <ExampleBanner />
      <DateRangeBar range={range} onRange={setRange} />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search content…" className="min-w-[200px] flex-1 rounded-md border border-border bg-background px-3 py-2 text-[0.83rem] text-foreground outline-none focus:border-foreground/40" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-[0.82rem] text-foreground">
          <option value="all">All types</option>
          {contentTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-md border border-border bg-background px-3 py-2 text-[0.82rem] text-foreground">
          <option value="views">Sort: Views</option>
          <option value="sessions">Sort: Sessions</option>
          <option value="title">Sort: Title</option>
        </select>
      </div>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Content</th>
                <th className="py-2 pr-4 font-semibold">Type</th>
                <th className="py-2 pr-4 font-semibold text-right">Views</th>
                <th className="py-2 pr-4 font-semibold text-right">Sessions</th>
                <th className="py-2 pr-4 font-semibold text-right">Engagement</th>
                <th className="py-2 pr-4 font-semibold">Published</th>
                <th className="py-2 pr-4 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((r) => (
                <tr key={r.item.id} className="border-b border-border/60 hover:bg-secondary/40">
                  <td className="py-2.5 pr-4"><a href={`/admin/analytics/content/${r.item.id}`} className="font-medium text-foreground hover:underline">{r.item.title}</a></td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{contentType(r.item.type).label}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.views.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.sessions.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.engagement}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.item.publishedDate ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.item.updatedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} onChange={setPage} />
      </Panel>
    </div>
  )
}

function ContentDetail({ id, range, setRange }: { id: string } & RangeProps) {
  const row = contentPerformance(range).find((r) => r.item.id === id)
  if (!row) return <EmptyState title="Content not found" />
  const c = row.item
  const stat = (label: string, value: string) => <StatCard key={label} label={label} value={value} tone="muted" />
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Analytics', 'Content', c.title]}
        title={c.title}
        description={`${contentType(c.type).label} · ${c.author}`}
        actions={<a href="/admin/analytics/content" className="rounded-md border border-border px-3 py-2 text-[0.82rem] font-semibold text-foreground hover:bg-secondary">Back</a>}
      />
      <ExampleBanner>Per-content analytics — no claims are made about <em>why</em> a page performed a certain way.</ExampleBanner>
      <DateRangeBar range={range} onRange={setRange} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat('Page Views', row.views.toLocaleString())}
        {stat('Sessions', row.sessions.toLocaleString())}
        {stat('Engagement', row.engagement)}
        {stat('Pinterest Saves', String(c.pinCount * 40))}
        {stat('Affiliate Clicks', '—')}
        {stat('Ad Impressions', '—')}
        {stat('Est. Revenue', '$—')}
        {stat('Social Shares', String(c.pinCount * 12))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Chart title="Views trend (example)" data={trendSeries(c.id + 'vt' + range, 14, 20, 200)} type="area" />
        <Chart title="Traffic sources (example)" data={[46, 28, 11, 7, 4, 3, 1]} labels={['Organic', 'Pinterest', 'Direct', 'Social', 'Referral', 'Email', 'Other']} type="bar" />
      </div>
    </div>
  )
}

/* ============================ Categories ============================ */
function CategoriesPage({ range, setRange }: RangeProps) {
  const [kind, setKind] = useState<'category' | 'subcategory' | 'occasion' | 'season'>('category')
  const rows = dimensionPerformance(kind, range)
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Categories']} title="Category Performance" description="Compare performance across taxonomy. Descriptive comparisons only — no 'best' or 'worst' rankings." actions={<ExportControl />} />
      <ExampleBanner />
      <DateRangeBar range={range} onRange={setRange} />
      <div className="mb-5">
        <Select value={kind} onChange={(v) => setKind(v as any)} options={[{ value: 'category', label: 'By Category' }, { value: 'subcategory', label: 'By Subcategory' }, { value: 'occasion', label: 'By Occasion' }, { value: 'season', label: 'By Season' }]} />
      </div>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Name</th>
                <th className="py-2 pr-4 font-semibold text-right">Published</th>
                <th className="py-2 pr-4 font-semibold text-right">Views</th>
                <th className="py-2 pr-4 font-semibold text-right">Sessions</th>
                <th className="py-2 pr-4 font-semibold text-right">Engagement</th>
                <th className="py-2 pr-4 font-semibold text-right">Pins</th>
                <th className="py-2 pr-4 font-semibold text-right">Affiliate clicks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{r.name}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.published}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.views.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.sessions.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.engagement}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.pins}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.affiliateClicks.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ============================ Authors ============================ */
function AuthorsPage({ range, setRange }: RangeProps) {
  const rows = authorPerformance(range)
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Authors']} title="Author Performance" description="Descriptive output and reach per author — no author quality scores." actions={<ExportControl />} />
      <ExampleBanner />
      <DateRangeBar range={range} onRange={setRange} />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Author</th>
                <th className="py-2 pr-4 font-semibold text-right">Published</th>
                <th className="py-2 pr-4 font-semibold text-right">Views</th>
                <th className="py-2 pr-4 font-semibold text-right">Sessions</th>
                <th className="py-2 pr-4 font-semibold text-right">Engagement</th>
                <th className="py-2 pr-4 font-semibold text-right">Pins</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{r.name}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.published}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.views.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.sessions.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.engagement}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.pins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ============================ Search ============================ */
function SearchPage() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Search']} title="Search Performance" description="On-site search insight. Raw analytics and editorial interpretation are kept clearly separate." actions={<ExportControl />} />
      <ExampleBanner>On-site search analytics are illustrative until search logging is connected.</ExampleBanner>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Popular searches">
          <SearchTable rows={popularSearches} />
        </Panel>
        <Panel title="No-result searches">
          <SearchTable rows={noResultSearches} />
        </Panel>
      </div>
      <div className="mt-6">
        <Panel title="Content opportunities">
          <p className="mb-3 rounded-md bg-secondary/50 px-3 py-2 text-[0.76rem] text-muted-foreground"><span className="font-semibold text-foreground">Editorial interpretation</span> — suggestions derived from search gaps, not measured analytics.</p>
          <ul className="space-y-3">
            {contentOpportunities.map((o) => (
              <li key={o.topic} className="rounded-lg border border-border p-3">
                <p className="font-semibold text-foreground">{o.topic}</p>
                <p className="text-[0.8rem] text-muted-foreground">{o.note}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

function SearchTable({ rows }: { rows: { query: string; volume: number; clicks: number; exitRate: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[0.83rem]">
        <thead>
          <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
            <th className="py-2 pr-4 font-semibold">Query</th>
            <th className="py-2 pr-4 font-semibold text-right">Volume</th>
            <th className="py-2 pr-4 font-semibold text-right">Clicks</th>
            <th className="py-2 pr-4 font-semibold text-right">Exit rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.query} className="border-b border-border/60">
              <td className="py-2 pr-4 font-medium text-foreground">{r.query}</td>
              <td className="py-2 pr-4 text-right text-muted-foreground">{r.volume.toLocaleString()}</td>
              <td className="py-2 pr-4 text-right text-muted-foreground">{r.clicks.toLocaleString()}</td>
              <td className="py-2 pr-4 text-right text-muted-foreground">{r.exitRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ============================ Pinterest ============================ */
function PinterestPage({ range, setRange }: RangeProps) {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Pinterest']} title="Pinterest Performance" description="Impressions, saves and outbound clicks. Future integration data — the Pinterest API is not connected." actions={<ExportControl />} />
      <ExampleBanner>Pinterest metrics are illustrative. No Pinterest API connection exists yet.</ExampleBanner>
      <DateRangeBar range={range} onRange={setRange} />
      <MetricGrid metrics={pinterestMetrics(range)} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <Panel title="Top pins">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.83rem]">
              <thead>
                <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="py-2 pr-4 font-semibold">Pin</th>
                  <th className="py-2 pr-4 font-semibold">Template</th>
                  <th className="py-2 pr-4 font-semibold text-right">Saves</th>
                  <th className="py-2 pr-4 font-semibold text-right">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {topPins(range).map((p) => (
                  <tr key={p.title} className="border-b border-border/60">
                    <td className="py-2 pr-4 font-medium text-foreground">{p.title}</td>
                    <td className="py-2 pr-4 capitalize text-muted-foreground">{p.template}</td>
                    <td className="py-2 pr-4 text-right text-muted-foreground">{p.saves.toLocaleString()}</td>
                    <td className="py-2 pr-4 text-right text-muted-foreground">{p.clicks.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Chart title="Saves by day (example)" data={trendSeries('pin-' + range, 12, 20, 300)} type="bar" />
      </div>
    </div>
  )
}

/* ============================ Social ============================ */
function SocialPage({ range, setRange }: RangeProps) {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Social']} title="Social Performance" description="Shares, clicks and referral visits by platform." actions={<ExportControl />} />
      <ExampleBanner />
      <DateRangeBar range={range} onRange={setRange} />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Platform</th>
                <th className="py-2 pr-4 font-semibold text-right">Shares</th>
                <th className="py-2 pr-4 font-semibold text-right">Clicks</th>
                <th className="py-2 pr-4 font-semibold text-right">Engagement</th>
                <th className="py-2 pr-4 font-semibold text-right">Referral visits</th>
              </tr>
            </thead>
            <tbody>
              {socialPerformance(range).map((r) => (
                <tr key={r.platform} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{r.platform}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.shares.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.clicks.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.engagement}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.referral.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ============================ Advertising ============================ */
function AdvertisingPage({ range, setRange }: RangeProps) {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Advertising']} title="Ad Performance" description="Impressions, clicks, CTR and RPM by ad slot. Connected to the Phase 17 ad registry." actions={<ExportControl />} />
      <ExampleBanner>Ad revenue and delivery require a connected ad network — figures are illustrative.</ExampleBanner>
      <DateRangeBar range={range} onRange={setRange} />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Ad slot</th>
                <th className="py-2 pr-4 font-semibold">Device</th>
                <th className="py-2 pr-4 font-semibold">Placement</th>
                <th className="py-2 pr-4 font-semibold text-right">Impr.</th>
                <th className="py-2 pr-4 font-semibold text-right">Clicks</th>
                <th className="py-2 pr-4 font-semibold text-right">CTR</th>
                <th className="py-2 pr-4 font-semibold text-right">RPM (ex.)</th>
              </tr>
            </thead>
            <tbody>
              {adPerformance(range).map((r) => (
                <tr key={r.slot} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{r.slot}</td>
                  <td className="py-2.5 pr-4 capitalize text-muted-foreground">{r.device}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.pageType}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.impressions.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.clicks.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.ctr}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.rpm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ============================ Affiliate ============================ */
function AffiliatePage({ range, setRange }: RangeProps) {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Affiliate']} title="Affiliate Performance" description="Clicks and conversion by product, merchant and category. Connected to Phase 17." actions={<ExportControl />} />
      <ExampleBanner>Earnings and revenue require a connected affiliate network — figures are illustrative.</ExampleBanner>
      <DateRangeBar range={range} onRange={setRange} />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Product</th>
                <th className="py-2 pr-4 font-semibold">Merchant</th>
                <th className="py-2 pr-4 font-semibold">Category</th>
                <th className="py-2 pr-4 font-semibold text-right">Clicks</th>
                <th className="py-2 pr-4 font-semibold text-right">Conv. rate</th>
                <th className="py-2 pr-4 font-semibold text-right">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {affiliatePerformance(range).map((r) => (
                <tr key={r.product} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{r.product}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.merchant}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.category}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.clicks.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.conversion}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">$—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ============================ Sponsored ============================ */
function SponsoredPage() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Sponsored']} title="Sponsored Content Performance" description="Delivery and engagement per campaign." actions={<ExportControl />} />
      <ExampleBanner />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Campaign</th>
                <th className="py-2 pr-4 font-semibold">Brand</th>
                <th className="py-2 pr-4 font-semibold text-right">Impr. (ex.)</th>
                <th className="py-2 pr-4 font-semibold text-right">Clicks (ex.)</th>
                <th className="py-2 pr-4 font-semibold text-right">CTR</th>
                <th className="py-2 pr-4 font-semibold">Start</th>
                <th className="py-2 pr-4 font-semibold">End</th>
                <th className="py-2 pr-4 font-semibold text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {sponsoredPerformance().map((r) => (
                <tr key={r.campaign} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{r.campaign}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.brand}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.impressions ? r.impressions.toLocaleString() : '—'}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.clicks ? r.clicks.toLocaleString() : '—'}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.ctr}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.start}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.end}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">$—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ============================ Newsletter ============================ */
function NewsletterPage({ range, setRange }: RangeProps) {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Newsletter']} title="Newsletter Analytics" description="Subscriber and engagement metrics. No email provider is connected." actions={<ExportControl />} />
      <ExampleBanner>Newsletter metrics are illustrative until an email provider is connected.</ExampleBanner>
      <DateRangeBar range={range} onRange={setRange} />
      <MetricGrid metrics={newsletterMetrics(range)} />
      <Chart title="New subscribers (example)" data={trendSeries('nl-' + range, 14, 5, 60)} type="area" />
    </div>
  )
}

/* ============================ Devices ============================ */
function DevicesPage({ range, setRange }: RangeProps) {
  const rows = deviceReport(range)
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Devices']} title="Device Report" description="Aggregated device categories. No personal attributes are inferred from device information." actions={<ExportControl />} />
      <ExampleBanner />
      <DateRangeBar range={range} onRange={setRange} />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Device</th>
                <th className="py-2 pr-4 font-semibold text-right">Sessions</th>
                <th className="py-2 pr-4 font-semibold text-right">Page views</th>
                <th className="py-2 pr-4 font-semibold text-right">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.device} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{r.device}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.sessions.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.views.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{r.engagement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ============================ Geography ============================ */
function GeographyPage({ range, setRange }: RangeProps) {
  const rows = geoReport(range)
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Geography']} title="Geographic Reporting" description="Aggregated country-level reporting only. No individual visitor information or tracking profiles." actions={<ExportControl />} />
      <ExampleBanner>Aggregated, country-level example data. Individual visitors are never identified.</ExampleBanner>
      <DateRangeBar range={range} onRange={setRange} />
      <Panel title="Sessions by country">
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.country} className="flex items-center gap-3 text-[0.85rem]">
              <span className="w-36 shrink-0 font-medium text-foreground">{r.country}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <span className="block h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${r.pct}%` }} />
              </span>
              <span className="w-10 shrink-0 text-right text-muted-foreground">{r.pct}%</span>
              <span className="w-16 shrink-0 text-right text-muted-foreground">{r.sessions.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

/* ============================ Reports ============================ */
function ReportsPage() {
  const [building, setBuilding] = useState(false)
  if (building) return <ReportBuilder onBack={() => setBuilding(false)} />
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Reports']} title="Reports" description="Build custom reports and reuse saved templates." actions={<Button size="md" onClick={() => setBuilding(true)}><Plus width={15} height={15} /> New report</Button>} />
      <ExampleBanner>Saved reports are example templates. Export runs once a data provider is connected.</ExampleBanner>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {savedReports.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-serif text-[1.1rem] font-semibold text-foreground">{r.name}</h3>
              <Badge label={r.visualization} tone="bg-secondary text-secondary-foreground" />
            </div>
            <p className="text-[0.76rem] text-muted-foreground">{r.dateRange} · {r.metrics.length} metrics · {r.dimensions.length} dimensions</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <PillButton onClick={() => setBuilding(true)}>Open</PillButton>
              <PillButton>Duplicate</PillButton>
              <PillButton tone="danger" onClick={() => confirm(`Delete "${r.name}"? This template will be removed.`)}>Delete</PillButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReportBuilder({ onBack }: { onBack: () => void }) {
  const [viz, setViz] = useState('line')
  const [range, setRange] = useState<DateRangeId>('30 Days')
  const [metrics, setMetrics] = useState<string[]>(['Page Views'])
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Analytics', 'Reports', 'New']}
        title="Report builder"
        actions={<><Button variant="outline" size="md" onClick={onBack}>Back</Button><Button size="md" onClick={() => { alert('Report saved (prototype).'); onBack() }}>Save report</Button></>}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="space-y-6">
          <Panel title="Configuration">
            <div className="space-y-4">
              <Field label="Report name" placeholder="e.g. Weekly Pinterest recap" />
              <DateRangeBar range={range} onRange={setRange} />
              <Select label="Chart type" value={viz} onChange={setViz} options={[{ value: 'line', label: 'Line' }, { value: 'bar', label: 'Bar' }, { value: 'area', label: 'Area' }, { value: 'table', label: 'Table' }]} />
            </div>
          </Panel>
          <Panel title="Metrics">
            <div className="flex flex-wrap gap-2">
              {availableMetrics.map((m) => (
                <button key={m} type="button" onClick={() => toggle(metrics, setMetrics, m)} className={`rounded-full px-3 py-1.5 text-[0.78rem] font-semibold ${metrics.includes(m) ? 'bg-foreground text-background' : 'bg-secondary text-secondary-foreground'}`}>{m}</button>
              ))}
            </div>
          </Panel>
          <Panel title="Preview">
            {viz === 'table' ? <p className="text-[0.82rem] text-muted-foreground">A table of the selected metrics will render here.</p> : <Chart title="Preview (example)" data={trendSeries('rb', 12, 100, 800)} type={viz as any} />}
          </Panel>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Panel title="Dimensions">
            <div className="flex flex-wrap gap-1.5">{availableDimensions.map((d) => <span key={d} className="rounded-full bg-secondary px-2.5 py-1 text-[0.74rem] text-secondary-foreground">{d}</span>)}</div>
          </Panel>
          <Panel title="Filters">
            <div className="flex flex-wrap gap-1.5">{availableFilters.map((f) => <span key={f} className="rounded-full bg-secondary px-2.5 py-1 text-[0.74rem] text-secondary-foreground">{f}</span>)}</div>
          </Panel>
          <Panel title="Export"><ExportControl /></Panel>
        </aside>
      </div>
    </div>
  )
}

/* ============================ Alerts ============================ */
function AlertsPage() {
  return (
    <div>
      <AdminPageHeader breadcrumb={['CMS', 'Analytics', 'Alerts']} title="Alerts & Monitoring" description="Define conditions to watch. A future monitoring surface — alerts fire once data sources are connected." actions={<Button size="md"><Plus width={15} height={15} /> New alert</Button>} />
      <ExampleBanner>Alerts are configured here but do not fire until monitoring data sources are connected.</ExampleBanner>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Alert</th>
                <th className="py-2 pr-4 font-semibold">Condition</th>
                <th className="py-2 pr-4 font-semibold">Threshold</th>
                <th className="py-2 pr-4 font-semibold">Frequency</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{a.name}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{a.condition}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{a.threshold}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{a.frequency}</td>
                  <td className="py-2.5 pr-4"><Badge label={a.status === 'active' ? 'Active' : 'Paused'} tone={a.status === 'active' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="mt-6">
        <Panel title="Available alert conditions">
          <div className="flex flex-wrap gap-2">{alertConditions.map((c) => <span key={c} className="rounded-full bg-secondary px-3 py-1 text-[0.76rem] text-secondary-foreground">{c}</span>)}</div>
        </Panel>
      </div>
    </div>
  )
}
