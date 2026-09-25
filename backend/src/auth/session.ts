import { randomBytes, createHash } from 'node:crypto'
import type { Response } from 'express'
import { and, eq, ne } from 'drizzle-orm'
import { db } from '../db/client.js'
import { sessions } from '../db/schema.js'
import { env } from '../config/env.js'

/* =========================================================================
   Opaque server-side sessions.

   - A random 32-byte token is sent to the client in an HttpOnly cookie.
   - Only the SHA-256 hash of the token is stored in the DB, so a database
     leak does not expose usable session tokens.
   - Sessions have an absolute expiry; expired rows are ignored and cleaned up.
   ========================================================================= */

export const SESSION_COOKIE = 'mm_session'

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  }
}

export async function createSession(res: Response, userId: string): Promise<void> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  await db.insert(sessions).values({ tokenHash: hashToken(token), userId, expiresAt })
  res.cookie(SESSION_COOKIE, token, cookieOptions())
}

export async function readSession(token: string | undefined) {
  if (!token) return null
  const row = await db.query.sessions.findFirst({
    where: eq(sessions.tokenHash, hashToken(token)),
    with: { user: true },
  })
  if (!row) return null
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.tokenHash, row.tokenHash))
    return null
  }
  return row
}

export async function destroySession(res: Response, token: string | undefined): Promise<void> {
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)))
  res.clearCookie(SESSION_COOKIE, { ...cookieOptions(), maxAge: undefined })
}

/** Revoke every session for a user except the one identified by `keepToken`.
   Used after a password change so other devices are logged out but the caller
   stays signed in. If `keepToken` is undefined, all sessions are revoked. */
export async function revokeUserSessionsExcept(userId: string, keepToken: string | undefined): Promise<void> {
  const keepHash = keepToken ? hashToken(keepToken) : null
  await db
    .delete(sessions)
    .where(keepHash ? and(eq(sessions.userId, userId), ne(sessions.tokenHash, keepHash)) : eq(sessions.userId, userId))
}
