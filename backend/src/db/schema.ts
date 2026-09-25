import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

/* =========================================================================
   Database schema (PostgreSQL via Drizzle ORM).

   Design: relational tables for everything the app lists, filters, joins and
   authorises on; typed JSONB for deep/variadic editorial structures (content
   blocks, SEO blocks, Pinterest metadata, recipe/DIY data, mega-menu config).
   This mirrors src/lib/* and src/lib/admin/* without exploding into dozens of
   sparsely-used tables. Every JSONB column is typed with $type<>() so the ORM
   layer stays type-safe.
   ========================================================================= */

// ---- Identity, roles & sessions -----------------------------------------

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // Administrator | Editor | Author | Contributor
  description: text('description'),
  // Permission slugs (see shared PERMISSIONS). Administrator implicitly holds all.
  permissions: jsonb('permissions').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id),
    status: text('status').$type<'active' | 'inactive'>().notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  },
  (t) => ({ emailIdx: uniqueIndex('users_email_idx').on(t.email) }),
)

export const sessions = pgTable(
  'sessions',
  {
    tokenHash: text('token_hash').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (t) => ({ userIdx: index('sessions_user_idx').on(t.userId) }),
)

// ---- Authors (public author profiles) -----------------------------------

type SocialLink = { platform: string; href: string }
type AuthorSeo = {
  seoTitle: string
  metaDescription: string
  canonicalUrl: string
  robots: string
  ogImage: string
}

export const authors = pgTable('authors', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  profileImage: text('profile_image').notNull().default(''),
  professionalTitle: text('professional_title').notNull().default(''),
  shortBio: text('short_bio').notNull().default(''),
  longBio: jsonb('long_bio').$type<string[]>().notNull().default([]),
  expertise: jsonb('expertise').$type<{ label: string; href?: string }[]>().notNull().default([]),
  credentials: jsonb('credentials').$type<string[]>(),
  location: text('location'),
  website: text('website'),
  email: text('email'),
  socialLinks: jsonb('social_links').$type<SocialLink[]>().notNull().default([]),
  yearsExperience: integer('years_experience'),
  status: text('status').$type<'active' | 'inactive'>().notNull().default('active'),
  seo: jsonb('seo').$type<AuthorSeo>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---- Taxonomy ------------------------------------------------------------

export const taxonomyTerms = pgTable(
  'taxonomy_terms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kind: text('kind')
      .$type<
        'category' | 'subcategory' | 'occasion' | 'season' | 'tag' | 'style' | 'color' | 'audience'
      >()
      .notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    parent: text('parent'),
    indexable: boolean('indexable').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ kindSlugIdx: uniqueIndex('taxonomy_kind_slug_idx').on(t.kind, t.slug) }),
)

// ---- Content -------------------------------------------------------------
// One table for all content types. Listing/filtering fields are columns;
// the full editorial payload (blocks, ingredients, steps, seo, pinterest,
// recipe/diy data) lives in `detail` as typed JSONB.

export type ContentDetail = Record<string, unknown>

export const contentItems = pgTable(
  'content_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type')
      .$type<'article' | 'recipe' | 'diy' | 'listicle' | 'guide' | 'product-guide'>()
      .notNull(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    excerpt: text('excerpt').notNull().default(''),
    status: text('status')
      .$type<'draft' | 'review' | 'scheduled' | 'published' | 'unpublished' | 'trash'>()
      .notNull()
      .default('draft'),
    authorId: uuid('author_id').references(() => authors.id),
    authorName: text('author_name').notNull().default(''),
    featuredImage: text('featured_image').notNull().default(''),
    category: text('category').notNull().default(''),
    subcategories: jsonb('subcategories').$type<string[]>().notNull().default([]),
    occasions: jsonb('occasions').$type<string[]>().notNull().default([]),
    seasons: jsonb('seasons').$type<string[]>().notNull().default([]),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    styles: jsonb('styles').$type<string[]>().notNull().default([]),
    colors: jsonb('colors').$type<string[]>().notNull().default([]),
    audiences: jsonb('audiences').$type<string[]>().notNull().default([]),
    featured: boolean('featured').notNull().default(false),
    views: integer('views'),
    detail: jsonb('detail').$type<ContentDetail>().notNull().default({}),
    // Publishing / scheduling — drives the background publish job.
    publishedAt: timestamp('published_at', { withTimezone: true }),
    scheduledFor: timestamp('scheduled_for', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    typeSlugIdx: uniqueIndex('content_type_slug_idx').on(t.type, t.slug),
    statusIdx: index('content_status_idx').on(t.status),
    scheduledIdx: index('content_scheduled_idx').on(t.scheduledFor),
  }),
)

