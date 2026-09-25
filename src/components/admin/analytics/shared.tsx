import { useState, type ReactNode } from 'react'
import { Warning } from '../../ui/icons'
import { Panel } from '../ui'
import {
  ANALYTICS_NOTE,
  dateRanges,
  rangeLabel,
  healthStatusMeta,
  type DateRangeId,
  type ComparisonDirection,
  type AnalyticsMetric,
  type HealthStatus,
  type ChartType,
} from '../../../lib/admin/analytics'

/* =========================================================================
   Phase 18 — shared analytics & site-health UI.

   A single sub-navigation, a date-range bar (with the selected window shown
   clearly and a comparison toggle), metric cards with descriptive change
   badges, an accessible SVG chart that always ships a tabular alternative,
   and health/status badges that pair a label with colour (never colour alone).
   ========================================================================= */

/* ---- Analytics sub-navigation ---- */
export const analyticsNav = [
  { id: '', label: 'Overview', href: '/admin/analytics' },
  { id: 'content', label: 'Content', href: '/admin/analytics/content' },
  { id: 'categories', label: 'Categories', href: '/admin/analytics/categories' },
  { id: 'authors', label: 'Authors', href: '/admin/analytics/authors' },
  { id: 'search', label: 'Search', href: '/admin/analytics/search' },
  { id: 'pinterest', label: 'Pinterest', href: '/admin/analytics/pinterest' },
  { id: 'social', label: 'Social', href: '/admin/analytics/social' },
  { id: 'advertising', label: 'Advertising', href: '/admin/analytics/advertising' },
  { id: 'affiliate', label: 'Affiliate', href: '/admin/analytics/affiliate' },
  { id: 'sponsored', label: 'Sponsored', href: '/admin/analytics/sponsored' },
  { id: 'newsletter', label: 'Newsletter', href: '/admin/analytics/newsletter' },
  { id: 'devices', label: 'Devices', href: '/admin/analytics/devices' },
  { id: 'geography', label: 'Geography', href: '/admin/analytics/geography' },
  { id: 'reports', label: 'Reports', href: '/admin/analytics/reports' },
  { id: 'alerts', label: 'Alerts', href: '/admin/analytics/alerts' },
]

export const siteHealthNav = [
  { id: '', label: 'Overview', href: '/admin/site-health' },
  { id: 'links', label: 'Links', href: '/admin/site-health/links' },
  { id: '404', label: '404s', href: '/admin/site-health/404' },
  { id: 'redirects', label: 'Redirects', href: '/admin/site-health/redirects' },
  { id: 'sitemap', label: 'Sitemap', href: '/admin/site-health/sitemap' },
  { id: 'indexing', label: 'Indexing', href: '/admin/site-health/indexing' },
  { id: 'images', label: 'Images', href: '/admin/site-health/images' },
  { id: 'performance', label: 'Performance', href: '/admin/site-health/performance' },
]

