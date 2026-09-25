import { Router } from 'express'
import { z } from 'zod'
import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '../db/client.js'
import { activityLog, contentItems } from '../db/schema.js'
import { asyncHandler } from '../lib/http.js'
import { forbidden, notFound } from '../lib/errors.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'

/* Content CRUD. Public reads are limited to published items; admin reads and
   all writes require authentication + the relevant permission. */

export const contentRouter = Router()

const CONTENT_TYPES = ['article', 'recipe', 'diy', 'listicle', 'guide', 'product-guide'] as const
const STATUSES = ['draft', 'review', 'scheduled', 'published', 'unpublished', 'trash'] as const

// ---- Public: list & fetch published content -----------------------------

contentRouter.get(
  '/public',
  asyncHandler(async (req, res) => {
    const type = req.query.type as string | undefined
    const conds = [eq(contentItems.status, 'published')]
    if (type && (CONTENT_TYPES as readonly string[]).includes(type)) {
      conds.push(eq(contentItems.type, type as (typeof CONTENT_TYPES)[number]))
    }
    const rows = await db
      .select()
      .from(contentItems)
      .where(and(...conds))
      .orderBy(desc(contentItems.publishedAt))
    res.json({ items: rows })
  }),
)

contentRouter.get(
  '/public/:type/:slug',
  asyncHandler(async (req, res) => {
    const { type, slug } = req.params
    const row = await db.query.contentItems.findFirst({
      where: and(
        eq(contentItems.type, type as (typeof CONTENT_TYPES)[number]),
        eq(contentItems.slug, slug),
        eq(contentItems.status, 'published'),
      ),
    })
    if (!row) throw notFound('Content not found')
    // Best-effort view counter; never blocks the response.
    void db
      .update(contentItems)
      .set({ views: sql`coalesce(${contentItems.views}, 0) + 1` })
      .where(eq(contentItems.id, row.id))
    res.json({ item: row })
  }),
)

// ---- Admin: full listing (any status) -----------------------------------

contentRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined
    const conds = status && (STATUSES as readonly string[]).includes(status)
      ? [eq(contentItems.status, status as (typeof STATUSES)[number])]
      : []
    const rows = await db
      .select()
      .from(contentItems)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(contentItems.updatedAt))
    res.json({ items: rows })
  }),
)

contentRouter.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const row = await db.query.contentItems.findFirst({ where: eq(contentItems.id, req.params.id) })
    if (!row) throw notFound('Content not found')
    res.json({ item: row })
  }),
)

// ---- Admin: create / update / delete ------------------------------------

const upsertSchema = z.object({
  type: z.enum(CONTENT_TYPES),
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().default(''),
  status: z.enum(STATUSES).default('draft'),
  authorId: z.string().uuid().nullable().optional(),
  authorName: z.string().default(''),
  featuredImage: z.string().default(''),
  category: z.string().default(''),
  subcategories: z.array(z.string()).default([]),
  occasions: z.array(z.string()).default([]),
  seasons: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  styles: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  audiences: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  detail: z.record(z.unknown()).default({}),
  scheduledFor: z.coerce.date().nullable().optional(),
})

function derivePublish(status: string, scheduledFor?: Date | null, existingPublishedAt?: Date | null) {
  if (status === 'published') return { publishedAt: existingPublishedAt ?? new Date(), scheduledFor: null }
  if (status === 'scheduled') return { publishedAt: null, scheduledFor: scheduledFor ?? null }
  return { publishedAt: existingPublishedAt ?? null, scheduledFor: null }
}

contentRouter.post(
  '/',
  requireAuth,
  requirePermission('Manage content'),
  asyncHandler(async (req, res) => {
    const data = upsertSchema.parse(req.body)
    const pub = derivePublish(data.status, data.scheduledFor)
    const [row] = await db
      .insert(contentItems)
      .values({ ...data, authorId: data.authorId ?? null, ...pub, updatedAt: new Date() })
      .returning()
    await db.insert(activityLog).values({
      userName: req.user!.name,
      action: 'Created content',
      target: data.title,
      tone: 'created',
    })
    res.status(201).json({ item: row })
  }),
)

contentRouter.put(
  '/:id',
  requireAuth,
  requirePermission('Manage content'),
  asyncHandler(async (req, res) => {
    const existing = await db.query.contentItems.findFirst({ where: eq(contentItems.id, req.params.id) })
    if (!existing) throw notFound('Content not found')
    // Publishing requires the publish permission specifically.
    const data = upsertSchema.parse(req.body)
    if (data.status === 'published' && existing.status !== 'published') {
      if (req.user!.roleName !== 'Administrator' && !req.user!.permissions.has('Publish content')) {
        throw forbidden('Missing permission: Publish content')
      }
    }
    const pub = derivePublish(data.status, data.scheduledFor, existing.publishedAt)
    const [row] = await db
      .update(contentItems)
      .set({ ...data, authorId: data.authorId ?? null, ...pub, updatedAt: new Date() })
      .where(eq(contentItems.id, req.params.id))
      .returning()
    await db.insert(activityLog).values({
      userName: req.user!.name,
      action: 'Edited content',
      target: data.title,
      tone: 'edited',
    })
    res.json({ item: row })
  }),
)

contentRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('Manage content'),
  asyncHandler(async (req, res) => {
    // Soft delete → trash, matching the CMS status model.
    const [row] = await db
      .update(contentItems)
      .set({ status: 'trash', updatedAt: new Date() })
      .where(eq(contentItems.id, req.params.id))
      .returning()
    if (!row) throw notFound('Content not found')
    await db.insert(activityLog).values({
      userName: req.user!.name,
      action: 'Moved content to trash',
      target: row.title,
      tone: 'trash',
    })
    res.json({ item: row })
  }),
)
