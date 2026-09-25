import { Router } from 'express'
import { z } from 'zod'
import { asc, desc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { activityLog, collections, redirects } from '../db/schema.js'
import { asyncHandler } from '../lib/http.js'
import { notFound } from '../lib/errors.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'

/* Smaller resources: redirects, collections, activity feed. */

export const redirectsRouter = Router()

redirectsRouter.get(
  '/',
  requireAuth,
  requirePermission('Manage SEO'),
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(redirects).orderBy(desc(redirects.createdAt))
    res.json({ redirects: rows })
  }),
)

const redirectSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  type: z.enum(['301', '302']).default('301'),
  status: z.enum(['active', 'disabled']).default('active'),
})

redirectsRouter.post(
  '/',
  requireAuth,
  requirePermission('Manage SEO'),
  asyncHandler(async (req, res) => {
    const [row] = await db.insert(redirects).values(redirectSchema.parse(req.body)).returning()
    res.status(201).json({ redirect: row })
  }),
)

redirectsRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('Manage SEO'),
  asyncHandler(async (req, res) => {
    const [row] = await db.delete(redirects).where(eq(redirects.id, req.params.id)).returning()
    if (!row) throw notFound('Redirect not found')
    res.json({ ok: true })
  }),
)

// ---- Collections ---------------------------------------------------------

export const collectionsRouter = Router()

collectionsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(collections).orderBy(asc(collections.name))
    res.json({ collections: rows })
  }),
)

collectionsRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const row = await db.query.collections.findFirst({ where: eq(collections.slug, req.params.slug) })
    if (!row) throw notFound('Collection not found')
    res.json({ collection: row })
  }),
)

const collectionSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().default(''),
  coverImage: z.string().default(''),
  contentIds: z.array(z.string()).default([]),
  type: z.string().default('editorial'),
  status: z.string().default('draft'),
  config: z.record(z.unknown()).default({}),
})

collectionsRouter.post(
  '/',
  requireAuth,
  requirePermission('Manage content'),
  asyncHandler(async (req, res) => {
    const [row] = await db.insert(collections).values(collectionSchema.parse(req.body)).returning()
    res.status(201).json({ collection: row })
  }),
)

collectionsRouter.put(
  '/:id',
  requireAuth,
  requirePermission('Manage content'),
  asyncHandler(async (req, res) => {
    const [row] = await db
      .update(collections)
      .set(collectionSchema.partial().parse(req.body))
      .where(eq(collections.id, req.params.id))
      .returning()
    if (!row) throw notFound('Collection not found')
    res.json({ collection: row })
  }),
)

// ---- Activity feed -------------------------------------------------------

export const activityRouter = Router()

activityRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(50)
    res.json({ activity: rows })
  }),
)
