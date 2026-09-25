import { type Article, type Season, type Author, img, authors } from './content'

/* =========================================================================
   Universal article model.
   Content is a block array so ANY article type (listicle, guide, inspiration,
   seasonal, beauty, wedding, gift guide, food…) is composed from the same
   reusable blocks. Nothing is category-specific.
   ========================================================================= */

export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string; credit?: string }
  | { type: 'gallery'; images: { src: string; alt: string }[] }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'checklist'; items: string[] }
  | { type: 'callout'; variant: 'tip' | 'info' | 'note'; title?: string; text: string }
  | { type: 'video'; title: string; poster: string }
  | { type: 'product'; name: string; blurb: string; price?: string; image: string; href: string }
  | { type: 'ad'; format: 'rectangle' | 'leaderboard' }
  | { type: 'newsletter' }
  | { type: 'divider' }
  | { type: 'related'; article: Article }

export type AuthorBio = Author & {
  bio: string
  expertise: string[]
  socials: { label: string; href: string }[]
  href: string
}

export type ArticleFull = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: Block[]
  featuredImage: string
  imageAlt: string
  imageCaption?: string
  imageCredit?: string
  author: AuthorBio
  publishedDate: string
  updatedDate?: string
  readTime: string
  contentType: string
  category: string
  subcategory: string
  occasions: string[]
  seasons: string[]
  tags: string[]
  styles: string[]
  audiences: string[]
  season?: Season
  breadcrumb: { label: string; href: string }[]
  pinterest: { title: string; description: string; image: string }
  seo: {
    seoTitle: string
    metaDescription: string
    canonicalUrl: string
    robots: string
    ogImage: string
    schemaType: 'Article'
  }
  featured: boolean
  status: 'published' | 'draft'
  relatedArticles?: string[]
}

/* ---- author profiles (bio layer on top of the shared Author data) ---- */
const bios: Record<string, AuthorBio> = {
  jordan: {
    ...authors.jordan,
    bio: 'Jordan is a beauty writer covering nails, makeup and self-care, with a soft spot for seasonal manicures that anyone can recreate at home.',
    expertise: ['Nails', 'Makeup', 'Seasonal Beauty'],
    socials: [
      { label: 'Pinterest', href: '#' },
      { label: 'Instagram', href: '#' },
    ],
    href: '/author/jordan-blake',
  },
  amanda: {
    ...authors.amanda,
    bio: 'Amanda is a lifestyle writer specializing in weddings, celebrations and seasonal inspiration — always chasing the details that make a gathering feel personal.',
    expertise: ['Weddings', 'Celebrations', 'Tablescapes'],
    socials: [
      { label: 'Pinterest', href: '#' },
      { label: 'Instagram', href: '#' },
    ],
    href: '/author/amanda-thompson',
  },
  maya: {
    ...authors.maya,
    bio: 'Maya is our food editor, developing cozy, crowd-pleasing recipes and party menus made for real kitchens and real weeknights.',
    expertise: ['Recipes', 'Party Food', 'Baking'],
    socials: [
      { label: 'Pinterest', href: '#' },
      { label: 'Instagram', href: '#' },
    ],
    href: '/author/maya-reyes',
  },
}

/* Small helper to build a related-article card object */
const rel = (id: string, title: string, category: string, image: string, href: string): Article => ({
  id,
  title,
  category,
  href,
  image,
  author: authors.jordan,
  date: 'Sep 2026',
})

