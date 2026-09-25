import type { ReactNode } from 'react'
import {
  adFormats,
  getSlot,
  affiliateDisclosure,
  type AdFormat,
  type AdSlotConfig,
  type AdDevice,
  type AffiliateProduct,
  type SponsoredItem,
} from '../../lib/ads'
import { Button } from '../ui/primitives'
import { ArrowRight } from '../ui/icons'

/* =========================================================================
   AdSlot — the single reusable renderer every ad component builds on.

   Pass a registered `slotId` (preferred, config-driven) or an ad-hoc
   `format`. Reserves dimensions to prevent layout shift, shows an
   "Advertisement" label, respects device targeting + active state, and can
   host real ad markup, custom, affiliate, or sponsored content later.
   ========================================================================= */

const deviceVisibility: Record<AdDevice, string> = {
  all: 'flex',
  desktop: 'hidden lg:flex',
  mobile: 'flex lg:hidden',
}

export function AdSlot({
  slotId,
  format,
  device,
  label = 'Advertisement',
  active = true,
  className = '',
  children,
}: {
  slotId?: string
  format?: AdFormat
  device?: AdDevice
  label?: string
  active?: boolean
  className?: string
  /** Optional custom / affiliate / sponsored content rendered in-slot. */
  children?: ReactNode
}) {
  const config: AdSlotConfig | undefined = slotId ? getSlot(slotId) : undefined
  const fmt: AdFormat = format ?? config?.format ?? 'rectangle'
  const dev: AdDevice = device ?? config?.device ?? 'all'
  const isActive = active && (config ? config.status === 'active' : true)
  const f = adFormats[fmt]

  if (!isActive) return null

  return (
    <div
      className={`${deviceVisibility[dev]} w-full flex-col items-center ${className}`}
      data-ad-slot={config?.id ?? fmt}
    >
      <span className="mb-1.5 text-[0.58rem] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
        {config?.label ?? label}
      </span>
      {children ? (
        <div className="w-full" style={{ maxWidth: f.w }}>
          {children}
        </div>
      ) : (
        <div
          className="flex w-full flex-col items-center justify-center rounded-md border border-dashed border-border bg-secondary/50 text-muted-foreground"
          style={{ maxWidth: f.w, aspectRatio: `${f.w} / ${f.h}` }}
          aria-label={config?.label ?? label}
        >
          <span className="text-[0.72rem] font-medium">{f.label}</span>
        </div>
      )}
    </div>
  )
}

/* ============================ Named placements ============================ */
/* Thin, semantic wrappers so pages read intent, not raw formats. Each pulls
   its defaults from the slot registry; spacing is the component's job. */

export const TopBannerAd = ({ slotId = 'header_top', className = '' }: SlotProps) => (
  <AdSlot slotId={slotId} className={`py-4 ${className}`} />
)

export const InContentAd = ({ slotId = 'article_mid', className = '' }: SlotProps) => (
  <AdSlot slotId={slotId} className={`my-8 ${className}`} />
)

export const MidArticleAd = ({ slotId = 'article_mid', className = '' }: SlotProps) => (
  <AdSlot slotId={slotId} className={`my-10 ${className}`} />
)

export const BottomArticleAd = ({ slotId = 'article_bottom', className = '' }: SlotProps) => (
  <AdSlot slotId={slotId} className={`my-12 ${className}`} />
)

export const SidebarAd = ({ slotId = 'sidebar_sticky', className = '' }: SlotProps) => (
  <AdSlot slotId={slotId} className={className} />
)

/** Desktop-only sticky rail unit that stops before the footer (sticky top). */
export const StickySidebarAd = ({ slotId = 'sidebar_sticky', className = '' }: SlotProps) => (
  <div className={`hidden lg:block ${className}`}>
    <div className="sticky top-24">
      <AdSlot slotId={slotId} device="desktop" />
    </div>
  </div>
)

