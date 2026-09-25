import { readFileSync } from 'node:fs'
import { eq } from 'drizzle-orm'
import { db, pool } from './client.js'
import {
  authors,
  collections,
  contentItems,
  homepageSections,
  navItems,
  redirects,
  roles,
  siteSettings,
  taxonomyTerms,
  users,
} from './schema.js'
import { hashPassword } from '../auth/password.js'
import { env } from '../config/env.js'
import { PERMISSIONS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS, type RoleName } from '../lib/permissions.js'

/* =========================================================================
   Seeds the database from database/seed/seed-data.json (a snapshot of the
   existing demo content) plus the shared role/permission model. Idempotent:
   safe to run repeatedly — it inserts only rows that don't already exist.
   Run: `pnpm db:seed` (after `pnpm db:migrate`).
   ========================================================================= */

type SeedData = {
  authors: any[]
  taxonomy: any[]
  content: any[]
  nav: { desktop: any[] }
  footer: Record<string, unknown>
  homepageSections: any[]
  collections: any[]
  redirects: any[]
  settings: Record<string, Record<string, unknown>>
}

const dataPath = new URL('../../../database/seed/seed-data.json', import.meta.url)
const data = JSON.parse(readFileSync(dataPath, 'utf8')) as SeedData

async function seedRoles() {
  const names = Object.keys(ROLE_PERMISSIONS) as RoleName[]
  const idByName = new Map<string, string>()
  for (const name of names) {
    const existing = await db.query.roles.findFirst({ where: eq(roles.name, name) })
    if (existing) {
      idByName.set(name, existing.id)
      continue
    }
    const [row] = await db
      .insert(roles)
      .values({
        name,
        description: ROLE_DESCRIPTIONS[name],
        permissions: name === 'Administrator' ? [...PERMISSIONS] : ROLE_PERMISSIONS[name],
      })
      .returning()
    idByName.set(name, row.id)
  }
  return idByName
}

async function seedAdmin(adminRoleId: string) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, env.SEED_ADMIN_EMAIL.toLowerCase()) })
  if (existing) return
  await db.insert(users).values({
    name: 'Administrator',
    email: env.SEED_ADMIN_EMAIL.toLowerCase(),
    passwordHash: await hashPassword(env.SEED_ADMIN_PASSWORD),
    roleId: adminRoleId,
    status: 'active',
  })
  console.log(`  • created admin user ${env.SEED_ADMIN_EMAIL} (change the password after first login)`)
}

async function main() {
  console.log('Seeding database…')

  const roleIds = await seedRoles()
  await seedAdmin(roleIds.get('Administrator')!)

  // Authors
  const authorIdBySlug = new Map<string, string>()
  for (const a of data.authors) {
    const existing = await db.query.authors.findFirst({ where: eq(authors.slug, a.slug) })
    if (existing) {
      authorIdBySlug.set(a.slug, existing.id)
      continue
    }
    const [row] = await db.insert(authors).values(a).returning()
    authorIdBySlug.set(a.slug, row.id)
  }

  // Taxonomy
  for (const t of data.taxonomy) {
    const existing = await db.query.taxonomyTerms.findFirst({
      where: (tt, { and, eq: e }) => and(e(tt.kind, t.kind), e(tt.slug, t.slug)),
    })
    if (!existing) await db.insert(taxonomyTerms).values(t)
  }

  // Content
  for (const c of data.content) {
    const existing = await db.query.contentItems.findFirst({
      where: (ci, { and, eq: e }) => and(e(ci.type, c.type), e(ci.slug, c.slug)),
    })
    if (existing) continue
    const now = new Date()
    await db.insert(contentItems).values({
      type: c.type,
      title: c.title,
      slug: c.slug,
      excerpt: c.excerpt ?? '',
      status: c.status ?? 'published',
      authorId: c.authorSlug ? authorIdBySlug.get(c.authorSlug) ?? null : null,
      authorName: c.authorName ?? '',
      featuredImage: c.featuredImage ?? '',
      category: c.category ?? '',
      subcategories: c.subcategories ?? [],
      occasions: c.occasions ?? [],
      seasons: c.seasons ?? [],
      tags: c.tags ?? [],
      styles: c.styles ?? [],
      colors: c.colors ?? [],
      audiences: c.audiences ?? [],
      featured: c.featured ?? false,
      detail: c.detail ?? {},
      publishedAt: (c.status ?? 'published') === 'published' ? now : null,
      updatedAt: now,
    })
  }

  // Navigation (desktop) — replace to stay in sync with the snapshot
  const navCount = await db.select().from(navItems).where(eq(navItems.area, 'desktop'))
  if (navCount.length === 0) {
    await db.insert(navItems).values(
      data.nav.desktop.map((n, i) => ({
        area: 'desktop' as const,
        label: n.label,
        destinationType: n.destinationType ?? 'external',
        ref: n.ref ?? null,
        url: n.url ?? null,
        order: i,
        enabled: true,
        menu: n.menu ?? null,
      })),
    )
  }

  // Footer + settings (key/value)
  await db
    .insert(siteSettings)
    .values({ key: 'footer', value: data.footer })
    .onConflictDoNothing()
  for (const [key, value] of Object.entries(data.settings)) {
    await db.insert(siteSettings).values({ key, value }).onConflictDoNothing()
  }

  // Homepage sections
  const hp = await db.select().from(homepageSections)
  if (hp.length === 0) {
    await db.insert(homepageSections).values(
      data.homepageSections.map((s, i) => ({ ...s, order: s.order ?? i })),
    )
  }

  // Collections (resolve content slugs → ids)
  for (const col of data.collections) {
    const existing = await db.query.collections.findFirst({ where: eq(collections.slug, col.slug) })
    if (existing) continue
    const ids: string[] = []
    for (const slug of col.contentSlugs ?? []) {
      const item = await db.query.contentItems.findFirst({ where: eq(contentItems.slug, slug) })
      if (item) ids.push(item.id)
    }
    await db.insert(collections).values({
      name: col.name,
      slug: col.slug,
      description: col.description ?? '',
      coverImage: col.coverImage ?? '',
      contentIds: ids,
      type: col.type ?? 'editorial',
      status: col.status ?? 'draft',
      config: col.config ?? {},
    })
  }

  // Redirects
  for (const r of data.redirects) {
    await db.insert(redirects).values(r).onConflictDoNothing()
  }

  console.log('✓ Seed complete')
  await pool.end()
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
