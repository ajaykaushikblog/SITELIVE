import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { desc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { media } from '../db/schema.js'
import { storage } from '../storage/index.js'
import { env } from '../config/env.js'
import { asyncHandler } from '../lib/http.js'
import { badRequest, notFound } from '../lib/errors.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'

export const mediaRouter = Router()

// In-memory upload; size cap enforced here and again in the storage driver.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.STORAGE_MAX_UPLOAD_MB * 1024 * 1024 },
})

mediaRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(media).orderBy(desc(media.createdAt))
    res.json({ media: rows })
  }),
)

mediaRouter.post(
  '/',
  requireAuth,
  requirePermission('Manage media'),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('No file uploaded (field name: file)')
    const stored = await storage.put({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      contentType: req.file.mimetype,
    })
    const meta = z
      .object({ title: z.string().optional(), alt: z.string().optional(), caption: z.string().optional() })
      .parse(req.body ?? {})
    const [row] = await db
      .insert(media)
      .values({
        filename: req.file.originalname,
        url: stored.url,
        storageKey: stored.key,
        format: (req.file.mimetype.split('/')[1] ?? 'jpeg').toUpperCase(),
        sizeKb: Math.round(stored.size / 1024),
        title: meta.title ?? req.file.originalname,
        alt: meta.alt ?? '',
        caption: meta.caption ?? '',
      })
      .returning()
    res.status(201).json({ media: row })
  }),
)

mediaRouter.put(
  '/:id',
  requireAuth,
  requirePermission('Manage media'),
  asyncHandler(async (req, res) => {
    const patch = z
      .object({
        title: z.string().optional(),
        alt: z.string().optional(),
        caption: z.string().optional(),
        description: z.string().optional(),
        decorative: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
      })
      .parse(req.body)
    const [row] = await db.update(media).set(patch).where(eq(media.id, req.params.id)).returning()
    if (!row) throw notFound('Media not found')
    res.json({ media: row })
  }),
)

mediaRouter.delete(
  '/:id',
  requireAuth,
  requirePermission('Manage media'),
  asyncHandler(async (req, res) => {
    const [row] = await db.delete(media).where(eq(media.id, req.params.id)).returning()
    if (!row) throw notFound('Media not found')
    res.json({ ok: true })
  }),
)
