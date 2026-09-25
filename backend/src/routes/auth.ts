import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { activityLog, roles, users } from '../db/schema.js'
import { hashPassword, verifyPassword } from '../auth/password.js'
import { createSession, destroySession, revokeUserSessionsExcept, SESSION_COOKIE } from '../auth/session.js'
import { asyncHandler } from '../lib/http.js'
import { badRequest, conflict, unauthorized } from '../lib/errors.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

// Stricter limiter on login to blunt credential-stuffing / brute force.
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10, standardHeaders: true, legacyHeaders: false })

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

authRouter.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = credentials.parse(req.body)
    const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) })
    // Same generic error whether the email exists or not (no user enumeration).
    if (!user || user.status !== 'active' || !(await verifyPassword(user.passwordHash, password))) {
      throw unauthorized('Invalid email or password')
    }
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id))
    await createSession(res, user.id)
    await db.insert(activityLog).values({ userName: user.name, action: 'Signed in', target: '', tone: 'created' })
    const role = await db.query.roles.findFirst({ where: eq(roles.id, user.roleId) })
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: role?.name ?? 'unknown' },
    })
  }),
)

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    if (req.user) {
      await db.insert(activityLog).values({ userName: req.user.name, action: 'Signed out', target: '', tone: 'edited' })
    }
    await destroySession(res, req.cookies?.[SESSION_COOKIE])
    res.json({ ok: true })
  }),
)

// ---- Account & security (authenticated self-service) --------------------

// Change the signed-in admin's password. Requires the current password; the
// new password must be ≥12 chars and confirmed. Other sessions are revoked so
// a leaked/old session cannot outlive the change; the caller stays signed in.
authRouter.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(12, 'New password must be at least 12 characters'),
        confirmPassword: z.string().min(1),
      })
      .parse(req.body)
    if (body.newPassword !== body.confirmPassword) throw badRequest('New password and confirmation do not match')

    const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.id) })
    if (!user || !(await verifyPassword(user.passwordHash, body.currentPassword))) {
      throw badRequest('Current password is incorrect')
    }
    if (await verifyPassword(user.passwordHash, body.newPassword)) {
      throw badRequest('New password must be different from the current password')
    }

    const passwordHash = await hashPassword(body.newPassword)
    await db.update(users).set({ passwordHash }).where(eq(users.id, user.id))
    // Log everywhere else out, then re-issue a fresh session for this device.
    await revokeUserSessionsExcept(user.id, undefined)
    await createSession(res, user.id)
    await db.insert(activityLog).values({ userName: user.name, action: 'Changed password', target: '', tone: 'edited' })
    res.json({ ok: true })
  }),
)

// Change the signed-in admin's login email. Requires the current password,
// a valid & unique email. The session stays valid (same user id).
authRouter.post(
  '/change-email',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({ email: z.string().email('Enter a valid email address'), currentPassword: z.string().min(1) })
      .parse(req.body)
    const email = body.email.toLowerCase()

    const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.id) })
    if (!user || !(await verifyPassword(user.passwordHash, body.currentPassword))) {
      throw badRequest('Current password is incorrect')
    }
    if (email !== user.email) {
      const taken = await db.query.users.findFirst({ where: eq(users.email, email) })
      if (taken) throw conflict('That email is already in use by another account')
    }
    await db.update(users).set({ email }).where(eq(users.id, user.id))
    const role = await db.query.roles.findFirst({ where: eq(roles.id, user.roleId) })
    await db.insert(activityLog).values({ userName: user.name, action: 'Changed account email', target: email, tone: 'edited' })
    res.json({ user: { id: user.id, name: user.name, email, role: role?.name ?? 'unknown' } })
  }),
)

// Who am I — used by the admin shell to bootstrap auth state on load.
authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const u = req.user!
    res.json({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.roleName,
        permissions: [...u.permissions],
      },
    })
  }),
)
