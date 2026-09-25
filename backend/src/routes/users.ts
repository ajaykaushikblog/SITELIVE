import { Router } from 'express'
import { z } from 'zod'
import { asc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { roles, users } from '../db/schema.js'
import { hashPassword } from '../auth/password.js'
import { asyncHandler } from '../lib/http.js'
import { conflict, notFound } from '../lib/errors.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'

/* User + role administration. Password hashes are never returned. */

export const usersRouter = Router()

usersRouter.get(
  '/',
  requireAuth,
  requirePermission('Manage users'),
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        status: users.status,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(asc(users.name))
    res.json({ users: rows })
  }),
)

usersRouter.get(
  '/roles',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(roles).orderBy(asc(roles.name))
    res.json({ roles: rows })
  }),
)

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  roleId: z.string().uuid(),
  status: z.enum(['active', 'inactive']).default('active'),
})

usersRouter.post(
  '/',
  requireAuth,
  requirePermission('Manage users'),
  asyncHandler(async (req, res) => {
    const data = createUserSchema.parse(req.body)
    const email = data.email.toLowerCase()
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
    if (existing) throw conflict('A user with that email already exists')
    const [row] = await db
      .insert(users)
      .values({
        name: data.name,
        email,
        passwordHash: await hashPassword(data.password),
        roleId: data.roleId,
        status: data.status,
      })
      .returning({ id: users.id, name: users.name, email: users.email, roleId: users.roleId, status: users.status })
    res.status(201).json({ user: row })
  }),
)

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  roleId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  password: z.string().min(8).optional(),
})

usersRouter.put(
  '/:id',
  requireAuth,
  requirePermission('Manage users'),
  asyncHandler(async (req, res) => {
    const data = updateUserSchema.parse(req.body)
    const patch: Record<string, unknown> = {}
    if (data.name) patch.name = data.name
    if (data.roleId) patch.roleId = data.roleId
    if (data.status) patch.status = data.status
    if (data.password) patch.passwordHash = await hashPassword(data.password)
    const [row] = await db
      .update(users)
      .set(patch)
      .where(eq(users.id, req.params.id))
      .returning({ id: users.id, name: users.name, email: users.email, roleId: users.roleId, status: users.status })
    if (!row) throw notFound('User not found')
    res.json({ user: row })
  }),
)
