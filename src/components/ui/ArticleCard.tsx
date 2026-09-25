import type { Article } from '../../lib/content'
import { Badge, Eyebrow } from './primitives'
import { PinSaveButton } from '../pinterest/PinSaveButton'

type Variant = 'standard' | 'large' | 'horizontal' | 'compact'

/* ratios per variant keep image cropping consistent site-wide */
const ratio: Record<Variant, string> = {
  standard: 'aspect-[5/4]',
  large: 'aspect-[4/5]',
  horizontal: 'aspect-[4/3]',
  compact: 'aspect-square',
}

export function ArticleCard({
  article,
  variant = 'standard',
  badgeTone = 'seasonal',
}: {
  article: Article
  variant?: Variant
  badgeTone?: 'seasonal' | 'solid' | 'neutral'
}) {
  if (variant === 'horizontal') {
    return (
      <a href={article.href} className="group flex gap-4">
        <div className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-md bg-secondary sm:w-40">
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1">
          <Eyebrow>{article.category}</Eyebrow>
          <h3 className="mt-1.5 font-serif text-[1.05rem] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {article.title}
          </h3>
          <p className="mt-1.5 text-[0.78rem] text-muted-foreground">{article.date}</p>
        </div>
      </a>
    )
  }

  const titleSize =
    variant === 'large'
      ? 'text-[1.25rem] sm:text-[1.4rem]'
      : variant === 'compact'
        ? 'text-[0.98rem]'
        : 'text-[1.08rem]'

  return (
    <a href={article.href} className="group flex flex-col">
      <div className={`relative ${ratio[variant]} overflow-hidden rounded-lg bg-secondary`}>
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <PinSaveButton url={article.href} image={article.image} description={article.title} />
        <div className="absolute bottom-0 left-0 p-2.5">
          <Badge tone={badgeTone}>{article.category}</Badge>
        </div>
      </div>
      <h3
        className={`mt-3.5 text-center font-serif ${titleSize} font-semibold leading-snug text-foreground transition-colors group-hover:text-primary`}
      >
        {article.title}
      </h3>
      {article.excerpt && variant === 'large' && (
        <p className="mt-2 text-center text-[0.9rem] leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
      )}
      <p className="mt-2 text-center text-[0.75rem] uppercase tracking-wide text-muted-foreground">
        {article.author.name} &middot; {article.date}
      </p>
    </a>
  )
}
