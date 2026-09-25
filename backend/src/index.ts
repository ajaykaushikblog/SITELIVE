import { createApp } from './app.js'
import { env } from './config/env.js'
import { pingDatabase, pool } from './db/client.js'
import { startPublishJob } from './jobs/publishScheduled.js'

/* Entry point: verify DB connectivity, start the HTTP server and the
   background publish worker, and shut down cleanly. */

async function main() {
  const ping = await pingDatabase()
  if (!ping.ok) {
    console.warn(
      `⚠  Database not reachable at startup (${ping.error}). ` +
        'The server will still boot; /api/health/database will report the outage. ' +
        'Run `pnpm db:migrate && pnpm db:seed` against a live PostgreSQL first.',
    )
  } else {
    console.log(`✓ Database reachable (${ping.latencyMs}ms)`)
  }

  const app = createApp()
  const server = app.listen(env.PORT, () => {
    console.log(`✓ API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`)
  })

  const stopJob = startPublishJob()

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down…`)
    stopJob()
    server.close()
    await pool.end()
    process.exit(0)
  }
  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
}

main().catch((err) => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})
