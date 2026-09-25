import { and, eq, lte } from 'drizzle-orm'
import { db } from '../db/client.js'
import { activityLog, contentItems } from '../db/schema.js'
import { env } from '../config/env.js'

/* =========================================================================
   Background worker: promotes scheduled content to published once its
   scheduledFor time has passed. Runs on an interval inside the API process
   (fine for a single instance). For multi-instance deployments, move this to
   a dedicated worker or a real queue (documented in backend/README.md).
   ========================================================================= */

export async function runPublishDueContent(now = new Date()): Promise<number> {
  const due = await db
    .select({ id: contentItems.id, title: contentItems.title })
    .from(contentItems)
    .where(and(eq(contentItems.status, 'scheduled'), lte(contentItems.scheduledFor, now)))

  for (const item of due) {
    await db
      .update(contentItems)
      .set({ status: 'published', publishedAt: now, scheduledFor: null, updatedAt: now })
      .where(eq(contentItems.id, item.id))
    await db.insert(activityLog).values({
      userName: 'system',
      action: 'Auto-published scheduled content',
      target: item.title,
      tone: 'published',
    })
  }
  if (due.length) console.log(`↻ Publish job: promoted ${due.length} scheduled item(s)`)
  return due.length
}

export function startPublishJob() {
  const intervalMs = env.PUBLISH_JOB_INTERVAL_SECONDS * 1000
  const timer = setInterval(() => {
    runPublishDueContent().catch((err) => console.error('Publish job error:', err))
  }, intervalMs)
  timer.unref?.()
  return () => clearInterval(timer)
}
