import { type Article, type Season, img, authors } from './content'
import { type AuthorBio, articlesBySlug } from './articles'
import { recipesBySlug } from './recipes'

/* =========================================================================
   Universal DIY / tutorial model.
   A specialized how-to template inside the same publishing system. Every
   field is dynamic (CMS-driven) and optional fields gracefully disappear
   when empty, so ONE template renders a macrame ornament, a pumpkin-
   painting project or a wedding centerpiece identically — only the data
   and the seasonal accent change.
   ========================================================================= */

export type Material = {
  qty?: number
  unit?: string
  name: string
  note?: string
}

export type MaterialGroup = {
  title?: string
  items: Material[]
}

export type ProjectStep = {
  title?: string
  text: string
  image?: string
  gallery?: { src: string; alt: string }[]
  video?: string
}

export type DIYProduct = {
  name: string
  blurb: string
  price?: string
  image: string
  href: string
}

export type DIYFull = {
  id: string
  title: string
  slug: string
  description: string
  featuredImage: string
  imageAlt: string
  imageCaption?: string
  imageCredit?: string
  pinterestImage?: string
  author: AuthorBio
  publishedDate: string
  updatedDate?: string
  readTime?: string
  category: string
  subcategory?: string
  occasions: string[]
  seasons: string[]
  tags: string[]
  styles: string[]
  audiences: string[]
  contentType?: string

  /* quick details — all optional, hidden when absent */
  difficulty?: string
  timeRequired?: string
  estimatedCost?: string
  projectType?: string

  materialGroups: MaterialGroup[]
  tools?: string[]
  steps: ProjectStep[]

  tips?: string[]
  notes?: string[]
  commonMistakes?: string[]
  variations?: string[]
  substitutions?: string[]
  safetyNotes?: string[]
  storage?: string
  makeAhead?: string

  finishedGallery?: { src: string; alt: string }[]
  products?: DIYProduct[]

  season?: Season
  breadcrumb: { label: string; href: string }[]
  pinterest: { title: string; description: string; image: string }
  seo: {
    seoTitle: string
    metaDescription: string
    canonicalUrl: string
    robots: string
    ogImage: string
    schemaType: 'HowTo'
  }
  status: 'published' | 'draft'
  relatedProjects?: string[]
}

/* author bios reused for consistency with article/recipe layers */
const bios = {
  alicia: {
    ...authors.alicia,
    bio: 'Alicia is our home & holidays editor, sharing handmade decor, seasonal crafts and cozy projects made for real homes and busy weekends.',
    expertise: ['DIY', 'Holiday Crafts', 'Home Decor'],
    socials: [
      { label: 'Pinterest', href: '#' },
      { label: 'Instagram', href: '#' },
    ],
    href: '/author/alicia-butner',
  } as AuthorBio,
  amanda: {
    ...authors.amanda,
    bio: 'Amanda is a lifestyle writer specializing in weddings and celebrations — always chasing the handmade details that make a gathering feel personal.',
    expertise: ['Weddings', 'Celebrations', 'Florals'],
    socials: [
      { label: 'Pinterest', href: '#' },
      { label: 'Instagram', href: '#' },
    ],
    href: '/author/amanda-thompson',
  } as AuthorBio,
}

