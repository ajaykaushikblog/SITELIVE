import 'dotenv/config'
import { z } from 'zod'

/* =========================================================================
   Centralised, validated configuration. Nothing else in the app reads
   process.env directly. If required config is missing or unsafe, we fail
   loudly at boot rather than at request time.
   ========================================================================= */

const bool = (def: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v == null ? def : v === 'true' || v === '1'))

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:8443')
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 chars'),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
  COOKIE_SECURE: bool(false),

  SEED_ADMIN_EMAIL: z.string().email().default('admin@marigoldandmaple.test'),
  SEED_ADMIN_PASSWORD: z.string().min(8).default('change-me-at-first-login'),

  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_DIR: z.string().default('./.uploads'),
  STORAGE_PUBLIC_BASE_URL: z.string().default('http://localhost:4000/uploads'),
  STORAGE_MAX_UPLOAD_MB: z.coerce.number().positive().default(15),

  S3_ENDPOINT: z.string().optional().default(''),
  S3_REGION: z.string().optional().default(''),
  S3_BUCKET: z.string().optional().default(''),
  S3_ACCESS_KEY_ID: z.string().optional().default(''),
  S3_SECRET_ACCESS_KEY: z.string().optional().default(''),

  PUBLISH_JOB_INTERVAL_SECONDS: z.coerce.number().int().positive().default(60),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('\n✖ Invalid backend configuration:\n')
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
  }
  console.error('\nCopy backend/.env.example to backend/.env and fill in values.\n')
  process.exit(1)
}

export const env = parsed.data
export const isProd = env.NODE_ENV === 'production'

// Refuse to boot in production with the placeholder session secret.
if (isProd && env.SESSION_SECRET.includes('change-me')) {
  console.error('✖ Refusing to start in production with the placeholder SESSION_SECRET.')
  process.exit(1)
}
