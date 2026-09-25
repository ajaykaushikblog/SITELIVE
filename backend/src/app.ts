import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { env } from './config/env.js'
import { attachUser } from './middleware/auth.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'
import { healthRouter } from './routes/health.js'
import { apiRouter } from './routes/index.js'
import { env as _env } from './config/env.js'

/* Builds the configured Express app. Server startup lives in index.ts so the
   app can also be imported for testing without binding a port. */

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  // Security headers. CSP is left to the frontend host (the API serves JSON).
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }))

  // CORS restricted to configured origins; credentials on for the session cookie.
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || env.CORS_ORIGINS.includes(origin)) return cb(null, true)
        cb(new Error(`Origin not allowed by CORS: ${origin}`))
      },
      credentials: true,
    }),
  )

  app.use(express.json({ limit: '2mb' }))
  app.use(cookieParser())

  // Global rate limit as a baseline DoS guard; auth routes add a stricter one.
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

  // Serve locally-stored uploads when using the local storage driver.
  if (_env.STORAGE_DRIVER === 'local') {
    app.use('/uploads', express.static(_env.STORAGE_LOCAL_DIR, { fallthrough: true, index: false }))
  }

  app.use('/api/health', healthRouter)

  // Populate req.user (if a valid session cookie is present) before routes.
  app.use(attachUser)
  app.use('/api', apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