/* ======================= EXAMPLE 1 — Macrame Snowflakes ======================= */
const macrameSnowflakes: DIYFull = {
  id: 'diy-macrame-snowflakes',
  title: 'DIY Macrame Snowflake Ornaments',
  slug: 'macrame-snowflakes',
  description:
    'A simple, meditative handmade Christmas decoration you can make with basic cotton cord and a few beads — no macrame experience required.',
  featuredImage: img('1481349518771-20055b2a7b24', 1400, 900),
  imageAlt: 'Handmade macrame snowflake ornaments on a wooden table',
  imageCaption: 'Soft cotton snowflakes that look beautiful on the tree or strung along a mantel.',
  imageCredit: 'Photo: Element5 Digital',
  pinterestImage: img('1481349518771-20055b2a7b24', 1000, 1500),
  author: bios.alicia,
  publishedDate: 'December 12, 2026',
  updatedDate: 'December 14, 2026',
  readTime: '9 min read',
  category: 'DIY & Crafts',
  subcategory: 'Christmas Crafts',
  occasions: ['Christmas'],
  seasons: ['Winter'],
  tags: ['Macrame', 'Christmas Crafts', 'Ornaments', 'Handmade'],
  styles: ['Rustic', 'Cozy'],
  audiences: ['Adults', 'Beginners'],
  contentType: 'Tutorial',
  difficulty: 'Easy',
  timeRequired: '25 min',
  estimatedCost: '$10',
  projectType: 'Paper & Fiber Craft',
  season: 'christmas',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'DIY & Crafts', href: '/diy' },
    { label: 'Christmas Crafts', href: '/diy/christmas-crafts' },
    { label: 'DIY Macrame Snowflake Ornaments', href: '/diy/macrame-snowflakes' },
  ],
  materialGroups: [
    {
      items: [
        { qty: 10, unit: 'ft', name: 'cotton macrame cord', note: '3mm' },
        { qty: 6, name: 'wooden beads' },
        { qty: 1, name: 'metal ring', note: '2-inch, for the base' },
        { name: 'Twine', note: 'for hanging' },
      ],
    },
  ],
  tools: ['Scissors', 'Ruler', 'Fine comb', 'Fabric stiffener (optional)'],
  steps: [
    { title: 'Prepare the materials', text: 'Cut the cotton cord into eight 12-inch lengths. Comb out the ends now so fringing is easier later.' },
    { title: 'Create the first knots', text: 'Fold each cord in half and attach it to the metal ring with a lark’s-head knot, spacing them evenly around the circle.', image: img('1607920592519-bab2a80a2cb7', 900, 600) },
    { title: 'Build the snowflake pattern', text: 'Working in pairs, tie a row of square knots, then a second offset row to form the classic six-point snowflake lattice.', gallery: [
      { src: img('1512909006721-3d6018887383', 700, 700), alt: 'Tying square knots' },
      { src: img('1607920592519-bab2a80a2cb7', 700, 700), alt: 'Snowflake lattice forming' },
    ] },
    { title: 'Shape and add beads', text: 'Thread a wooden bead onto every other strand to weigh the points, then trim the ends to even lengths.' },
    { title: 'Add the finishing details', text: 'Comb out the fringe, mist lightly with fabric stiffener to hold the shape, and attach a twine loop for hanging.' },
  ],
  tips: ['Work on a corkboard with pins to keep tension even.', 'A little fabric stiffener makes the snowflakes hold their crisp shape for years.'],
  commonMistakes: ['Cutting cord too short — always leave extra for fringe.', 'Uneven tension, which makes the snowflake look lopsided.'],
  variations: ['Use silver or gold cord for a more formal look.', 'Skip the beads for a minimalist Scandinavian style.'],
  storage: 'Store flat between sheets of tissue paper to keep the points from crushing.',
  finishedGallery: [
    { src: img('1481349518771-20055b2a7b24', 700, 700), alt: 'Finished macrame snowflake' },
    { src: img('1512484346026-44def92f7385', 700, 700), alt: 'Snowflakes on a tree' },
    { src: img('1543589077-47d81606c1bf', 700, 700), alt: 'Snowflakes on a mantel' },
  ],
  products: [
    { name: '3mm Cotton Macrame Cord', blurb: 'A soft, natural single-strand cord that combs into a beautiful fringe.', price: '$12', image: img('1607920592519-bab2a80a2cb7', 400, 400), href: '#' },
    { name: 'Natural Wooden Beads', blurb: 'Unfinished beads in mixed sizes for weighting and detail.', price: '$8', image: img('1512909006721-3d6018887383', 400, 400), href: '#' },
  ],
  pinterest: {
    title: 'DIY Macrame Snowflake Ornaments ❄️',
    description: 'An easy handmade Christmas decoration you can make with basic cord and beads.',
    image: img('1481349518771-20055b2a7b24', 1000, 1500),
  },
  seo: {
    seoTitle: 'DIY Macrame Snowflake Ornaments (Easy Step-by-Step Tutorial)',
    metaDescription:
      'Make beautiful DIY macrame snowflake ornaments with this easy step-by-step tutorial — basic cotton cord, wooden beads and no experience needed.',
    canonicalUrl: 'https://marigoldandmaple.com/diy/macrame-snowflakes',
    robots: 'index,follow',
    ogImage: img('1481349518771-20055b2a7b24', 1200, 630),
    schemaType: 'HowTo',
  },
  status: 'published',
  relatedProjects: ['pumpkin-painting', 'wedding-centerpiece'],
}

