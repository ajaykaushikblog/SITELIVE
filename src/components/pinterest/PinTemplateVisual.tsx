import { getTemplate, PIN_SPEC, type PinTemplateId } from '../../lib/pinterest'

/* =========================================================================
   PinTemplateVisual — renders a vertical 2:3 (1000×1500) pin composition.
   Consistent typography, safe margins, strong hierarchy, optional branding.
   Production can later export this exact composition as an image asset.
   ========================================================================= */

export function PinTemplateVisual({
  templateId,
  title,
  supporting,
  image,
  branding = 'MARIGOLD & MAPLE',
  className = '',
}: {
  templateId: PinTemplateId
  title: string
  supporting?: string
  image: string
  branding?: string
  className?: string
}) {
  const t = getTemplate(templateId)

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-secondary shadow-sm ${className}`}
      style={{ aspectRatio: PIN_SPEC.ratio, containerType: 'inline-size' }}
      role="img"
      aria-label={`${t.label} Pinterest pin: ${title}`}
    >
      <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />

      {/* readability scrim, positioned per template layout */}
      <div
        className={`absolute inset-0 ${
          t.layout === 'center'
            ? 'bg-gradient-to-b from-black/45 via-black/10 to-black/55'
            : t.layout === 'split'
              ? 'bg-gradient-to-r from-black/70 via-black/20 to-transparent'
              : 'bg-gradient-to-t from-black/70 via-black/10 to-transparent'
        }`}
      />

      {/* top brand tag */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-center p-[6%]">
        <span
          className="rounded-full px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white"
          style={{ backgroundColor: t.accent }}
        >
          {branding}
        </span>
      </div>

      {/* title block — safe margins ~8% */}
      <div
        className={`absolute inset-x-0 flex flex-col px-[8%] ${
          t.layout === 'center'
            ? 'top-1/2 -translate-y-1/2 items-center text-center'
            : t.layout === 'split'
              ? 'bottom-[8%] items-start text-left'
              : 'bottom-[8%] items-center text-center'
        }`}
      >
        {t.layout !== 'center' && (
          <span className="mb-2 h-1 w-10 rounded-full" style={{ backgroundColor: t.accent }} />
        )}
        <h3
          className="font-serif font-semibold leading-[1.05] text-white drop-shadow-sm"
          style={{ fontSize: 'clamp(1.1rem, 5.5cqw, 2.4rem)' }}
        >
          {title}
        </h3>
        {supporting && (
          <p className="mt-2 max-w-[92%] text-[0.85rem] leading-snug text-white/85 drop-shadow-sm">
            {supporting}
          </p>
        )}
      </div>
    </div>
  )
}