/** Full-width, reserved-height mobile unit. Never used on desktop. */
export const MobileInlineAd = ({ slotId = 'mobile_inline_1', className = '' }: SlotProps) => (
  <AdSlot slotId={slotId} device="mobile" className={`my-8 ${className}`} />
)

export const HomepageAd = ({ slotId = 'homepage_mid', className = '' }: SlotProps) => (
  <AdSlot slotId={slotId} className={`my-4 ${className}`} />
)

export const CategoryPageAd = ({ slotId = 'category_top', className = '' }: SlotProps) => (
  <AdSlot slotId={slotId} className={`my-6 ${className}`} />
)

export const RelatedContentAd = ({ slotId = 'related_content', className = '' }: SlotProps) => (
  <AdSlot slotId={slotId} className={`my-12 ${className}`} />
)

type SlotProps = { slotId?: string; className?: string }

/* ============================ Affiliate block ============================ */

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[0.78rem] text-warning" aria-label={`${rating} out of 5`}>
      <span aria-hidden>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
      <span className="text-muted-foreground">{rating.toFixed(1)}</span>
    </span>
  )
}

export function AffiliateProductBlock({
  title = 'Shop This Look',
  products,
  className = '',
}: {
  title?: string
  products: AffiliateProduct[]
  className?: string
}) {
  return (
    <aside
      className={`rounded-xl border border-primary/25 bg-seasonal-soft/50 p-5 sm:p-6 ${className}`}
      aria-label="Affiliate product recommendations"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="inline-flex items-center rounded-[3px] bg-primary px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-primary-foreground">
          Shop
        </span>
        <h3 className="font-serif text-[1.35rem] font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {products.map((p) => (
          <a
            key={p.id}
            href={p.href}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-[0_16px_36px_-24px_rgba(38,32,27,0.5)]"
          >
            <div className="aspect-square overflow-hidden bg-secondary">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-3.5">
              {p.merchant && (
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {p.merchant}
                </span>
              )}
              <p className="mt-1 text-[0.92rem] font-semibold leading-snug text-foreground">{p.name}</p>
              {p.description && (
                <p className="mt-1 line-clamp-2 text-[0.8rem] text-muted-foreground">{p.description}</p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[1rem] font-semibold text-primary">{p.price}</span>
                {p.rating != null && <Stars rating={p.rating} />}
              </div>
              <span className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-md border border-foreground/25 py-2 text-[0.8rem] font-semibold text-foreground transition-colors group-hover:border-foreground group-hover:bg-foreground/5">
                View Product <ArrowRight width={14} height={14} />
              </span>
            </div>
          </a>
        ))}
      </div>
      <p className="mt-4 text-[0.72rem] italic leading-relaxed text-muted-foreground">
        {affiliateDisclosure}
      </p>
    </aside>
  )
}

/* ============================ Sponsored block ============================ */

export function SponsoredContentBlock({
  item,
  className = '',
}: {
  item: SponsoredItem
  className?: string
}) {
  return (
    <aside
      className={`overflow-hidden rounded-xl border border-border bg-card ${className}`}
      aria-label={`Sponsored content by ${item.brand}`}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:w-[44%]">
          <div className="aspect-[16/10] h-full w-full overflow-hidden bg-secondary sm:aspect-auto">
            <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
          </div>
          <span className="absolute left-3 top-3 inline-flex items-center rounded-[3px] bg-foreground/85 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-background backdrop-blur">
            Sponsored
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center p-5 sm:p-7">
          <div className="flex items-center gap-2">
            {item.logo ? (
              <img src={item.logo} alt={item.brand} className="h-6 w-auto" />
            ) : (
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {item.brand}
              </span>
            )}
          </div>
          <h3 className="mt-2 font-serif text-[1.4rem] font-semibold leading-tight text-foreground sm:text-[1.7rem]">
            {item.title}
          </h3>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-muted-foreground">{item.description}</p>
          <div className="mt-4">
            <a href={item.href} target="_blank" rel="sponsored noopener">
              <Button variant="outline" size="md">
                {item.cta} <ArrowRight width={15} height={15} />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
