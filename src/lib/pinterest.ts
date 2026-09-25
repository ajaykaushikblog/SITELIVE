/* =========================================================================
   Universal Pinterest content & sharing system — configuration layer.

   Reusable data shapes + helpers for Pinterest-first publishing and social
   sharing across every content type. Front-end only: real Pinterest API and
   automated pin image generation get wired to these shapes later.
   ========================================================================= */

export const SITE_URL = 'https://marigoldandmaple.com'

/* Primary pin spec — vertical 2:3. */
export const PIN_SPEC = { width: 1000, height: 1500, ratio: '2 / 3', label: '1000 × 1500' }

/* ---- Pin templates (visual presets; production can export the image) ---- */

export type PinTemplateId =
  | 'standard'
  | 'recipe'
  | 'holiday'
  | 'beauty'
  | 'diy'
  | 'wedding'
  | 'home-decor'
  | 'gift-guide'
  | 'listicle'

export type PinTemplate = {
  id: PinTemplateId
  label: string
  /** How the title band sits over the image. */
  layout: 'lower' | 'center' | 'band' | 'split'
  /** Seasonal accent hint used for the template chrome. */
  accent: string
  description: string
}

export const pinTemplates: PinTemplate[] = [
  { id: 'standard', label: 'Standard', layout: 'lower', accent: '#b1543c', description: 'Editorial article' },
  { id: 'recipe', label: 'Recipe', layout: 'band', accent: '#b5502a', description: 'Food & recipes' },
  { id: 'holiday', label: 'Holiday', layout: 'center', accent: '#2f6b4f', description: 'Occasions & seasons' },
  { id: 'beauty', label: 'Beauty', layout: 'lower', accent: '#c14e73', description: 'Beauty & nails' },
  { id: 'diy', label: 'DIY', layout: 'band', accent: '#c1611f', description: 'Crafts & tutorials' },
  { id: 'wedding', label: 'Wedding', layout: 'center', accent: '#9a7b53', description: 'Weddings & showers' },
  { id: 'home-decor', label: 'Home Decor', layout: 'split', accent: '#7c7064', description: 'Interiors & styling' },
  { id: 'gift-guide', label: 'Gift Guide', layout: 'band', accent: '#b1543c', description: 'Curated collections' },
  { id: 'listicle', label: 'Listicle', layout: 'center', accent: '#c08a3e', description: 'Numbered idea lists' },
]

export function getTemplate(id: PinTemplateId): PinTemplate {
  return pinTemplates.find((t) => t.id === id) ?? pinTemplates[0]
}

/* ---- Reusable CMS data model ---- */

export type AlternatePin = {
  id: string
  title: string
  description: string
  image: string
  template: PinTemplateId
  isPrimary: boolean
}

export type PinterestMeta = {
  enabled: boolean
  title: string
  description: string
  primaryImage: string
  template: PinTemplateId
  alternatePins: AlternatePin[]
}

export type SocialMeta = {
  enabled: boolean
  title: string
  description: string
  image: string
}

/* ---- Sharing helpers (canonical URL always) ---- */

/** Absolute canonical URL for a piece of content (Pinterest must never point
 *  at a tracking-only or duplicate URL). */
export function canonical(path: string): string {
  if (/^https?:/.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export function pinterestSaveUrl(opts: { url: string; image: string; description: string }): string {
  const p = new URLSearchParams({
    url: canonical(opts.url),
    media: opts.image,
    description: opts.description,
  })
  return `https://pinterest.com/pin/create/button/?${p.toString()}`
}

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical(url))}`
}

export function xShareUrl(url: string, text: string): string {
  const p = new URLSearchParams({ url: canonical(url), text })
  return `https://twitter.com/intent/tweet?${p.toString()}`
}

/* ---- Validation indicators (UI only) ---- */

export type PinValidation = {
  title: boolean
  description: boolean
  image: boolean
  ratio: boolean
  destination: boolean
}

export function validatePin(meta: Pick<PinterestMeta, 'title' | 'description' | 'primaryImage'>, destination: string): PinValidation {
  return {
    title: meta.title.trim().length > 0 && meta.title.length <= 100,
    description: meta.description.trim().length >= 20,
    image: meta.primaryImage.trim().length > 0,
    // treat any 1000×1500-style asset as valid; real check happens on upload
    ratio: /1500|1000x1500|2:3|2x3/.test(meta.primaryImage) || meta.primaryImage.includes('w=1000'),
    destination: destination.trim().length > 0,
  }
}