// ---- Media ---------------------------------------------------------------

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: text('filename').notNull(),
  kind: text('kind').$type<'image' | 'video' | 'pdf' | 'document'>().notNull().default('image'),
  format: text('format').notNull().default('JPEG'),
  role: text('role').$type<'standard' | 'pinterest' | 'social'>().notNull().default('standard'),
  url: text('url').notNull(),
  storageKey: text('storage_key'),
  title: text('title').notNull().default(''),
  alt: text('alt').notNull().default(''),
  decorative: boolean('decorative').notNull().default(false),
  caption: text('caption').notNull().default(''),
  description: text('description').notNull().default(''),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  width: integer('width').notNull().default(0),
  height: integer('height').notNull().default(0),
  sizeKb: integer('size_kb').notNull().default(0),
  meta: jsonb('meta').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---- Navigation & footer -------------------------------------------------

type NavMenu = Record<string, unknown> // MegaGroup config, featured block, etc.

export const navItems = pgTable(
  'nav_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    area: text('area').$type<'desktop' | 'mobile' | 'footer'>().notNull(),
    label: text('label').notNull(),
    destinationType: text('destination_type').notNull().default('external'),
    ref: text('ref'),
    url: text('url'),
    parentId: uuid('parent_id'),
    order: integer('order').notNull().default(0),
    enabled: boolean('enabled').notNull().default(true),
    menu: jsonb('menu').$type<NavMenu>(),
  },
  (t) => ({ areaOrderIdx: index('nav_area_order_idx').on(t.area, t.order) }),
)

// ---- Homepage ------------------------------------------------------------

export const homepageSections = pgTable('homepage_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  heading: text('heading').notNull().default(''),
  description: text('description'),
  config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
  order: integer('order').notNull().default(0),
  enabled: boolean('enabled').notNull().default(true),
  status: text('status').notNull().default('active'),
})

// ---- Collections ---------------------------------------------------------

export const collections = pgTable('collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull().default(''),
  coverImage: text('cover_image').notNull().default(''),
  contentIds: jsonb('content_ids').$type<string[]>().notNull().default([]),
  type: text('type').notNull().default('editorial'),
  status: text('status').notNull().default('draft'),
  config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
})

// ---- Redirects -----------------------------------------------------------

export const redirects = pgTable('redirects', {
  id: uuid('id').primaryKey().defaultRandom(),
  source: text('source').notNull().unique(),
  destination: text('destination').notNull(),
  type: text('type').$type<'301' | '302'>().notNull().default('301'),
  status: text('status').$type<'active' | 'disabled'>().notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---- Site settings (key/value store) ------------------------------------
// General, Header, Brand, SEO defaults, Social, Newsletter, Content defaults,
// Error pages, Advanced — each stored as one row with a JSONB value.

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---- Site integrations (verification & custom code) ----------------------
// Stores verification codes and tracking snippets pasted by the site owner
// (Google Analytics, AdSense, Search Console, Tag Manager, Bing, Pinterest,
// Meta, custom code). The saved HTML/JS is executable deployment code and is
// treated as TRUSTED administrator input — it is only ever editable by an
// authenticated admin with the 'Manage integrations' permission, is NEVER
// rendered inside the CMS, and is NEVER returned by the public API except as
// the enabled deployment snippets the public page renderer needs (see the
// /site-integrations/render endpoint).

export const siteIntegrations = pgTable(
  'site_integrations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Service key: google-analytics | google-adsense | google-search-console |
    // google-tag-manager | bing-webmaster | pinterest | meta | custom
    service: text('service').notNull(),
    name: text('name').notNull().default(''),
    enabled: boolean('enabled').notNull().default(false),
    headCode: text('head_code').notNull().default(''),
    bodyStartCode: text('body_start_code').notNull().default(''),
    bodyEndCode: text('body_end_code').notNull().default(''),
    // Service-specific extras (e.g. GTM container id, notes) — non-executable.
    settings: jsonb('settings_json').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    // Name of the admin who last changed this integration (audit trail).
    updatedBy: text('updated_by').notNull().default(''),
  },
  (t) => ({ serviceIdx: index('site_integrations_service_idx').on(t.service) }),
)

// ---- Activity log --------------------------------------------------------

export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userName: text('user_name').notNull(),
  action: text('action').notNull(),
  target: text('target').notNull().default(''),
  tone: text('tone').notNull().default('edited'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---- Relations -----------------------------------------------------------

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
  sessions: many(sessions),
}))

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const contentRelations = relations(contentItems, ({ one }) => ({
  author: one(authors, { fields: [contentItems.authorId], references: [authors.id] }),
}))
