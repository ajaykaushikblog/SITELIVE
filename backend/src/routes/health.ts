import { Router } from 'express'
import { pingDatabase } from '../db/client.js'
import { asyncHandler } from '../lib/http.js'

/* Liveness + readiness. /api/health never touches the DB (cheap liveness);
   /api/health/database reports real connectivity and latency. */

export const healthRouter = Router()

const startedAt = Date.now()

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'marigold-maple-backend',
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  })
})

healthRouter.get(
  '/database',
  asyncHandler(async (_req, res) => {
    const result = await pingDatabase()
    res.status(result.ok ? 200 : 503).json({
      status: result.ok ? 'ok' : 'unavailable',
      database: result,
    })
  }),
)
