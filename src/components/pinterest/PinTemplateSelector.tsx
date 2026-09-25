import { pinTemplates, type PinTemplateId } from '../../lib/pinterest'
import { PinTemplateVisual } from './PinTemplateVisual'
import { Check } from '../ui/icons'

/* Reusable pin template selector with visual previews. */
export function PinTemplateSelector({
  value,
  onChange,
  title,
  image,
  className = '',
}: {
  value: PinTemplateId
  onChange: (id: PinTemplateId) => void
  title: string
  image: string
  className?: string
}) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${className}`}>
      {pinTemplates.map((t) => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-pressed={active}
            className={`group relative overflow-hidden rounded-lg border text-left transition-colors ${
              active ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-foreground/40'
            }`}
          >
            <PinTemplateVisual templateId={t.id} title={title} image={image} branding="M&M" />
            {active && (
              <span className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check width={14} height={14} />
              </span>
            )}
            <span className="block bg-card px-2.5 py-2 text-[0.78rem] font-semibold text-foreground">
              {t.label}
              <span className="block text-[0.68rem] font-normal text-muted-foreground">{t.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