/* ---- Sample content for CMS previews (dynamic across taxonomy) ---- */

const pinImg = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1000&h=1500&fit=crop&q=80`

export type PinContentSample = {
  id: string
  label: string
  category: string
  destination: string
  season?: string
  pinterest: PinterestMeta
  social: SocialMeta
}

export const pinContentSamples: PinContentSample[] = [
  {
    id: 'christmas-nails',
    label: '25 Elegant Christmas Nail Ideas',
    category: 'Christmas · Nails',
    destination: '/christmas/christmas-nail-ideas',
    season: 'christmas',
    pinterest: {
      enabled: true,
      title: '25 Elegant Christmas Nail Ideas',
      description:
        'Festive, elegant Christmas nail designs — from classic red and gold to minimalist snowflakes. Save this for your holiday manicure inspiration.',
      primaryImage: pinImg('1607779097040-26e80aa78e66'),
      template: 'beauty',
      alternatePins: [
        { id: 'a1', title: 'Classic Red & Gold Christmas Nails', description: 'Timeless festive manicures in red and shimmering gold.', image: pinImg('1522337660859-02fbefca4702'), template: 'beauty', isPrimary: false },
        { id: 'a2', title: 'Minimalist Snowflake Nails', description: 'Delicate snowflake accents on a soft neutral base.', image: pinImg('1519014816548-bf5fe059798b'), template: 'beauty', isPrimary: false },
      ],
    },
    social: {
      enabled: true,
      title: '25 Elegant Christmas Nail Ideas for the Holidays',
      description: 'Our editors’ favorite festive manicures, from classic to minimalist.',
      image: pinImg('1607779097040-26e80aa78e66'),
    },
  },
  {
    id: 'halloween-party',
    label: '25 Halloween Party Ideas',
    category: 'Halloween · Entertaining',
    destination: '/halloween/halloween-party-ideas',
    season: 'halloween',
    pinterest: {
      enabled: true,
      title: '25 Halloween Party Ideas',
      description:
        'Everything you need for an unforgettable Halloween party — food, décor, games and drinks. Save the whole guide.',
      primaryImage: pinImg('1509557965875-b88c97052f0e'),
      template: 'holiday',
      alternatePins: [
        { id: 'h1', title: 'Halloween Food Ideas', description: 'Spooky-cute bites and treats for a crowd.', image: pinImg('1478147427282-58a87a120781'), template: 'holiday', isPrimary: false },
        { id: 'h2', title: 'Halloween Decor Ideas', description: 'Moody, elegant décor that isn’t tacky.', image: pinImg('1572490122747-3968b75cc699'), template: 'home-decor', isPrimary: false },
        { id: 'h3', title: 'Halloween Party Games', description: 'Games for kids and adults alike.', image: pinImg('1603484477859-abe6a73f9366'), template: 'listicle', isPrimary: false },
        { id: 'h4', title: 'Halloween Drinks', description: 'Signature cocktails and mocktails.', image: pinImg('1541976076758-347942db1970'), template: 'recipe', isPrimary: false },
      ],
    },
    social: {
      enabled: true,
      title: '25 Halloween Party Ideas Your Guests Will Love',
      description: 'Food, décor, games and drinks for a memorable night.',
      image: pinImg('1509557965875-b88c97052f0e'),
    },
  },
  {
    id: 'garlic-pasta',
    label: 'Easy Creamy Garlic Pasta',
    category: 'Recipes · Dinner',
    destination: '/recipe/creamy-garlic-pasta',
    pinterest: {
      enabled: true,
      title: 'Easy Creamy Garlic Pasta',
      description:
        'A weeknight-easy creamy garlic pasta ready in 20 minutes. Save this recipe for your next dinner.',
      primaryImage: pinImg('1621996346565-e3dbc353d2e5'),
      template: 'recipe',
      alternatePins: [],
    },
    social: {
      enabled: true,
      title: 'Easy Creamy Garlic Pasta (20 Minutes)',
      description: 'The weeknight dinner you’ll make on repeat.',
      image: pinImg('1621996346565-e3dbc353d2e5'),
    },
  },
]
