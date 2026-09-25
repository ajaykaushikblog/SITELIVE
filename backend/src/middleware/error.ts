import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { HttpError } from '../lib/errors.js'
import { isProd } from '../config/env.js'

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.flatten() })
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details })
  }
  // Unexpected: log server-side, never leak internals to the client.
  console.error('Unhandled error:', err)
  res.status(500).json({ error: isProd ? 'Internal server error' : String((err as Error)?.message ?? err) })
}
