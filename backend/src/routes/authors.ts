import { Router } from 'express'
import { z } from 'zod'
import { asc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { authors } from '../db/schema.js'
import { asyncHandler } from '../lib/http.js'
import { notFound } from '../lib/errors.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'

export const authorsRouter = Router()

// Public: author profiles power /author/:slug pages.
authorsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(authors).orderBy(asc(authors.name))
    res.json({ authors: rows })
  }),
)

authorsRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const row = await db.query.authors.findFirst({ where: eq(authors.slug, req.params.slug) })
    if (!row) throw notFound('Author not found')
    res.json({ author: row })
  }),
)

const authorSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  profileImage: z.string().default(''),
  professionalTitle: z.string().default(''),
  shortBio: z.string().default(''),
  longBio: z.array(z.string()).default([]),
  expertise: z.array(z.object({ label: z.string(), href: z.string().optional() })).default([]),
  credentials: z.array(z.string()).optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  email: z.string().optional(),
  socialLinks: z.array(z.object({ platform: z.string(), href: z.string() })).default([]),
  yearsExperience: z.number().int().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  seo: z.record(z.unknown()).optional(),
})

authorsRouter.post(
  '/',
  requireAuth,
  requirePermission('Manage authors'),
  asyncHandler(async (req, res) => {
    const [row] = await db.insert(authors).values(authorSchema.parse(req.body) as never).returning()
    res.status(201).json({ author: row })
  }),
)

authorsRouter.put(
  '/:id',
  requireAuth,
  requirePermission('Manage authors'),
  asyncHandler(async (req, res) => {
    const [row] = await db
      .update(authors)
      .set(authorSchema.partial().parse(req.body) as never)
      .where(eq(authors.id, req.params.id))
      .returning()
    if (!row) throw notFound('Author not found')
    res.json({ author: row })
  }),
)
