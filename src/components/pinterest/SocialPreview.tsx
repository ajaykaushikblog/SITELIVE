import { canonical } from '../../lib/pinterest'

/* CMS "Social Preview" — Open Graph / Twitter card. Deliberately separate from
   the Pinterest metadata: OG images are landscape (1.91:1), not the 2:3 pin. */
export function SocialPreview({
  title,
  description,
  image,
  destination,
  siteName = 'Marigold & Maple',
  className = '',
}: {
  title: string
  description: string
  image: string
  destination: string
  siteName?: string
  className?: string
}) {
  const host = canonical(destination).replace(/^https?:\/\//, '').split('/')[0]
  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>
      <h3 className="mb-3 text-[0.82rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        Social Preview
      </h3>
      <div className="mx-auto max-w-[420px] overflow-hidden rounded-lg border border-border">
        <div className="relative aspect-[1.91/1] w-full bg-secondary">
          <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="bg-muted/40 px-4 py-3">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">{host}</p>
          <p className="mt-1 line-clamp-1 text-[0.95rem] font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 line-clamp-2 text-[0.8rem] text-muted-foreground">{description}</p>
          <p className="mt-1 text-[0.7rem] text-muted-foreground">{siteName}</p>
        </div>
      </div>
    </div>
  )
}
