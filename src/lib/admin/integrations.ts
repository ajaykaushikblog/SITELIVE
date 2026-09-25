/* =========================================================================
   Verification & Custom Code — service catalog (front-end metadata).

   Describes the integrations the CMS supports and which code placements each
   one uses. The actual codes are stored in the real database (site_integrations
   table) and edited through /admin/site/verification; nothing here is a code
   value. When no backend is configured the manager renders this catalog with
   empty, disabled cards so the prototype UI still works.
   ========================================================================= */

export type Placement = 'head' | 'bodyStart' | 'bodyEnd'

export type ServiceDef = {
  service: string
  label: string
  description: string
  help: string
  /** Placements this service actually uses (drives which textareas show). */
  placements: Placement[]
  /** Allow multiple saved snippets of this service (e.g. Custom Code). */
  multiple?: boolean
}

export const placementLabels: Record<Placement, string> = {
  head: 'Head (<head>)',
  bodyStart: 'Body start (after <body>)',
  bodyEnd: 'Body end (before </body>)',
}

export const integrationServices: ServiceDef[] = [
  {
    service: 'google-analytics',
    label: 'Google Analytics',
    description: 'GA4 measurement / gtag.js tracking for site traffic.',
    help: 'Paste the complete Google Analytics (GA4) snippet. It is injected into the <head> of every public page when enabled.',
    placements: ['head'],
  },
  {
    service: 'google-adsense',
    label: 'Google AdSense',
    description: 'AdSense verification / ad serving script.',
    help: 'Paste the AdSense verification or ad script. It is injected into the <head> when enabled.',
    placements: ['head'],
  },
  {
    service: 'google-search-console',
    label: 'Google Search Console',
    description: 'Site ownership verification for Google Search.',
    help: 'Paste either the full <meta name="google-site-verification" …> tag or the complete verification snippet. It is injected into the <head> of every public page.',
    placements: ['head'],
  },
  {
    service: 'google-tag-manager',
    label: 'Google Tag Manager',
    description: 'GTM container — supports a head script and a body (noscript) tag.',
    help: 'Paste the GTM head code and the body code separately. The head code goes in <head>; the body code is injected immediately after <body>.',
    placements: ['head', 'bodyStart'],
  },
  {
    service: 'bing-webmaster',
    label: 'Bing Webmaster Tools',
    description: 'Site ownership verification for Bing.',
    help: 'Paste the <meta> verification tag provided by Bing Webmaster Tools. It is injected into the <head>.',
    placements: ['head'],
  },
  {
    service: 'pinterest',
    label: 'Pinterest',
    description: 'Pinterest site verification / tag.',
    help: 'Paste the Pinterest verification <meta> tag or tag snippet. It is injected into the <head>.',
    placements: ['head'],
  },
  {
    service: 'meta',
    label: 'Meta / Facebook',
    description: 'Meta domain verification / Facebook Pixel.',
    help: 'Paste the Meta domain-verification <meta> tag or the Facebook Pixel script. It is injected into the <head>.',
    placements: ['head'],
  },
  {
    service: 'custom',
    label: 'Custom Code',
    description: 'Your own snippets — head, body start and body end.',
    help: 'Add any custom HTML/JavaScript. Use the three fields to control exactly where each snippet is injected. You can add multiple custom snippets.',
    placements: ['head', 'bodyStart', 'bodyEnd'],
    multiple: true,
  },
]

export function serviceDef(service: string): ServiceDef {
  return (
    integrationServices.find((s) => s.service === service) ?? {
      service,
      label: service,
      description: '',
      help: '',
      placements: ['head', 'bodyStart', 'bodyEnd'],
    }
  )
}

/** The shape the manager edits — mirrors the backend row without server-only fields. */
export type IntegrationRow = {
  id: string | null // null → not yet persisted
  service: string
  name: string
  enabled: boolean
  headCode: string
  bodyStartCode: string
  bodyEndCode: string
  updatedAt: string | null
  updatedBy: string
}

export function emptyRow(service: string): IntegrationRow {
  return {
    id: null,
    service,
    name: serviceDef(service).label,
    enabled: false,
    headCode: '',
    bodyStartCode: '',
    bodyEndCode: '',
    updatedAt: null,
    updatedBy: '',
  }
}
