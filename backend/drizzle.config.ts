import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

/* drizzle-kit reads this to generate SQL migrations from src/db/schema.ts
   into ../database/migrations. Run: `pnpm db:generate`. */

export default defineConfig({
  schema: './src/db/schema.ts',
  out: '../database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/marigold',
  },
  strict: true,
})
