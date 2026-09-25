import type { NextFunction, Request, Response } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { roles } from '../db/schema.js'
import { readSession, SESSION_COOKIE } from '../auth/session.js'
import { forbidden, unauthorized } from '../lib/errors.js'
import { asyncHandler } from '../lib/http.js'

/* =========================================================================
   Authentication + authorisation.

   Permissions are enforced HERE, on the server, from the role stored in the
   database — never trusted from the client. The frontend also hides controls
   the user can't use, but that is only cosmetic; this is the real gate.
   ========================================================================= */

export type AuthedUser = {
  id: string
  name: string
  email: string
  roleId: string
  roleName: string
  permissions: Set<string>
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser
    }
  }
}

/** Populate req.user from the session cookie if present (does not require auth). */
export const attachUser = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined
  const session = await readSession(token)
  if (session?.user) {
    const role = await db.query.roles.findFirst({ where: eq(roles.id, session.user.roleId) })
    req.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      roleId: session.user.roleId,
      roleName: role?.name ?? 'unknown',
      permissions: new Set(role?.permissions ?? []),
    }
  }
  next()
})

/** Hard gate: 401 if there is no authenticated user. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) throw unauthorized()
  next()
}

/** Require a specific permission slug (Administrator implicitly holds all). */
export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw unauthorized()
    if (req.user.roleName === 'Administrator' || req.user.permissions.has(permission)) {
      return next()
    }
    throw forbidden(`Missing permission: ${permission}`)
  }
}
