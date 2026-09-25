import { canonical, type PinTemplateId } from '../../lib/pinterest'
import { PinTemplateVisual } from './PinTemplateVisual'
import { Pinterest } from '../ui/icons'

/* CMS "Pinterest Preview" — how a pin appears when saved. Dynamic across all
   taxonomy (Christmas, Halloween, Weddings, Recipes, DIY, …). */
export function PinterestPreview({
  title,
  description,
  image,
  template,
  destination,
  className = '',
}: {
  title: string
  description: string
  image: string
  template: PinTemplateId
  destination: string
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>
      <div className="mb-3 flex items-center gap-2">
        <Pinterest width={16} height={16} className="text-pinterest" />
        <h3 className="text-[0.82rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Pinterest Preview
        </h3>
      </div>
      <div className="mx-auto max-w-[240px]">
        <div className="relative">
          <PinTemplateVisual templateId={template} title={title} supporting={description} image={image} />
          <span className="pointer-events-none absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-pinterest px-3 py-1.5 text-[0.72rem] font-semibold text-white shadow">
            <Pinterest width={13} height={13} /> Save
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-[0.92rem] font-semibold leading-snug text-foreground">
          {title}
        </p>
        <p className="mt-1 line-clamp-2 text-[0.8rem] text-muted-foreground">{description}</p>
        <p className="mt-2 truncate text-[0.72rem] text-muted-foreground">
          {canonical(destination).replace(/^https?:\/\//, '')}
        </p>
      </div>
    </div>
  )
}
