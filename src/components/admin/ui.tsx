import { useEffect, type ReactNode } from 'react'

/* =========================================================================
   Reusable admin UI primitives.

   Every CMS screen composes these — page headers, stat cards, status badges,
   toolbars, form fields, tabs, cards, empty states and confirm bars — so new
   admin pages stay visually consistent and cheap to add. Editorial dashboard
   aesthetic (serif display + calm neutrals), deliberately not WordPress.
   ========================================================================= */

/** Sets an admin document title and forces noindex, nofollow while mounted. */
export function useAdminSeo(title: string) {
  useEffect(() => {
    const prev = document.title
    document.title = `${title} — Marigold & Maple CMS`
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => {
      document.title = prev
      robots.remove()
    }
  }, [title])
}

export function AdminPageHeader({
  breadcrumb,
  title,
  description,
  actions,
}: {
  breadcrumb: string[]
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[0.76rem] text-muted-foreground">
        {breadcrumb.map((b, i) => (
          <span key={i} className={i === breadcrumb.length - 1 ? 'text-foreground' : ''}>
            {b}
            {i < breadcrumb.length - 1 && <span className="mx-1.5 text-border">/</span>}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[1.9rem] font-semibold tracking-tight text-foreground sm:text-[2.3rem]">
            {title}
          </h1>
          {description && <p className="mt-1 max-w-2xl text-[0.9rem] text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string | number
  hint?: string
  tone?: 'default' | 'muted'
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p
        className={`mt-2 font-serif text-[1.85rem] font-semibold leading-none ${
          tone === 'muted' ? 'text-muted-foreground' : 'text-foreground'
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1.5 text-[0.72rem] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function Badge({ label, tone = 'bg-secondary text-secondary-foreground' }: { label: string; tone?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${tone}`}>
      {label}
    </span>
  )
}

export function Panel({
  title,
  actions,
  children,
  className = '',
}: {
  title?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-xl border border-border bg-card ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          {title && <h2 className="font-serif text-[1.2rem] font-semibold text-foreground">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}

/* ---- Form controls (shared with every editor) ---- */
export function Field({
  label,
  value,
  placeholder,
  hint,
  mono,
  type = 'text',
  onChange,
}: {
  label: string
  value?: string
  placeholder?: string
  hint?: string
  mono?: boolean
  type?: string
  onChange?: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40 ${
          mono ? 'font-mono' : ''
        }`}
      />
      {hint && <span className="mt-1 block text-[0.7rem] text-muted-foreground">{hint}</span>}
    </label>
  )
}

export function Textarea({
  label,
  value,
  placeholder,
  rows = 4,
  mono,
  hint,
}: {
  label: string
  value?: string
  placeholder?: string
  rows?: number
  mono?: boolean
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <textarea
        rows={rows}
        defaultValue={value}
        placeholder={placeholder}
        className={`w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40 ${
          mono ? 'font-mono' : ''
        }`}
      />
      {hint && <span className="mt-1 block text-[0.7rem] text-muted-foreground">{hint}</span>}
    </label>
  )
}

export function Select({
  label,
  value,
  options,
  onChange,
  capitalize,
}: {
  label?: string
  value: string
  options: { value: string; label: string }[] | string[]
  onChange?: (v: string) => void
  capitalize?: boolean
}) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground outline-none focus:border-foreground/40 ${
          capitalize ? 'capitalize' : ''
        }`}
      >
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`-mb-px border-b-2 px-3.5 py-2.5 text-[0.82rem] font-medium transition-colors ${
            active === t.id
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-secondary/30 px-6 py-14 text-center">
      <p className="font-serif text-[1.2rem] font-semibold text-foreground">{title}</p>
      {hint && <p className="mx-auto mt-1.5 max-w-sm text-[0.85rem] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function ConceptNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-[0.78rem] leading-relaxed text-muted-foreground">
      {children}
    </div>
  )
}

/** Sticky bulk-action / confirmation bar for tables. */
export function ConfirmBar({
  count,
  children,
  onClear,
}: {
  count: number
  children: ReactNode
  onClear: () => void
}) {
  if (count === 0) return null
  return (
    <div className="sticky bottom-4 z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-foreground px-4 py-3 text-background shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]">
      <span className="text-[0.85rem] font-medium">
        {count} {count === 1 ? 'item' : 'items'} selected
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <button
          type="button"
          onClick={onClear}
          className="rounded-md px-2.5 py-1.5 text-[0.8rem] text-background/70 hover:text-background"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

/** Small pill button for inline table/toolbar actions. */
export function PillButton({
  children,
  onClick,
  tone = 'default',
  active,
}: {
  children: ReactNode
  onClick?: () => void
  tone?: 'default' | 'danger' | 'invert'
  active?: boolean
}) {
  const tones: Record<string, string> = {
    default: `border-border bg-card text-foreground hover:bg-secondary ${active ? 'border-foreground/40 bg-secondary' : ''}`,
    danger: 'border-error/30 bg-card text-error hover:bg-error/10',
    invert: 'border-transparent bg-background/15 text-background hover:bg-background/25',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[0.78rem] font-semibold transition-colors ${tones[tone]}`}
    >
      {children}
    </button>
  )
}