/* ======================= EXAMPLE 1 — Christmas Nails ======================= */
const christmasNails: ArticleFull = {
  id: 'a-christmas-nails',
  title: '25 Elegant Christmas Nail Ideas for a Festive Manicure',
  slug: 'christmas-nails',
  excerpt:
    'From understated shimmer to statement snowflakes, these elegant Christmas nail ideas prove festive can still feel refined. Here are our favorite looks to try this winter.',
  featuredImage: img('1667769462514-1fd738b38498', 1400, 900),
  imageAlt: 'Manicured hands with a soft festive red and gold nail design',
  imageCaption: 'A soft cranberry-and-gold set that works from the office party to Christmas dinner.',
  imageCredit: 'Photo: Maria Lupan',
  author: bios.jordan,
  publishedDate: 'September 20, 2026',
  updatedDate: 'September 22, 2026',
  readTime: '6 min read',
  contentType: 'Ideas / Listicle',
  category: 'Beauty',
  subcategory: 'Nails',
  occasions: ['Christmas'],
  seasons: ['Winter'],
  tags: ['Christmas Nails', 'Elegant', 'Red Nails', 'Glitter'],
  styles: ['Elegant', 'Festive'],
  audiences: ['Adults'],
  season: 'christmas',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Beauty', href: '/beauty' },
    { label: 'Nails', href: '/nails' },
    { label: '25 Elegant Christmas Nail Ideas', href: '/article/christmas-nails' },
  ],
  pinterest: {
    title: '25 Elegant Christmas Nail Ideas ❄️',
    description: 'Festive but refined Christmas manicure ideas you can actually recreate at home.',
    image: img('1667769462514-1fd738b38498', 1000, 1500),
  },
  seo: {
    seoTitle: '25 Elegant Christmas Nail Ideas for a Festive Manicure (2026)',
    metaDescription:
      'Discover 25 elegant Christmas nail ideas — from soft shimmer to snowflake accents — with tips to recreate each festive manicure at home.',
    canonicalUrl: 'https://marigoldandmaple.com/article/christmas-nails',
    robots: 'index,follow',
    ogImage: img('1667769462514-1fd738b38498', 1200, 630),
    schemaType: 'Article',
  },
  featured: true,
  status: 'published',
  content: [
    {
      type: 'paragraph',
      text: 'The holidays are the one time of year when a little sparkle on your nails feels completely justified. But festive doesn\'t have to mean fussy — the most beautiful Christmas manicures lean into soft, wearable elegance. Below are our favorite ideas, organized so you can find the perfect look for anything from a cozy night in to a formal holiday party.',
    },
    { type: 'callout', variant: 'tip', title: 'Before you start', text: 'A quick base coat and a good top coat will make any of these looks last through gift-wrapping, dishwashing and everything in between.' },
    { type: 'heading', level: 2, text: 'Soft & Understated Looks' },
    {
      type: 'paragraph',
      text: 'If you love a manicure that whispers rather than shouts, start here. Sheer washes of color, single accent nails and delicate metallics all feel festive without overwhelming the rest of your look.',
    },
    {
      type: 'image',
      src: img('1754799670410-b282791342c3', 1200, 800),
      alt: 'Soft heart-tip manicure in muted red',
      caption: 'A muted cranberry French tip is the little black dress of Christmas nails.',
    },
    { type: 'list', items: ['Sheer cranberry wash', 'Single gold accent nail', 'Milk-bath base with tiny snowflakes', 'Frosted almond tips'] },
    { type: 'heading', level: 2, text: 'Statement & Sparkle' },
    {
      type: 'paragraph',
      text: 'Ready to go all in? Full-glitter accent nails, deep emerald polish and metallic chrome all photograph beautifully and feel undeniably celebratory.',
    },
    {
      type: 'gallery',
      images: [
        { src: img('1772322586702-73125782bd99', 700, 700), alt: 'Cool-toned ombre manicure' },
        { src: img('1780402695873-d3053ee43f11', 700, 700), alt: 'Statement stiletto nails with decorations' },
        { src: img('1667769462514-1fd738b38498', 700, 700), alt: 'Festive red manicure' },
      ],
    },
    { type: 'quote', text: 'Christmas nails should feel like your favorite sweater — warm, a little sparkly, and entirely you.', cite: 'Jordan Blake' },
    { type: 'ad', format: 'rectangle' },
    { type: 'heading', level: 2, text: 'How To Make Them Last' },
    { type: 'checklist', items: ['Push back cuticles and buff lightly', 'Always cap the free edge with polish', 'Apply thin coats and let each dry', 'Re-seal with top coat every 3 days'] },
    {
      type: 'product',
      name: 'Long-Wear Gel Top Coat',
      blurb: 'A no-lamp top coat that keeps festive manicures glossy for over a week.',
      price: '$14',
      image: img('1522337660859-02fbefca2e2c', 400, 400),
      href: '#',
    },
    { type: 'heading', level: 2, text: 'Frequently Asked Questions' },
    { type: 'heading', level: 3, text: 'What colors are best for Christmas nails?' },
    { type: 'paragraph', text: 'Classic cranberry, emerald green, gold and icy silver are the most versatile. For something softer, try a sheer nude with a single metallic accent.' },
    { type: 'heading', level: 3, text: 'Can I do these on short nails?' },
    { type: 'paragraph', text: 'Absolutely — most of these looks translate beautifully to short, rounded nails. Simplify busy designs to a single accent for the cleanest result.' },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Conclusion' },
    { type: 'paragraph', text: 'Whether you choose barely-there shimmer or full holiday glam, the best Christmas manicure is the one that makes you smile every time you reach for your cocoa. Save your favorite and pin it for later.' },
  ],
  relatedArticles: ['wedding-tables', 'halloween-food'],
}

