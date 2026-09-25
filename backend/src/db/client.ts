import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from '../config/env.js'
import * as schema from './schema.js'

/* =========================================================================
   Single shared PostgreSQL pool + Drizzle instance. All queries go through
   `db`; parameterised by Drizzle, so no hand-built SQL strings and no SQL
   injection surface.
   ========================================================================= */

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
})

export const db = drizzle(pool, { schema })

export type Database = typeof db

/** Lightweight connectivity probe used by the /api/health/database endpoint. */
export async function pingDatabase(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now()
  try {
    await pool.query('select 1')
    return { ok: true, latencyMs: Date.now() - start }
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: (err as Error).message }
  }
}