/* ======================= EXAMPLE 2 — Pumpkin Painting ======================= */
const pumpkinPainting: DIYFull = {
  id: 'diy-pumpkin-painting',
  title: 'Easy Halloween Pumpkin Painting',
  slug: 'pumpkin-painting',
  description:
    'A mess-friendly, no-carve pumpkin project the whole family can do together — all you need are craft paints and a few real or faux pumpkins.',
  featuredImage: img('1602457471441-e7099c989338', 1400, 900),
  imageAlt: 'Painted decorative pumpkins on a fall table',
  imageCaption: 'No-carve painted pumpkins last for weeks and skip the mess entirely.',
  imageCredit: 'Photo: Kira auf der Heide',
  pinterestImage: img('1602457471441-e7099c989338', 1000, 1500),
  author: bios.alicia,
  publishedDate: 'October 1, 2026',
  readTime: '6 min read',
  category: 'DIY & Crafts',
  subcategory: 'Holiday Crafts',
  occasions: ['Halloween'],
  seasons: ['Fall'],
  tags: ['Halloween', 'Pumpkins', 'Painting', 'Kids Crafts'],
  styles: ['Fun', 'Family-friendly'],
  audiences: ['Kids', 'Families'],
  contentType: 'Tutorial',
  difficulty: 'Easy',
  timeRequired: '45 min',
  estimatedCost: '$15',
  projectType: 'Painting',
  season: 'halloween',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'DIY & Crafts', href: '/diy' },
    { label: 'Holiday Crafts', href: '/diy/holiday-crafts' },
    { label: 'Easy Halloween Pumpkin Painting', href: '/diy/pumpkin-painting' },
  ],
  materialGroups: [
    {
      title: 'For Painting',
      items: [
        { qty: 3, name: 'small pumpkins', note: 'real or faux' },
        { qty: 1, unit: 'set', name: 'acrylic craft paints' },
        { name: 'Paint brushes', note: 'assorted sizes' },
        { name: 'Painter’s tape', note: 'for clean patterns' },
      ],
    },
    {
      title: 'For Finishing',
      items: [
        { qty: 1, name: 'clear acrylic sealer' },
        { name: 'Gold leaf or gems', note: 'optional' },
      ],
    },
  ],
  tools: ['Drop cloth', 'Paper plates for a palette', 'Cup of water'],
  steps: [
    { title: 'Prep your surface', text: 'Wipe the pumpkins clean and dry, then lay down a drop cloth. Faux pumpkins work best if you want to keep them year to year.' },
    { title: 'Paint the base coat', text: 'Give each pumpkin a solid base color and let it dry fully — a second coat gives the richest, most even finish.', image: img('1633955810370-0bbcbdba3e5f', 900, 600) },
    { title: 'Add your design', text: 'Use painter’s tape for crisp stripes or free-hand simple faces, moons and dots. Keep kids’ designs bold and forgiving.' },
    { title: 'Add finishing touches', text: 'Dab on gold leaf, glue a few gems, or add metallic dots once the paint is dry.' },
    { title: 'Seal and display', text: 'Finish with a light coat of clear acrylic sealer so the paint stays put, then arrange your pumpkins on the porch or table.' },
  ],
  tips: ['Let each color dry before adding the next to avoid muddy blending.', 'Faux pumpkins can be stored and reused every year.'],
  safetyNotes: ['Use non-toxic paints for young children and supervise sealer application in a ventilated space.'],
  variations: ['Go monochrome white-on-white for an elegant, non-spooky look.', 'Try a metallic ombre for a grown-up mantel display.'],
  finishedGallery: [
    { src: img('1602457471441-e7099c989338', 700, 700), alt: 'Painted pumpkin group' },
    { src: img('1603528283899-d15c8832de80', 700, 700), alt: 'Pumpkins on a porch' },
  ],
  products: [
    { name: 'Acrylic Craft Paint Set', blurb: '24 rich, fast-drying colors that work on real and faux pumpkins.', price: '$18', image: img('1633955810370-0bbcbdba3e5f', 400, 400), href: '#' },
  ],
  pinterest: {
    title: 'Easy No-Carve Halloween Pumpkin Painting 🎃',
    description: 'A mess-friendly painted pumpkin project the whole family can do together.',
    image: img('1602457471441-e7099c989338', 1000, 1500),
  },
  seo: {
    seoTitle: 'Easy Halloween Pumpkin Painting (No-Carve Family Craft)',
    metaDescription:
      'Skip the mess with this easy no-carve Halloween pumpkin painting tutorial — simple designs, kid-friendly steps and painted pumpkins that last for weeks.',
    canonicalUrl: 'https://marigoldandmaple.com/diy/pumpkin-painting',
    robots: 'index,follow',
    ogImage: img('1602457471441-e7099c989338', 1200, 630),
    schemaType: 'HowTo',
  },
  status: 'published',
  relatedProjects: ['macrame-snowflakes', 'wedding-centerpiece'],
}

