import { validateLength, validationMeta, type ValidationState } from '../../../lib/admin/seo'
import { canonical } from '../../../lib/pinterest'

/* Google-style SERP snippet preview — visual representation only. */
export function GooglePreview({
  title,
  description,
  url,
}: {
  title: string
  description: string
  url: string
}) {
  const full = canonical(url)
  const host = full.replace(/^https?:\/\//, '').split('/')[0]
  const crumbs = full.replace(/^https?:\/\//, '').split('/').filter(Boolean)
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-[0.82rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        Google Preview
      </h3>
      <div className="max-w-[520px]">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-[0.7rem] font-bold text-foreground">
            M
          </span>
          <div className="leading-tight">
            <p className="text-[0.78rem] text-foreground">Marigold &amp; Maple</p>
            <p className="text-[0.7rem] text-muted-foreground">{crumbs.join(' › ') || host}</p>
          </div>
        </div>
        <p className="mt-1.5 line-clamp-1 text-[1.05rem] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
          {title || 'Untitled page'}
        </p>
        <p className="mt-1 line-clamp-2 text-[0.82rem] leading-relaxed text-muted-foreground">
          {description || 'No meta description set. Search engines may generate one from page content.'}
        </p>
      </div>
    </div>
  )
}

/* Character-count validation meter reused by title & meta fields. */
export function ValidationMeter({
  value,
  range,
  label,
}: {
  value: string
  range: { min: number; max: number }
  label: string
}) {
  const state: ValidationState = validateLength(value, range)
  const meta = validationMeta[state]
  const len = value.trim().length
  const pct = Math.min(100, (len / range.max) * 100)
  return (
    <div className="mt-1.5">
      <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full transition-all ${meta.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-[0.7rem]">
        <span className={`font-semibold ${meta.tone}`}>
          {meta.label} · {label}
        </span>
        <span className="text-muted-foreground">
          {len} / {range.min}–{range.max}
        </span>
      </div>
    </div>
  )
}
