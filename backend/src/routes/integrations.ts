import { Router } from 'express'
import { z } from 'zod'
import { asc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { activityLog, siteIntegrations } from '../db/schema.js'
import { asyncHandler } from '../lib/http.js'
import { notFound } from '../lib/errors.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'

/* =========================================================================
   Verification & Custom Code — site integrations.

   Stores verification codes and tracking snippets (Google Analytics, AdSense,
   Search Console, Tag Manager, Bing, Pinterest, Meta, custom code) that the
   site owner pastes in the CMS. The values are executable deployment code and
   are treated as TRUSTED administrator input, so:

     • Every route below the admin router requires authentication AND the
       'Manage integrations' permission — enforced here on the server.
     • Create / update / enable / disable / delete are recorded in the
       activity log with the acting user's name (audit trail).
     • The full codes are NEVER exposed on a public route. The only public
       surface is GET /render, which emits ONLY the concatenated snippets of
       ENABLED integrations, grouped by placement, for the page renderer.
   ========================================================================= */

const KNOWN_SERVICES = [
  'google-analytics',
  'google-adsense',
  'google-search-console',
  'google-tag-manager',
  'bing-webmaster',
  'pinterest',
  'meta',
  'custom',
] as const

const upsertSchema = z.object({
  service: z.enum(KNOWN_SERVICES),
  name: z.string().default(''),
  enabled: z.boolean().default(false),
  headCode: z.string().default(''),
  bodyStartCode: z.string().default(''),
  bodyEndCode: z.string().default(''),
  settings: z.record(z.unknown()).default({}),
})

// ---- Admin CRUD (authenticated + permission-gated) ----------------------

export const adminIntegrationsRouter = Router()

adminIntegrationsRouter.use(requireAuth, requirePermission('Manage integrations'))

adminIntegrationsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(siteIntegrations).orderBy(asc(siteIntegrations.service))
    res.json({ integrations: rows })
  }),
)

adminIntegrationsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const row = await db.query.siteIntegrations.findFirst({
      where: eq(siteIntegrations.id, req.params.id),
    })
    if (!row) throw notFound('Integration not found')
    res.json({ integration: row })
  }),
)

adminIntegrationsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = upsertSchema.parse(req.body)
    const [row] = await db
      .insert(siteIntegrations)
      .values({ ...data, updatedBy: req.user!.name, updatedAt: new Date() })
      .returning()
    await db.insert(activityLog).values({
      userName: req.user!.name,
      action: data.enabled ? 'Enabled integration' : 'Created integration',
      target: row.name || row.service,
      tone: 'edited',
    })
    res.status(201).json({ integration: row })
  }),
)

adminIntegrationsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await db.query.siteIntegrations.findFirst({
      where: eq(siteIntegrations.id, req.params.id),
    })
    if (!existing) throw notFound('Integration not found')
    const data = upsertSchema.parse(req.body)
    const [row] = await db
      .update(siteIntegrations)
      .set({ ...data, updatedBy: req.user!.name, updatedAt: new Date() })
      .where(eq(siteIntegrations.id, req.params.id))
      .returning()
    // Distinguish enable/disable transitions in the audit trail.
    const action =
      existing.enabled !== data.enabled
        ? data.enabled
          ? 'Enabled integration'
          : 'Disabled integration'
        : 'Updated integration'
    await db.insert(activityLog).values({
      userName: req.user!.name,
      action,
      target: row.name || row.service,
      tone: 'edited',
    })
    res.json({ integration: row })
  }),
)

adminIntegrationsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const [row] = await db
      .delete(siteIntegrations)
      .where(eq(siteIntegrations.id, req.params.id))
      .returning()
    if (!row) throw notFound('Integration not found')
    await db.insert(activityLog).values({
      userName: req.user!.name,
      action: 'Deleted integration',
      target: row.name || row.service,
      tone: 'trash',
    })
    res.json({ ok: true })
  }),
)

// ---- Public render surface (no auth) ------------------------------------
// Returns ONLY the enabled snippets the public page renderer needs, grouped
// by placement. No ids, names, service keys, disabled rows or admin metadata
// are ever exposed here.

export const integrationsRenderRouter = Router()

integrationsRenderRouter.get(
  '/render',
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select()
      .from(siteIntegrations)
      .where(eq(siteIntegrations.enabled, true))
    const join = (parts: string[]) => parts.filter((p) => p.trim().length > 0).join('\n')
    res.json({
      head: join(rows.map((r) => r.headCode)),
      bodyStart: join(rows.map((r) => r.bodyStartCode)),
      bodyEnd: join(rows.map((r) => r.bodyEndCode)),
    })
  }),
)
