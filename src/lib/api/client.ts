/* =========================================================================
   Frontend API client.

   Talks to the real backend (backend/) over REST with credentialed requests
   so the session cookie flows. Base URL comes from VITE_API_BASE_URL; when it
   is unset OR the API is unreachable, callers fall back to the bundled static
   demo data via `useApiData`, so the prototype keeps working exactly as before
   until a live backend is connected.
   ========================================================================= */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

/** Whether an API base URL is configured at all. */
export const apiConfigured = BASE_URL.length > 0

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiConfigured) throw new ApiError(0, 'API not configured (VITE_API_BASE_URL unset)')
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json().catch(() => null) : null
  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? res.statusText, body?.details)
  }
  return body as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data == null ? undefined : JSON.stringify(data) }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: data == null ? undefined : JSON.stringify(data) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  /** Uploads a file via multipart/form-data (does NOT set Content-Type — the browser adds the boundary). */
  upload: async <T>(path: string, form: FormData) => {
    if (!apiConfigured) throw new ApiError(0, 'API not configured')
    const res = await fetch(`${BASE_URL}${path}`, { method: 'POST', credentials: 'include', body: form })
    const body = await res.json().catch(() => null)
    if (!res.ok) throw new ApiError(res.status, body?.error ?? res.statusText, body?.details)
    return body as T
  },
}

/** Cheap liveness probe used to decide whether to use the API or static fallback. */
export async function isApiHealthy(): Promise<boolean> {
  if (!apiConfigured) return false
  try {
    const res = await fetch(`${BASE_URL}/api/health`, { credentials: 'include' })
    return res.ok
  } catch {
    return false
  }
}