/* ======================= EXAMPLE 3 — Wedding Centerpiece ======================= */
const weddingCenterpiece: DIYFull = {
  id: 'diy-wedding-centerpiece',
  title: 'DIY Wedding Table Centerpiece',
  slug: 'wedding-centerpiece',
  description:
    'Create a lush, budget-friendly wedding centerpiece with seasonal blooms and greenery — a florist-worthy arrangement you can make the day before.',
  featuredImage: img('1590683673322-0f3fabd72169', 1400, 900),
  imageAlt: 'Handmade wedding centerpiece with florals and candles',
  imageCaption: 'A loose, garden-style centerpiece that looks effortless on any reception table.',
  imageCredit: 'Photo: Photos by Lanty',
  pinterestImage: img('1590683673322-0f3fabd72169', 1000, 1500),
  author: bios.amanda,
  publishedDate: 'August 20, 2026',
  readTime: '11 min read',
  category: 'Weddings',
  subcategory: 'Wedding Decor',
  occasions: [],
  seasons: ['Spring', 'Summer'],
  tags: ['Wedding DIY', 'Centerpiece', 'Florals', 'Tablescapes'],
  styles: ['Elegant', 'Romantic'],
  audiences: ['Couples', 'Hosts'],
  contentType: 'Tutorial',
  difficulty: 'Intermediate',
  timeRequired: '1 hr',
  estimatedCost: '$35',
  projectType: 'Floral Project',
  season: 'wedding',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Weddings', href: '/weddings' },
    { label: 'Wedding Decor', href: '/weddings/decor' },
    { label: 'DIY Wedding Table Centerpiece', href: '/diy/wedding-centerpiece' },
  ],
  materialGroups: [
    {
      title: 'Florals',
      items: [
        { qty: 12, name: 'focal blooms', note: 'roses, peonies or dahlias' },
        { qty: 8, name: 'secondary flowers', note: 'ranunculus or spray roses' },
        { qty: 1, unit: 'bunch', name: 'mixed greenery', note: 'eucalyptus & ferns' },
      ],
    },
    {
      title: 'Vessel & Base',
      items: [
        { qty: 1, name: 'low ceramic bowl or compote' },
        { qty: 1, name: 'floral frog or chicken wire' },
        { name: 'Floral tape', note: 'waterproof' },
      ],
    },
  ],
  tools: ['Sharp floral snips', 'Bucket for conditioning', 'Watering can'],
  steps: [
    { title: 'Condition the flowers', text: 'Trim stems at an angle and let all the flowers and greenery drink in cool water for a few hours (ideally overnight) before arranging.' },
    { title: 'Prepare the vessel', text: 'Secure a floral frog or a ball of chicken wire in the bowl with waterproof tape to create a grid that holds stems in place.', image: img('1561593367-66c79c2294e6', 900, 600) },
    { title: 'Build the greenery base', text: 'Start with greenery to establish a loose, asymmetrical shape roughly 1.5× the width of the bowl.', gallery: [
      { src: img('1632528011905-54e2464961f4', 700, 700), alt: 'Greenery base' },
      { src: img('1590683673322-0f3fabd72169', 700, 700), alt: 'Adding focal blooms' },
    ] },
    { title: 'Add focal blooms', text: 'Place your largest flowers in a gentle triangle, then fill with secondary blooms at varying heights for a natural, gathered feel.' },
    { title: 'Finish and refresh', text: 'Tuck in trailing greenery, top up the water, and mist lightly. Keep cool until the reception.' },
  ],
  tips: ['Buy flowers 2 days ahead so they open to their peak on the day.', 'Odd numbers of focal blooms always look more natural.'],
  commonMistakes: ['Cutting stems too short to adjust later — leave them long at first.', 'Overcrowding, which flattens the arrangement.'],
  variations: ['Swap in dried florals for a keepsake version.', 'Add taper candles for a candlelit reception look.'],
  substitutions: ['Use a mason jar and chicken wire if you don’t have a compote.'],
  makeAhead: 'Build the arrangement the evening before and store in a cool room or refrigerator overnight.',
  finishedGallery: [
    { src: img('1590683673322-0f3fabd72169', 700, 700), alt: 'Finished centerpiece' },
    { src: img('1519225421980-715cb0215aed', 700, 700), alt: 'Centerpiece on a set table' },
    { src: img('1632528011905-54e2464961f4', 700, 700), alt: 'Outdoor reception table' },
  ],
  products: [
    { name: 'Ceramic Compote Vase', blurb: 'A low footed bowl that’s the secret to florist-style arrangements.', price: '$26', image: img('1561593367-66c79c2294e6', 400, 400), href: '#' },
    { name: 'Japanese Floral Snips', blurb: 'Precise, clean cuts that keep stems drinking longer.', price: '$19', image: img('1632528011905-54e2464961f4', 400, 400), href: '#' },
  ],
  pinterest: {
    title: 'DIY Wedding Table Centerpiece 💍',
    description: 'A lush, budget-friendly wedding centerpiece you can make the day before.',
    image: img('1590683673322-0f3fabd72169', 1000, 1500),
  },
  seo: {
    seoTitle: 'DIY Wedding Table Centerpiece (Florist-Worthy on a Budget)',
    metaDescription:
      'Make a lush DIY wedding table centerpiece with this step-by-step tutorial — seasonal blooms, greenery and pro florist techniques on a budget.',
    canonicalUrl: 'https://marigoldandmaple.com/diy/wedding-centerpiece',
    robots: 'index,follow',
    ogImage: img('1590683673322-0f3fabd72169', 1200, 630),
    schemaType: 'HowTo',
  },
  status: 'published',
  relatedProjects: ['macrame-snowflakes', 'pumpkin-painting'],
}