/* ======================= EXAMPLE 2 — Wedding Tables ======================= */
const weddingTables: ArticleFull = {
  id: 'a-wedding-tables',
  title: '18 Beautiful Wedding Table Decoration Ideas',
  slug: 'wedding-tables',
  excerpt:
    'Beautiful table ideas for creating an elegant and memorable wedding reception — from lush florals to candlelight and thoughtful place settings.',
  featuredImage: img('1519225421980-715cb0215aed', 1400, 900),
  imageAlt: 'Elegant wedding reception table with florals and candlelight',
  imageCaption: 'A dusty-blue tablescape layered with greenery, taper candles and gold accents.',
  imageCredit: 'Photo: Photos by Lanty',
  author: bios.amanda,
  publishedDate: 'September 21, 2026',
  readTime: '8 min read',
  contentType: 'Ideas / Listicle',
  category: 'Weddings',
  subcategory: 'Wedding Decor',
  occasions: [],
  seasons: ['Spring', 'Summer'],
  tags: ['Wedding Decor', 'Tablescapes', 'Centerpieces'],
  styles: ['Elegant', 'Romantic'],
  audiences: ['Couples', 'Hosts'],
  season: 'wedding',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Weddings', href: '/weddings' },
    { label: 'Wedding Decor', href: '/weddings/decor' },
    { label: '18 Wedding Table Decoration Ideas', href: '/article/wedding-tables' },
  ],
  pinterest: {
    title: '18 Beautiful Wedding Table Decoration Ideas 💍',
    description: 'Elegant wedding tablescape ideas — florals, candlelight and place settings.',
    image: img('1519225421980-715cb0215aed', 1000, 1500),
  },
  seo: {
    seoTitle: '18 Beautiful Wedding Table Decoration Ideas for an Elegant Reception',
    metaDescription:
      'Get 18 beautiful wedding table decoration ideas — centerpieces, candlelight, linens and place settings for an elegant, memorable reception.',
    canonicalUrl: 'https://marigoldandmaple.com/article/wedding-tables',
    robots: 'index,follow',
    ogImage: img('1519225421980-715cb0215aed', 1200, 630),
    schemaType: 'Article',
  },
  featured: true,
  status: 'published',
  content: [
    { type: 'paragraph', text: 'Your reception tables set the tone for the entire celebration — they\'re where guests linger, toast and make memories. The good news: a beautiful tablescape is really just a few elements layered with intention. Here\'s how to build one you\'ll love in every photo.' },
    { type: 'heading', level: 2, text: 'Start With a Palette' },
    { type: 'paragraph', text: 'Choose two neutrals and one accent color. Dusty blue, sage and warm terracotta are all having a moment and photograph beautifully in natural light.' },
    { type: 'image', src: img('1561593367-66c79c2294e6', 1200, 800), alt: 'Rustic wedding table with candles and greenery', caption: 'Layered textures and warm candlelight make even simple tables feel intentional.' },
    { type: 'heading', level: 2, text: 'Centerpiece Ideas' },
    { type: 'list', ordered: true, items: ['Low lush florals for conversation-friendly tables', 'Tall arrangements to add drama and height', 'Bud vases clustered for a relaxed, gathered look', 'Greenery runners with scattered tea lights'] },
    { type: 'gallery', images: [
      { src: img('1632528011905-54e2464961f4', 700, 700), alt: 'Outdoor wedding table' },
      { src: img('1590683673322-0f3fabd72169', 700, 700), alt: 'Eucalyptus centerpiece' },
      { src: img('1519225421980-715cb0215aed', 700, 700), alt: 'Dusty blue tablescape' },
    ] },
    { type: 'callout', variant: 'info', title: 'Rental tip', text: 'Reserve linens and glassware early for peak-season dates — the prettiest options book out months in advance.' },
    { type: 'ad', format: 'rectangle' },
    { type: 'heading', level: 2, text: 'Place Setting Details' },
    { type: 'checklist', items: ['Menu card or place card at each seat', 'A single stem or sprig of greenery', 'Cloth napkin with a simple tie', 'Mixed metals for warmth'] },
    { type: 'quote', text: 'The details guests remember are rarely the expensive ones — they\'re the thoughtful ones.', cite: 'Amanda Thompson' },
    { type: 'heading', level: 2, text: 'Frequently Asked Questions' },
    { type: 'heading', level: 3, text: 'How much should I budget for centerpieces?' },
    { type: 'paragraph', text: 'Plan for roughly 10–15% of your florals budget per table, and mix a few statement tables with simpler ones to stretch it further.' },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Conclusion' },
    { type: 'paragraph', text: 'Layer a palette, a centerpiece and a few thoughtful details, and your tables will feel effortlessly elegant. Pin your favorites to build your own reception mood board.' },
  ],
  relatedArticles: ['christmas-nails', 'halloween-food'],
}

