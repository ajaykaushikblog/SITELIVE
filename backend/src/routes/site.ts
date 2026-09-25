import { Router } from 'express'
import { z } from 'zod'
import { asc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { activityLog, homepageSections, navItems, siteSettings } from '../db/schema.js'
import { asyncHandler } from '../lib/http.js'
import { badRequest } from '../lib/errors.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'

/* Central admin-path configuration. The admin UI lives at a configurable
   single-segment path (default /admin) stored in the settings store under
   'adminPath'. This is a convenience/obscurity setting only — it is NEVER the
   security boundary; every admin route and API stays behind auth + roles. */

export const ADMIN_PATH_KEY = 'adminPath'
export const DEFAULT_ADMIN_PATH = '/admin'

// Paths that would collide with public routes or the API. Kept in sync with
// the public router in src/App.tsx.
const RESERVED_ADMIN_PATHS = new Set([
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
])

/** Validate & normalise a custom admin path. Returns the normalised path or
    throws a 400 with a human-readable reason. */
export function normaliseAdminPath(input: unknown): string {
  if (typeof input !== 'string') throw badRequest('Admin path is required')
  const path = input.trim().toLowerCase()
  if (!path) throw badRequest('Admin path cannot be empty')
  if (!path.startsWith('/')) throw badRequest('Admin path must begin with /')
  if (/\s/.test(path)) throw badRequest('Admin path cannot contain spaces')
  if (path.includes('?')) throw badRequest('Admin path cannot contain a query string')
  if (path.includes('#')) throw badRequest('Admin path cannot contain a fragment')
  // Single URL segment of safe characters, e.g. /control-panel.
  if (!/^\/[a-z0-9][a-z0-9-]*$/.test(path)) {
    throw badRequest('Use a single path segment with letters, numbers and hyphens, e.g. /control-panel')
  }
  const segment = path.slice(1)
  if (RESERVED_ADMIN_PATHS.has(segment)) throw badRequest(`"/${segment}" is reserved and cannot be used`)
  return path
}

/* =========================================================================
   Global site configuration: navigation, footer, homepage layout and the
   key/value settings store (header, brand, SEO defaults, social, newsletter,
   content defaults, error pages…). Public GETs so the live site renders from
   the database; writes gated by area-specific permissions.
   ========================================================================= */

export const siteRouter = Router()

// ---- Navigation ----------------------------------------------------------

siteRouter.get(
  '/nav/:area',
  asyncHandler(async (req, res) => {
    const area = req.params.area as 'desktop' | 'mobile' | 'footer'
    const rows = await db
      .select()
      .from(navItems)
      .where(eq(navItems.area, area))
      .orderBy(asc(navItems.order))
    res.json({ items: rows })
  }),
)

const navItemSchema = z.object({
  label: z.string().min(1),
  destinationType: z.string().default('external'),
  ref: z.string().optional(),
  url: z.string().optional(),
  order: z.number().int().default(0),
  enabled: z.boolean().default(true),
  menu: z.record(z.unknown()).nullable().optional(),
})

// Replace an entire nav area atomically (matches the CMS "Save navigation" UX).
siteRouter.put(
  '/nav/:area',
  requireAuth,
  requirePermission('Manage navigation'),
  asyncHandler(async (req, res) => {
    const area = req.params.area as 'desktop' | 'mobile' | 'footer'
    const items = z.array(navItemSchema).parse(req.body.items)
    await db.transaction(async (tx) => {
      await tx.delete(navItems).where(eq(navItems.area, area))
      if (items.length) {
        await tx.insert(navItems).values(
          items.map((it, i) => ({
            area,
            label: it.label,
            destinationType: it.destinationType,
            ref: it.ref,
            url: it.url,
            order: it.order ?? i,
            enabled: it.enabled,
            menu: it.menu ?? null,
          })),
        )
      }
    })
    res.json({ ok: true, count: items.length })
  }),
)

// ---- Homepage layout -----------------------------------------------------

siteRouter.get(
  '/homepage',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(homepageSections).orderBy(asc(homepageSections.order))
    res.json({ sections: rows })
  }),
)

const homepageSectionSchema = z.object({
  name: z.string(),
  type: z.string(),
  heading: z.string().default(''),
  description: z.string().nullable().optional(),
  config: z.record(z.unknown()).default({}),
  order: z.number().int().default(0),
  enabled: z.boolean().default(true),
  status: z.string().default('active'),
})

siteRouter.put(
  '/homepage',
  requireAuth,
  requirePermission('Manage homepage'),
  asyncHandler(async (req, res) => {
    const sections = z.array(homepageSectionSchema).parse(req.body.sections)
    await db.transaction(async (tx) => {
      await tx.delete(homepageSections)
      if (sections.length) {
        await tx.insert(homepageSections).values(
          sections.map((s, i) => ({ ...s, description: s.description ?? null, order: s.order ?? i })),
        )
      }
    })
    res.json({ ok: true, count: sections.length })
  }),
)

// ---- Admin path ----------------------------------------------------------
// Public GET: the SPA needs to know which path opens the admin. Exposing it is
// safe — the path is not a secret and not the security mechanism.

siteRouter.get(
  '/admin-path',
  asyncHandler(async (_req, res) => {
    const row = await db.query.siteSettings.findFirst({ where: eq(siteSettings.key, ADMIN_PATH_KEY) })
    const path = (row?.value as { path?: string } | undefined)?.path ?? DEFAULT_ADMIN_PATH
    res.json({ path })
  }),
)

siteRouter.put(
  '/admin-path',
  requireAuth,
  requirePermission('Manage system'),
  asyncHandler(async (req, res) => {
    const path = normaliseAdminPath(req.body?.path)
    const value = { path }
    await db
      .insert(siteSettings)
      .values({ key: ADMIN_PATH_KEY, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } })
    await db.insert(activityLog).values({
      userName: req.user!.name,
      action: 'Changed admin URL',
      target: path,
      tone: 'edited',
    })
    res.json({ path })
  }),
)

// ---- Settings key/value store -------------------------------------------
// Footer, header, brand, SEO defaults, social, newsletter, etc. all live here
// under stable keys (e.g. 'footer', 'header', 'newsletter', 'seoDefaults').

siteRouter.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(siteSettings)
    const map: Record<string, unknown> = {}
    for (const r of rows) map[r.key] = r.value
    res.json({ settings: map })
  }),
)

siteRouter.get(
  '/settings/:key',
  asyncHandler(async (req, res) => {
    const row = await db.query.siteSettings.findFirst({ where: eq(siteSettings.key, req.params.key) })
    res.json({ key: req.params.key, value: row?.value ?? null })
  }),
)

// Map each settings key to the permission that guards it.
const SETTING_PERMISSION: Record<string, string> = {
  footer: 'Manage footer',
  newsletter: 'Manage newsletter',
  seoDefaults: 'Manage SEO',
}

siteRouter.put(
  '/settings/:key',
  requireAuth,
  asyncHandler(async (req, res, next) => {
    const perm = SETTING_PERMISSION[req.params.key] ?? 'Manage settings'
    return requirePermission(perm)(req, res, next)
  }),
  asyncHandler(async (req, res) => {
    const value = z.record(z.unknown()).parse(req.body.value ?? req.body)
    const [row] = await db
      .insert(siteSettings)
      .values({ key: req.params.key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } })
      .returning()
    res.json({ key: row.key, value: row.value })
  }),
)
