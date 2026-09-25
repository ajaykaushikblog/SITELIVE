/* =========================================================================
   Central admin-path configuration (client side).

   The admin UI lives at a configurable single-segment path (default /admin).
   The real value is stored in the database and served by GET
   /api/site/admin-path; this module holds the resolved value so components can
   build correct links without hardcoding "/admin" everywhere.

   IMPORTANT: the custom path is NOT a security mechanism — every admin route
   and API stays behind authentication, sessions, roles and permissions.
   ========================================================================= */

export const DEFAULT_ADMIN_PATH = '/admin'

// Kept in sync with the backend RESERVED_ADMIN_PATHS and the public router.
export const RESERVED_ADMIN_PATHS = [
  'api',
  'article',
  'recipe',
  'diy',
  'author',
  'search',
  'collections',
  'assets',
  'uploads',
  'static',
  'health',
]

/** Resolved at runtime from the backend; defaults to /admin until loaded. */
let resolved = DEFAULT_ADMIN_PATH

export function setResolvedAdminPath(path: string) {
  resolved = normalizeKnown(path)
}

export function getAdminBase(): string {
  return resolved
}

function normalizeKnown(path: string): string {
  const p = (path || DEFAULT_ADMIN_PATH).trim().toLowerCase()
  return p.startsWith('/') ? p.replace(/\/+$/, '') || DEFAULT_ADMIN_PATH : `/${p}`
}

/** Rewrite an internal "/admin[/…]" href to the active admin base. Non-admin
    links are returned unchanged. */
export function toAdminHref(href: string): string {
  const base = getAdminBase()
  if (base === DEFAULT_ADMIN_PATH) return href
  if (href === DEFAULT_ADMIN_PATH) return base
  if (href.startsWith(DEFAULT_ADMIN_PATH + '/')) return base + href.slice(DEFAULT_ADMIN_PATH.length)
  return href
}

/** Client-side mirror of the backend validation, for instant form feedback.
    Returns an error string, or null when valid. */
export function validateAdminPath(input: string): string | null {
  const path = input.trim().toLowerCase()
  if (!path) return 'Admin path cannot be empty'
  if (!path.startsWith('/')) return 'Admin path must begin with /'
  if (/\s/.test(path)) return 'Admin path cannot contain spaces'
  if (path.includes('?')) return 'Admin path cannot contain a query string'
  if (path.includes('#')) return 'Admin path cannot contain a fragment'
  if (!/^\/[a-z0-9][a-z0-9-]*$/.test(path)) {
    return 'Use a single path segment with letters, numbers and hyphens, e.g. /control-panel'
  }
  if (RESERVED_ADMIN_PATHS.includes(path.slice(1))) return `"${path}" is reserved and cannot be used`
  return null
}
