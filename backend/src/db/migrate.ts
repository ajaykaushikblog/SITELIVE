import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db, pool } from './client.js'

/* Applies all generated SQL migrations from ../database/migrations.
   Run against a live PostgreSQL: `pnpm db:migrate`. */

async function main() {
  console.log('Running migrations…')
  await migrate(db, { migrationsFolder: new URL('../../../database/migrations', import.meta.url).pathname })
  console.log('✓ Migrations applied')
  await pool.end()
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
