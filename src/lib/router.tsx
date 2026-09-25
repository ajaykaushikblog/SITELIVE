import { useCallback, useSyncExternalStore } from 'react'
import { toAdminHref } from './adminPath'

/* Minimal history-based router — enough to view multiple templates in the
   preview without pulling in a routing dependency. Internal <a href="/..">
   clicks are intercepted globally so existing links "just work". */

function subscribe(cb: () => void) {
  window.addEventListener('popstate', cb)
  window.addEventListener('app:navigate', cb)
  return () => {
    window.removeEventListener('popstate', cb)
    window.removeEventListener('app:navigate', cb)
  }
}

export function navigate(to: string, opts: { replace?: boolean; scroll?: boolean } = {}) {
  const current = window.location.pathname + window.location.search
  if (to === current) return
  if (opts.replace) window.history.replaceState({}, '', to)
  else window.history.pushState({}, '', to)
  window.dispatchEvent(new Event('app:navigate'))
  if (opts.scroll !== false) window.scrollTo({ top: 0 })
}

export function usePathname() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => '/',
  )
}

/** Reactive access to the current query string (e.g. "?q=christmas"). */
export function useSearchString() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => '',
  )
}

/** Attach once: intercept same-origin anchor clicks for SPA navigation. */
export function useLinkInterceptor() {
  const handler = useCallback((e: MouseEvent) => {
    const a = (e.target as HTMLElement)?.closest('a')
    if (!a) return
    const href = a.getAttribute('href')
    if (!href || !href.startsWith('/') || a.target === '_blank' || e.metaKey || e.ctrlKey) return
    e.preventDefault()
    // Rewrite internal /admin links to the active (possibly custom) admin base
    // so links keep working without hardcoding the path in every component.
    navigate(toAdminHref(href))
  }, [])
  return handler
}
