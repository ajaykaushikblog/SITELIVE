import { Router } from 'express'
import { z } from 'zod'
import { asc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { taxonomyTerms } from '../db/schema.js'
import { asyncHandler } from '../lib/http.js'
import { notFound } from '../lib/errors.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'

export const taxonomyRouter = Router()

const KINDS = [
  'category',
  'subcategory',
  'occasion',
  'season',
  'tag',
  'style',
  'color',
  'audience',
] as const

// Public: taxonomy is used by the public site for navigation/filtering.
taxonomyRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(taxonomyTerms).orderBy(asc(taxonomyTerms.name))
    res.json({ terms: rows })
  }),
)

const termSchema = z.object({
  kind: z.enum(KINDS),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  parent: z.string().optional(),
  indexable: z.boolean().default(true),
})

taxonomyRouter.post(
  '/',
  requireAuth,
  requirePermission('Manage taxonomy'),
  asyncHandler(async (req, res) => {
    const [row] = await db.insert(taxonomyTerms).values(termSchema.parse(req.body)).returning()
    res.status(201).json({ term: row })
  }),
)

taxonomyRouter.put(
  '/:id',
  requireAuth,
  requirePermission('Manage taxonomy'),
  asyncHandler(async (req, res) => {
    const [row] = await db
      .update(taxonomyTerms)
      .set(termSchema.partial().parse(req.body))
      .where(eq(taxonomyTerms.id, req.params.id))
      .returning()
    if (!row) throw notFound('Term not found')
    res.json({ term: row })
  }),
)

taxonomyRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('Manage taxonomy'),
  asyncHandler(async (req, res) => {
    const [row] = await db.delete(taxonomyTerms).where(eq(taxonomyTerms.id, req.params.id)).returning()
    if (!row) throw notFound('Term not found')
    res.json({ ok: true })
  }),
)
