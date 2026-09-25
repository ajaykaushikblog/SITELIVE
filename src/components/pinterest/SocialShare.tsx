import { useState } from 'react'
import {
  pinterestSaveUrl,
  facebookShareUrl,
  xShareUrl,
  canonical,
} from '../../lib/pinterest'
import { Pinterest, Facebook, X, Link, Check, Share } from '../ui/icons'

/* =========================================================================
   Reusable SocialShare — Pinterest, Facebook, X, Copy Link and Native Share
   (where supported). Accessible labeled buttons; never covers content.
   ========================================================================= */

type CopyState = 'idle' | 'copied' | 'error'

export function CopyLinkButton({
  url,
  className = '',
  compact = false,
}: {
  url: string
  className?: string
  compact?: boolean
}) {
  const [state, setState] = useState<CopyState>('idle')
  const href = canonical(url)

  const copy = async () => {
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(href)
      else throw new Error('no clipboard')
      setState('copied')
    } catch {
      setState('error')
    }
    setTimeout(() => setState('idle'), 1800)
  }

  const text = state === 'copied' ? 'Link copied' : state === 'error' ? 'Unable to copy' : 'Copy link'
  const icon = state === 'copied' ? <Check width={16} height={16} /> : <Link width={16} height={16} />

  if (compact) {
    return (
      <button
        onClick={copy}
        aria-label={text}
        title={text}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:text-primary ${className}`}
      >
        {icon}
      </button>
    )
  }
  return (
    <button
      onClick={copy}
      aria-label={text}
      className={`inline-flex items-center gap-2 rounded-md border border-border px-3.5 py-2 text-[0.85rem] font-medium text-foreground transition-colors hover:border-primary hover:text-primary ${className}`}
    >
      {icon}
      {text}
    </button>
  )
}

const iconBtn =
  'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export function SocialShare({
  url,
  title,
  description = '',
  image = '',
  showLabel = true,
  className = '',
}: {
  url: string
  title: string
  description?: string
  image?: string
  showLabel?: boolean
  className?: string
}) {
  const openPopup = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    window.open(href, '_blank', 'noopener,width=750,height=650')
  }

  const nativeShare = async () => {
    try {
      await navigator.share?.({ title, text: description, url: canonical(url) })
    } catch {
      /* user dismissed — no-op */
    }
  }
  const hasNative = typeof navigator !== 'undefined' && 'share' in navigator

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="mr-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Share
        </span>
      )}
      <button
        onClick={openPopup(pinterestSaveUrl({ url, image, description: description || title }))}
        aria-label="Save to Pinterest"
        title="Save to Pinterest"
        className={`${iconBtn} !border-transparent !bg-pinterest !text-white hover:!bg-pinterest-hover`}
      >
        <Pinterest width={16} height={16} />
      </button>
      <a
        href={facebookShareUrl(url)}
        onClick={openPopup(facebookShareUrl(url))}
        aria-label="Share on Facebook"
        title="Share on Facebook"
        className={iconBtn}
      >
        <Facebook width={16} height={16} />
      </a>
      <a
        href={xShareUrl(url, title)}
        onClick={openPopup(xShareUrl(url, title))}
        aria-label="Share on X"
        title="Share on X"
        className={iconBtn}
      >
        <X width={15} height={15} />
      </a>
      <CopyLinkButton url={url} compact />
      {hasNative && (
        <button onClick={nativeShare} aria-label="Share…" title="Share…" className={`${iconBtn} sm:hidden`}>
          <Share width={15} height={15} />
        </button>
      )}
    </div>
  )
}
