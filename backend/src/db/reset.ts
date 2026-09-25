import { pool } from './client.js'

/* DANGER: drops the public schema and everything in it. Development helper
   only — never wire this to anything reachable in production. Follow with
   `pnpm db:migrate && pnpm db:seed`. */

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to reset the database in production.')
    process.exit(1)
  }
  console.log('Dropping and recreating public schema…')
  await pool.query('drop schema public cascade; create schema public;')
  console.log('✓ Schema reset. Run `pnpm db:migrate && pnpm db:seed` next.')
  await pool.end()
}

main().catch((err) => {
  console.error('Reset failed:', err)
  process.exit(1)
})
