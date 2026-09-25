/* Canonical permission + role model for the backend. Mirrors
   shared/src/permissions.ts and src/lib/admin/cms.ts — keep the three in sync
   if you change the slugs. (The backend keeps its own copy so it installs and
   builds as a fully self-contained package.) */

export const PERMISSIONS = [
  'Manage content',
  'Publish content',
  'Manage taxonomy',
  'Manage media',
  'Manage authors',
  'Manage homepage',
  'Manage navigation',
  'Manage footer',
  'Manage newsletter',
  'Manage monetization',
  'Manage SEO',
  'View analytics',
  'Manage settings',
  'Manage integrations',
  'Manage users',
  'Manage system',
] as const

export type Permission = (typeof PERMISSIONS)[number]
export type RoleName = 'Administrator' | 'Editor' | 'Author' | 'Contributor'

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  Administrator: [...PERMISSIONS],
  Editor: [
    'Manage content',
    'Publish content',
    'Manage taxonomy',
    'Manage media',
    'Manage authors',
    'Manage homepage',
    'Manage navigation',
    'Manage footer',
    'Manage newsletter',
    'Manage SEO',
  ],
  Author: ['Manage content', 'Manage media'],
  Contributor: ['Manage content'],
}

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  Administrator: 'Full access to every area, including users and system settings.',
  Editor: 'Manage and publish all content, taxonomy, media, homepage, navigation and SEO.',
  Author: 'Create and edit their own content and upload media; cannot publish.',
  Contributor: 'Draft content for review; cannot publish or manage media libraries.',
}
