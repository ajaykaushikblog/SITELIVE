import { useEffect, useRef, useState } from 'react'
import { apiConfigured } from './client'

/* =========================================================================
   useApiData — the bridge between the live backend and the bundled demo data.

   Give it an async fetcher (hits the API) and a static fallback. When no API
   is configured, or the request fails, it returns the fallback so the UI is
   never empty and the existing prototype behaviour is preserved. When a real
   backend IS connected, the same components render live database content with
   no further changes.
   ========================================================================= */

export type ApiDataState<T> = {
  data: T
  loading: boolean
  source: 'api' | 'fallback'
  error: string | null
  reload: () => void
}

export function useApiData<T>(fetcher: () => Promise<T>, fallback: T, deps: unknown[] = []): ApiDataState<T> {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState<boolean>(apiConfigured)
  const [source, setSource] = useState<'api' | 'fallback'>('fallback')
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    if (!apiConfigured) {
      setData(fallback)
      setSource('fallback')
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    fetcherRef
      .current()
      .then((result) => {
        if (!active) return
        setData(result)
        setSource('api')
        setError(null)
      })
      .catch((err: unknown) => {
        if (!active) return
        setData(fallback)
        setSource('fallback')
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps])

  return { data, loading, source, error, reload: () => setNonce((n) => n + 1) }
}
