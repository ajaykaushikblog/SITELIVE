import { useState, type ReactNode } from 'react'
import { Warning, Search } from '../../ui/icons'
import { StatCard, Badge } from '../ui'
import { PLACEHOLDER_NOTE, dashboardMetrics, type Metric } from '../../../lib/admin/monetization'

/* =========================================================================
   Phase 17 — shared monetization UI.

   A single horizontal sub-navigation, an honest "example data" banner, a
   metric grid and small filter/search primitives are reused across every
   monetization screen so the whole surface stays consistent and config-driven.
   ========================================================================= */

export type MonSection =
  | 'dashboard'
  | 'ads'
  | 'networks'
  | 'placements'
  | 'products'
  | 'links'
  | 'affiliate-networks'
  | 'product-collections'
  | 'sponsored'
  | 'rules'
  | 'link-health'
  | 'expired'
  | 'revenue'
  | 'ad-performance'
  | 'affiliate-performance'
  | 'sponsored-performance'
  | 'settings'

type NavGroup = { label: string; items: { id: MonSection; label: string; href: string }[] }

const path = (s: MonSection) => (s === 'dashboard' ? '/admin/monetization' : `/admin/monetization/${s}`)

export const monNav: NavGroup[] = [
  { label: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', href: path('dashboard') }] },
  {
    label: 'Advertising',
    items: [
      { id: 'ads', label: 'Advertisements', href: path('ads') },
      { id: 'networks', label: 'Ad Networks', href: path('networks') },
      { id: 'placements', label: 'Placements', href: path('placements') },
    ],
  },
  {
    label: 'Affiliate',
    items: [
      { id: 'products', label: 'Products', href: path('products') },
      { id: 'links', label: 'Links', href: path('links') },
      { id: 'affiliate-networks', label: 'Networks', href: path('affiliate-networks') },
      { id: 'product-collections', label: 'Collections', href: path('product-collections') },
    ],
  },
  {
    label: 'Sponsored',
    items: [{ id: 'sponsored', label: 'Campaigns', href: path('sponsored') }],
  },
  {
    label: 'Automation',
    items: [
      { id: 'rules', label: 'Rules', href: path('rules') },
      { id: 'link-health', label: 'Link Health', href: path('link-health') },
      { id: 'expired', label: 'Expired', href: path('expired') },
    ],
  },
  {
    label: 'Reports',
    items: [
      { id: 'revenue', label: 'Revenue', href: path('revenue') },
      { id: 'ad-performance', label: 'Ads', href: path('ad-performance') },
      { id: 'affiliate-performance', label: 'Affiliate', href: path('affiliate-performance') },
      { id: 'sponsored-performance', label: 'Sponsored', href: path('sponsored-performance') },
    ],
  },
  { label: 'Config', items: [{ id: 'settings', label: 'Settings', href: path('settings') }] },
]

export function MonSubnav({ active }: { active: MonSection }) {
  return (
    <nav className="mb-8 flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-border pb-3">
      {monNav.flatMap((g) => g.items).map((item) => {
        const on = item.id === active
        return (
          <a
            key={item.id}
            href={item.href}
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

/** Honest disclosure that no provider is connected — never hidden in tiny text. */
export function ExampleDataBanner({ children }: { children?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-[0.8rem] leading-relaxed text-foreground">
      <Warning width={16} height={16} className="mt-0.5 shrink-0 text-warning" />
      <p>
        <span className="font-semibold">Example data. </span>
        {children ?? PLACEHOLDER_NOTE}
      </p>
    </div>
  )
}

/** Dashboard metric grid — real figures render as honest "—" placeholders. */
export function MetricGrid({ metrics = dashboardMetrics }: { metrics?: Metric[] }) {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <StatCard key={m.key} label={m.label} value={m.example} hint={m.hint} tone="muted" />
      ))}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative flex min-w-[200px] flex-1 items-center">
      <Search width={15} height={15} className="absolute left-3 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-[0.83rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40"
      />
    </div>
  )
}

/** Status pill that pairs a dot with a label (never colour alone — a11y). */
export function StatusPill({ label, tone }: { label: string; tone: string }) {
  return <Badge label={label} tone={tone} />
}

/** Small inline filter <select>. */
export function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-border bg-background px-3 py-2 text-[0.82rem] text-foreground outline-none focus:border-foreground/40"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/** Reusable pagination footer. */
export function useableList<T>(items: T[], perPage: number) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(items.length / perPage))
  const clamped = Math.min(page, pages)
  const slice = items.slice((clamped - 1) * perPage, clamped * perPage)
  return { slice, page: clamped, pages, setPage }
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null
  return (
    <div className="mt-5 flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="rounded-md border border-border px-2.5 py-1.5 text-[0.78rem] font-semibold text-foreground disabled:opacity-40 hover:bg-secondary"
      >
        Prev
      </button>
      <span className="px-2 text-[0.78rem] text-muted-foreground">
        Page {page} of {pages}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        className="rounded-md border border-border px-2.5 py-1.5 text-[0.78rem] font-semibold text-foreground disabled:opacity-40 hover:bg-secondary"
      >
        Next
      </button>
    </div>
  )
}

/** Currency formatter for product prices (example prices, real revenue is "—"). */
export function money(amount: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `$${amount}`
  }
}
