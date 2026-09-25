import type { ReactNode, ButtonHTMLAttributes } from 'react'

/* ============================ Container ============================ */

type Width = 'full' | 'standard' | 'wide' | 'narrow'

const widthMap: Record<Width, string> = {
  full: 'w-full',
  wide: 'mx-auto w-full max-w-[1360px] px-5 sm:px-8',
  standard: 'mx-auto w-full max-w-[1200px] px-5 sm:px-8',
  narrow: 'mx-auto w-full max-w-[720px] px-5 sm:px-8',
}

export function Container({
  width = 'standard',
  className = '',
  children,
}: {
  width?: Width
  className?: string
  children: ReactNode
}) {
  return <div className={`${widthMap[width]} ${className}`}>{children}</div>
}

/* ============================ Section header ============================ */
/* Thin rule + centered editorial title, matching the reference rhythm. */

export function SectionHeader({
  title,
  href,
  align = 'center',
}: {
  title: string
  href?: string
  align?: 'center' | 'left'
}) {
  if (align === 'left') {
    return (
      <div className="mb-6 flex items-end justify-between border-b border-border pb-3">
        <h2 className="font-serif text-[1.6rem] font-semibold tracking-tight text-foreground sm:text-[1.9rem]">
          {title}
        </h2>
        {href && (
          <a
            href={href}
            className="shrink-0 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:text-foreground"
          >
            View all
          </a>
        )}
      </div>
    )
  }
  return (
    <div className="mb-8 flex items-center gap-5">
      <span className="h-px flex-1 bg-border" />
      <h2 className="text-center font-serif text-[1.7rem] font-semibold tracking-tight text-foreground sm:text-[2rem]">
        {title}
      </h2>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

/* ============================ Eyebrow / category kicker ============================ */

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`text-[0.72rem] font-bold uppercase tracking-[0.18em] text-seasonal ${className}`}
    >
      {children}
    </span>
  )
}

/* ============================ Badge (category / occasion label) ============================ */

export function Badge({
  children,
  tone = 'seasonal',
}: {
  children: ReactNode
  tone?: 'seasonal' | 'neutral' | 'solid'
}) {
  const tones = {
    seasonal: 'bg-seasonal text-white',
    solid: 'bg-foreground text-background',
    neutral: 'bg-white/90 text-foreground ring-1 ring-black/5 backdrop-blur',
  }
  return (
    <span
      className={`inline-flex items-center rounded-[3px] px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

/* ============================ Button ============================ */

type Variant = 'primary' | 'secondary' | 'outline' | 'text' | 'pinterest'
type Size = 'sm' | 'md' | 'lg'

const variantMap: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_88%,black)]',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_srgb,var(--secondary)_82%,black)]',
  outline: 'border border-foreground/25 text-foreground hover:border-foreground hover:bg-foreground/5',
  text: 'text-primary hover:text-foreground px-0',
  pinterest: 'bg-pinterest text-white hover:bg-pinterest-hover',
}

const sizeMap: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[0.8rem] gap-1.5',
  md: 'h-11 px-5 text-[0.85rem] gap-2',
  lg: 'h-12 px-6 text-[0.9rem] gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: {
  variant?: Variant
  size?: Size
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 ${variantMap[variant]} ${sizeMap[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
