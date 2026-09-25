import { api } from './client'

/* Thin, typed wrappers around the backend REST endpoints. Response shapes
   mirror backend/src/routes/*. Import these from components/hooks; pair reads
   with useApiData + a static fallback. */

// ---- Auth ----------------------------------------------------------------
export type AuthUser = { id: string; name: string; email: string; role: string; permissions?: string[] }

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: AuthUser }>('/api/auth/login', { email, password }).then((r) => r.user),
  logout: () => api.post<{ ok: true }>('/api/auth/logout'),
  me: () => api.get<{ user: AuthUser }>('/api/auth/me').then((r) => r.user),
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.post<{ ok: true }>('/api/auth/change-password', data),
  changeEmail: (data: { email: string; currentPassword: string }) =>
    api.post<{ user: AuthUser }>('/api/auth/change-email', data).then((r) => r.user),
}

// ---- Content -------------------------------------------------------------
export type ApiContentItem = {
  id: string
  type: string
  title: string
  slug: string
  excerpt: string
  status: string
  authorId?: string | null
  authorName: string
  featuredImage: string
  category: string
  subcategories: string[]
  occasions: string[]
  seasons: string[]
  tags: string[]
  styles: string[]
  colors: string[]
  audiences: string[]
  featured: boolean
  views?: number | null
  detail: Record<string, unknown>
  publishedAt: string | null
  updatedAt?: string | null
  scheduledFor?: string | null
}

export const contentApi = {
  listPublic: (type?: string) =>
    api.get<{ items: ApiContentItem[] }>(`/api/content/public${type ? `?type=${type}` : ''}`).then((r) => r.items),
  getPublic: (type: string, slug: string) =>
    api.get<{ item: ApiContentItem }>(`/api/content/public/${type}/${slug}`).then((r) => r.item),
  listAll: (status?: string) =>
    api.get<{ items: ApiContentItem[] }>(`/api/content${status ? `?status=${status}` : ''}`).then((r) => r.items),
  get: (id: string) => api.get<{ item: ApiContentItem }>(`/api/content/${id}`).then((r) => r.item),
  create: (data: Partial<ApiContentItem>) => api.post<{ item: ApiContentItem }>('/api/content', data).then((r) => r.item),
  update: (id: string, data: Partial<ApiContentItem>) =>
    api.put<{ item: ApiContentItem }>(`/api/content/${id}`, data).then((r) => r.item),
  remove: (id: string) => api.del<{ item: ApiContentItem }>(`/api/content/${id}`),
}

// ---- Site config ---------------------------------------------------------
export type ApiNavItem = {
  id: string
  label: string
  destinationType: string
  url: string | null
  ref: string | null
  order: number
  enabled: boolean
  menu: Record<string, unknown> | null
}

export const siteApi = {
  nav: (area: 'desktop' | 'mobile' | 'footer') =>
    api.get<{ items: ApiNavItem[] }>(`/api/site/nav/${area}`).then((r) => r.items),
  homepage: () => api.get<{ sections: unknown[] }>('/api/site/homepage').then((r) => r.sections),
  settings: () => api.get<{ settings: Record<string, unknown> }>('/api/site/settings').then((r) => r.settings),
  setting: (key: string) => api.get<{ value: unknown }>(`/api/site/settings/${key}`).then((r) => r.value),
  saveSetting: (key: string, value: unknown) => api.put(`/api/site/settings/${key}`, { value }),
  saveNav: (area: string, items: unknown[]) => api.put(`/api/site/nav/${area}`, { items }),
  adminPath: () => api.get<{ path: string }>('/api/site/admin-path').then((r) => r.path),
  saveAdminPath: (path: string) => api.put<{ path: string }>('/api/site/admin-path', { path }).then((r) => r.path),
}

// ---- Site integrations (verification & custom code) ----------------------
export type ApiIntegration = {
  id: string
  service: string
  name: string
  enabled: boolean
  headCode: string
  bodyStartCode: string
  bodyEndCode: string
  settings: Record<string, unknown>
  createdAt: string
  updatedAt: string
  updatedBy: string
}

export type IntegrationInput = {
  service: string
  name?: string
  enabled?: boolean
  headCode?: string
  bodyStartCode?: string
  bodyEndCode?: string
  settings?: Record<string, unknown>
}

/** Only the enabled deployment snippets the public page renderer needs. */
export type RenderSnippets = { head: string; bodyStart: string; bodyEnd: string }

export const integrationsApi = {
  list: () =>
    api.get<{ integrations: ApiIntegration[] }>('/api/admin/site-integrations').then((r) => r.integrations),
  get: (id: string) =>
    api.get<{ integration: ApiIntegration }>(`/api/admin/site-integrations/${id}`).then((r) => r.integration),
  create: (data: IntegrationInput) =>
    api.post<{ integration: ApiIntegration }>('/api/admin/site-integrations', data).then((r) => r.integration),
  update: (id: string, data: IntegrationInput) =>
    api.put<{ integration: ApiIntegration }>(`/api/admin/site-integrations/${id}`, data).then((r) => r.integration),
  remove: (id: string) => api.del<{ ok: true }>(`/api/admin/site-integrations/${id}`),
  // Public: enabled snippets only, for the SiteCodeInjector.
  render: () => api.get<RenderSnippets>('/api/site-integrations/render'),
}

// ---- Taxonomy / authors --------------------------------------------------
export const taxonomyApi = {
  list: () => api.get<{ terms: unknown[] }>('/api/taxonomy').then((r) => r.terms),
}
export const authorsApi = {
  list: () => api.get<{ authors: unknown[] }>('/api/authors').then((r) => r.authors),
  get: (slug: string) => api.get<{ author: unknown }>(`/api/authors/${slug}`).then((r) => r.author),
}
