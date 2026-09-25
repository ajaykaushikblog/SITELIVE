/* =========================================================================
   Canonical permission + role model, shared between backend (enforcement)
   and frontend (control visibility). Mirrors src/lib/admin/cms.ts so the
   prototype UI and the real API agree on the same slugs.
   ========================================================================= */

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

/** Default permission sets per role. Administrator implicitly holds all. */
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
