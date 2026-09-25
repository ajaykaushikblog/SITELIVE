import { pinterestSaveUrl } from '../../lib/pinterest'
import { Pinterest } from '../ui/icons'

/* =========================================================================
   Reusable Pinterest Save button.

   - overlay: hover-reveal chip for images (cards, featured, gallery). Stays
     keyboard-focusable and is always visible on touch devices (no hover).
   - inline / solid: standalone CTA buttons.
   Always has an accessible label; opens the canonical URL pin composer.
   ========================================================================= */

type Variant = 'overlay' | 'solid' | 'inline'

export function PinSaveButton({
  url,
  image,
  description,
  variant = 'overlay',
  label = 'Save',
  className = '',
}: {
  url: string
  image: string
  description: string
  variant?: Variant
  label?: string
  className?: string
}) {
  const open = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(pinterestSaveUrl({ url, image, description }), '_blank', 'noopener,width=750,height=650')
  }

  if (variant === 'overlay') {
    return (
      <button
        onClick={open}
        aria-label="Save to Pinterest"
        className={`absolute right-2.5 top-2.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-pinterest px-3 py-1.5 text-[0.72rem] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-pinterest-hover focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 ${className}`}
      >
        <Pinterest width={14} height={14} />
        {label}
      </button>
    )
  }

  const solid = variant === 'solid'
  return (
    <button
      onClick={open}
      aria-label="Save to Pinterest"
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        solid
          ? 'h-11 bg-pinterest px-5 text-[0.85rem] text-white hover:bg-pinterest-hover'
          : 'h-11 border border-pinterest px-5 text-[0.85rem] text-pinterest hover:bg-pinterest/10'
      } ${className}`}
    >
      <Pinterest width={16} height={16} />
      Save to Pinterest
    </button>
  )
}