export function SubNav({ items, active }: { items: { id: string; label: string; href: string }[]; active: string }) {
  return (
    <nav className="mb-8 flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-border pb-3">
      {items.map((item) => {
        const on = item.id === active
        return (
          <a
            key={item.id || 'root'}
            href={item.href}
            aria-current={on ? 'page' : undefined}
            className={`rounded-full px-3 py-1.5 text-[0.8rem] font-semibold transition-colors ${
              on ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}

/* ---- Honest example-data banner ---- */
export function ExampleBanner({ children }: { children?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-[0.8rem] leading-relaxed text-foreground">
      <Warning width={16} height={16} className="mt-0.5 shrink-0 text-warning" />
      <p><span className="font-semibold">Example data. </span>{children ?? ANALYTICS_NOTE}</p>
    </div>
  )
}

/* ---- Date range bar with comparison + clearly shown window ---- */
export function DateRangeBar({
  range,
  onRange,
  compare,
  onCompare,
}: {
  range: DateRangeId
  onRange: (r: DateRangeId) => void
  compare?: string
  onCompare?: (c: string) => void
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3">
      <div className="flex flex-wrap gap-1.5">
        {dateRanges.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onRange(r)}
            aria-pressed={range === r}
            className={`rounded-md border px-3 py-1.5 text-[0.8rem] font-semibold transition-colors ${
              range === r ? 'border-foreground/40 bg-secondary text-foreground' : 'border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <span className="rounded-full bg-secondary px-3 py-1 text-[0.76rem] font-medium text-secondary-foreground">
        Showing: {rangeLabel(range)}
      </span>
      {onCompare && (
        <label className="ml-auto flex items-center gap-2 text-[0.78rem] text-muted-foreground">
          Compare to
          <select
            value={compare}
            onChange={(e) => onCompare(e.target.value)}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-[0.78rem] text-foreground outline-none focus:border-foreground/40"
          >
            <option value="previous">Previous period</option>
            <option value="year">Previous year</option>
            <option value="none">No comparison</option>
          </select>
        </label>
      )}
    </div>
  )
}

/* ---- Comparison badge: label + arrow glyph, never colour alone ---- */
export function ComparisonBadge({ direction, delta }: { direction: ComparisonDirection; delta: string }) {
  const meta: Record<ComparisonDirection, { glyph: string; word: string; tone: string }> = {
    increased: { glyph: '▲', word: 'Increased', tone: 'text-success' },
    decreased: { glyph: '▼', word: 'Decreased', tone: 'text-error' },
    unchanged: { glyph: '＝', word: 'Unchanged', tone: 'text-muted-foreground' },
  }
  const m = meta[direction]
  return (
    <span className={`inline-flex items-center gap-1 text-[0.72rem] font-semibold ${m.tone}`}>
      <span aria-hidden>{m.glyph}</span>
      <span className="sr-only">{m.word}: </span>
      {delta}
    </span>
  )
}

export function MetricCard({ metric }: { metric: AnalyticsMetric }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{metric.metric}</p>
      <p className="mt-2 font-serif text-[1.7rem] font-semibold leading-none text-muted-foreground">{metric.value}</p>
      <div className="mt-2 flex items-center gap-2">
        {metric.comparison ? <ComparisonBadge {...metric.comparison} /> : <span className="text-[0.72rem] text-muted-foreground">—</span>}
        <span className="text-[0.68rem] text-muted-foreground">vs. previous</span>
      </div>
    </div>
  )
}

export function MetricGrid({ metrics }: { metrics: AnalyticsMetric[] }) {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <MetricCard key={m.metric} metric={m} />
      ))}
    </div>
  )
}

/* ---- Accessible chart with a built-in tabular alternative ---- */
export function Chart({
  title,
  data,
  labels,
  type = 'line',
  description,
}: {
  title: string
  data: number[]
  labels?: string[]
  type?: ChartType
  description?: string
}) {
  const [showTable, setShowTable] = useState(false)
  const max = Math.max(...data, 1)
  const w = 640
  const h = 180
  const pad = 8
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2)
  const points = data.map((v, i) => `${pad + i * step},${y(v)}`).join(' ')
  const desc = description ?? `${title}: example trend over ${data.length} points, values from ${Math.min(...data)} to ${max}.`

  return (
    <Panel
      title={title}
      actions={
        <button
          type="button"
          onClick={() => setShowTable((s) => !s)}
          className="rounded-md border border-border px-2.5 py-1 text-[0.72rem] font-semibold text-foreground hover:bg-secondary"
        >
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      }
    >
      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[0.82rem]">
            <caption className="sr-only">{desc}</caption>
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Point</th>
                <th className="py-2 pr-4 font-semibold text-right">Value (example)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((v, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="py-1.5 pr-4 text-muted-foreground">{labels?.[i] ?? `#${i + 1}`}</td>
                  <td className="py-1.5 pr-4 text-right font-medium text-foreground">{v.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <svg role="img" aria-label={desc} viewBox={`0 0 ${w} ${h}`} className="h-44 w-full">
          <title>{title}</title>
          <desc>{desc}</desc>
          {type === 'bar' ? (
            data.map((v, i) => {
              const bw = Math.max(2, step * 0.6)
              return <rect key={i} x={pad + i * step - bw / 2} y={y(v)} width={bw} height={h - pad - y(v)} rx={2} className="fill-[var(--color-primary)]" opacity={0.85} />
            })
          ) : (
            <>
              {type === 'area' && (
                <polygon points={`${pad},${h - pad} ${points} ${pad + (data.length - 1) * step},${h - pad}`} className="fill-[var(--color-primary)]" opacity={0.12} />
              )}
              <polyline points={points} fill="none" className="stroke-[var(--color-primary)]" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
              {data.map((v, i) => (
                <circle key={i} cx={pad + i * step} cy={y(v)} r={2.5} className="fill-[var(--color-primary)]" />
              ))}
            </>
          )}
        </svg>
      )}
    </Panel>
  )
}

/* ---- Health / status badges ---- */
export function HealthBadge({ status }: { status: HealthStatus }) {
  const m = healthStatusMeta[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${m.tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} aria-hidden />
      {m.label}
    </span>
  )
}

/* ---- Simple sortable/searchable table wrapper helper ---- */
export function useTableState<T>(rows: T[], perPage = 10) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(rows.length / perPage))
  const clamped = Math.min(page, pages)
  return { slice: rows.slice((clamped - 1) * perPage, clamped * perPage), page: clamped, pages, setPage }
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null
  return (
    <div className="mt-5 flex items-center justify-end gap-1.5">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} className="rounded-md border border-border px-2.5 py-1.5 text-[0.78rem] font-semibold text-foreground disabled:opacity-40 hover:bg-secondary">Prev</button>
      <span className="px-2 text-[0.78rem] text-muted-foreground">Page {page} of {pages}</span>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === pages} className="rounded-md border border-border px-2.5 py-1.5 text-[0.78rem] font-semibold text-foreground disabled:opacity-40 hover:bg-secondary">Next</button>
    </div>
  )
}

/* ---- Export control (honest — no fake file generation) ---- */
export function ExportControl() {
  const [state, setState] = useState<'idle' | 'unavailable'>('idle')
  return (
    <div className="flex items-center gap-2">
      {(['CSV', 'JSON', 'PDF'] as const).map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => setState('unavailable')}
          className="rounded-md border border-border px-2.5 py-1.5 text-[0.78rem] font-semibold text-foreground hover:bg-secondary"
        >
          Export {f}
        </button>
      ))}
      {state === 'unavailable' && <span className="text-[0.72rem] text-muted-foreground">Export runs once a data provider is connected.</span>}
    </div>
  )
}