export const diyBySlug: Record<string, DIYFull> = {
  'macrame-snowflakes': macrameSnowflakes,
  'pumpkin-painting': pumpkinPainting,
  'wedding-centerpiece': weddingCenterpiece,
}

export function getDIY(slug: string): DIYFull | undefined {
  return diyBySlug[slug]
}

/* Card object for a project (used in related grids) */
const diyCard = (d: DIYFull): Article => ({
  id: d.id,
  title: d.title,
  category: d.subcategory || d.category,
  href: `/diy/${d.slug}`,
  image: d.featuredImage,
  author: d.author,
  date: d.publishedDate,
  readTime: d.timeRequired,
})

/* Related projects (approx. 10): explicit picks first, then relevance by
   shared category / occasion / season / tags / style, then cross-links. */
export function relatedProjects(d: DIYFull): Article[] {
  const others = Object.values(diyBySlug).filter((x) => x.slug !== d.slug)

  const score = (x: DIYFull) => {
    let s = 0
    if (x.category === d.category) s += 3
    if (x.subcategory && x.subcategory === d.subcategory) s += 3
    s += x.occasions.filter((o) => d.occasions.includes(o)).length * 2
    s += x.seasons.filter((se) => d.seasons.includes(se)).length
    s += x.tags.filter((t) => d.tags.includes(t)).length
    s += x.styles.filter((t) => d.styles.includes(t)).length
    return s
  }

  const explicit = (d.relatedProjects ?? [])
    .map((s) => diyBySlug[s])
    .filter(Boolean) as DIYFull[]

  const ranked = others
    .filter((x) => !explicit.includes(x))
    .sort((a, b) => score(b) - score(a))

  const projectCards = [...explicit, ...ranked].map(diyCard)

  /* Top up to ~10 with cross-links to existing recipes & articles */
  const crossCards = [
    ...Object.values(recipesBySlug).map((r) => ({
      id: r.id,
      title: r.title,
      category: r.subcategory || r.category,
      href: `/recipe/${r.slug}`,
      image: r.featuredImage,
      author: r.author,
      date: r.publishedDate,
    })),
    ...Object.values(articlesBySlug).map((a) => ({
      id: a.id,
      title: a.title,
      category: a.subcategory || a.category,
      href: `/article/${a.slug}`,
      image: a.featuredImage,
      author: a.author,
      date: a.publishedDate,
    })),
  ]

  return [...projectCards, ...crossCards].slice(0, 10)
}