/* ======================= EXAMPLE 3 — Halloween Party Food ======================= */
const halloweenFood: ArticleFull = {
  id: 'a-halloween-food',
  title: '20 Easy Halloween Party Food Ideas',
  slug: 'halloween-food',
  excerpt:
    'Spooky-cute snacks, finger foods and treats that are genuinely easy to make — perfect for a Halloween party the whole crowd will love.',
  featuredImage: img('1603528283899-d15c8832de80', 1400, 900),
  imageAlt: 'Autumn table with pumpkins and seasonal party food',
  imageCaption: 'A grazing spread of seasonal bites that comes together in under an hour.',
  imageCredit: 'Photo: Annie Spratt',
  author: bios.maya,
  publishedDate: 'September 19, 2026',
  readTime: '7 min read',
  contentType: 'Ideas / Listicle',
  category: 'Food',
  subcategory: 'Party Food',
  occasions: ['Halloween'],
  seasons: ['Fall'],
  tags: ['Halloween', 'Party Food', 'Easy Recipes', 'Snacks'],
  styles: ['Cozy', 'Fun'],
  audiences: ['Families', 'Hosts', 'Kids'],
  season: 'halloween',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Food & Recipes', href: '/recipes' },
    { label: 'Party Food', href: '/recipes/party-food' },
    { label: '20 Easy Halloween Party Food Ideas', href: '/article/halloween-food' },
  ],
  pinterest: {
    title: '20 Easy Halloween Party Food Ideas 🎃',
    description: 'Spooky-cute snacks and treats that are genuinely easy to make.',
    image: img('1603528283899-d15c8832de80', 1000, 1500),
  },
  seo: {
    seoTitle: '20 Easy Halloween Party Food Ideas Everyone Will Love',
    metaDescription:
      'Throw the best Halloween party with 20 easy food ideas — spooky-cute snacks, finger foods and treats that come together fast.',
    canonicalUrl: 'https://marigoldandmaple.com/article/halloween-food',
    robots: 'index,follow',
    ogImage: img('1603528283899-d15c8832de80', 1200, 630),
    schemaType: 'Article',
  },
  featured: false,
  status: 'published',
  content: [
    { type: 'paragraph', text: 'The secret to a stress-free Halloween party? Food that looks impressively festive but comes together with pantry staples and a little imagination. These 20 ideas are crowd-tested, kid-friendly and endlessly adaptable.' },
    { type: 'heading', level: 2, text: 'Savory Bites' },
    { type: 'paragraph', text: 'Start with a few savory anchors so guests aren\'t running on candy alone. Mummy-wrapped hot dogs, jack-o\'-lantern quesadillas and a spooky charcuterie board are always the first to disappear.' },
    { type: 'image', src: img('1602457471441-e7099c989338', 1200, 800), alt: 'Autumn decor with pumpkins', caption: 'Lean into seasonal produce — it doubles as decor and ingredients.' },
    { type: 'list', items: ['Mummy pigs-in-a-blanket', 'Jack-o\'-lantern stuffed peppers', 'Spider deviled eggs', 'Pumpkin-shaped cheese ball'] },
    { type: 'heading', level: 2, text: 'Sweet Treats' },
    { type: 'list', ordered: true, items: ['Ghost-dipped strawberries', 'Monster rice-crispy bars', 'Graveyard chocolate pudding cups', 'Candy-corn fruit parfaits'] },
    { type: 'callout', variant: 'note', title: 'Make-ahead', text: 'Most of these can be prepped the night before and assembled an hour before guests arrive.' },
    { type: 'ad', format: 'rectangle' },
    { type: 'heading', level: 2, text: 'Frequently Asked Questions' },
    { type: 'heading', level: 3, text: 'What can I make for a big crowd?' },
    { type: 'paragraph', text: 'Grazing boards and one-pan bakes scale beautifully. Build two medium boards instead of one giant one so refills feel fresh.' },
    { type: 'divider' },
    { type: 'heading', level: 2, text: 'Conclusion' },
    { type: 'paragraph', text: 'With a mix of savory and sweet — and a few spooky touches — your Halloween spread will be as fun to look at as it is to eat. Save this list for party-planning night.' },
  ],
  relatedArticles: ['christmas-nails', 'wedding-tables'],
}

export const articlesBySlug: Record<string, ArticleFull> = {
  'christmas-nails': christmasNails,
  'wedding-tables': weddingTables,
  'halloween-food': halloweenFood,
}

export function getArticle(slug: string): ArticleFull | undefined {
  return articlesBySlug[slug]
}

/* Related-article pool builder (approx. 10), reusing existing content sets.
   In production this is CMS relevance-ranked by category/occasion/tags. */
export function relatedFor(a: ArticleFull, pool: Article[]): Article[] {
  const explicit = (a.relatedArticles ?? [])
    .map((s) => articlesBySlug[s])
    .filter(Boolean)
    .map((r) => rel(r!.id, r!.title, r!.category, r!.featuredImage, `/article/${r!.slug}`))
  const rest = pool.filter((p) => p.title !== a.title)
  return [...explicit, ...rest].slice(0, 10)
}
