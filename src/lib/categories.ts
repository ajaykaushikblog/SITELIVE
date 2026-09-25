import {
  type Article,
  type Season,
  img,
  authors,
  trending,
  recipes,
  beauty,
  weddings,
  celebrations,
  seasonalSpotlight,
} from './content'

/* =========================================================================
   Universal category configuration.
   EVERY value here is dynamic (CMS-driven). The template renders identically
   whether `kind` is an occasion, a life event, or a content topic — only the
   data and the seasonal accent change. Nothing is hard-coded to one category.
   ========================================================================= */

export type Crumb = { label: string; href: string }

export type CategoryFilters = {
  subcategory: string[]
  occasion: string[]
  season: string[]
  contentType: string[]
  style: string[]
  audience: string[]
}

export type CategoryConfig = {
  slug: string
  kind: 'Occasion' | 'Life Event' | 'Topic'
  name: string
  description: string
  image: string
  /** optional seasonal accent applied to this category's badges/accents */
  season?: Season
  breadcrumb: Crumb[]
  subcategories: Crumb[]
  featured: Article
  supporting: Article[]
  latest: Article[]
  filters: CategoryFilters
  articleCount: number
  seo: { title: string; description: string; canonical: string }
}

/* Shared filter option vocabulary (human labels, never DB terms) */
const commonFilters = (over: Partial<CategoryFilters> = {}): CategoryFilters => ({
  subcategory: [],
  occasion: ['Christmas', 'Halloween', 'Thanksgiving', "Valentine's Day", 'Easter'],
  season: ['Spring', 'Summer', 'Fall', 'Winter'],
  contentType: ['Article', 'Recipe', 'DIY', 'Round-up', 'Guide'],
  style: ['Elegant', 'Rustic', 'Modern', 'Cozy', 'Minimal', 'Boho'],
  audience: ['Adults', 'Kids', 'Couples', 'Families', 'Hosts'],
  ...over,
})

/* Build a larger "latest" pool from existing article sets so pagination /
   load-more is meaningful. Re-id to keep React keys unique per page. */
function pool(sets: Article[][], category: string): Article[] {
  const flat = sets.flat()
  return flat.map((a, i) => ({ ...a, id: `${category}-${i}`, category: a.category }))
}

export const categories: Record<string, CategoryConfig> = {
  christmas: {
    slug: 'christmas',
    kind: 'Occasion',
    name: 'Christmas',
    description:
      'Everything you need for a warm, wonder-filled Christmas — handmade decor, festive recipes, cozy crafts, gift ideas and party inspiration for the whole family.',
    image: img('1512837958124-1184ad320621', 1600, 900),
    season: 'christmas',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Occasions', href: '/occasions' },
      { label: 'Christmas', href: '/christmas' },
    ],
    subcategories: [
      { label: 'Christmas Recipes', href: '/christmas/recipes' },
      { label: 'Christmas Decor', href: '/christmas/decor' },
      { label: 'Christmas Crafts', href: '/christmas/crafts' },
      { label: 'Christmas Gifts', href: '/christmas/gifts' },
      { label: 'Christmas Nails', href: '/christmas/nails' },
      { label: 'Party Ideas', href: '/christmas/party-ideas' },
    ],
    featured: {
      id: 'christ-feat',
      title: '15 Handmade Christmas Garland Ideas for a Cozy Holiday Home',
      excerpt:
        'Garlands are the easiest way to make a home feel warmer and more festive. These handmade ideas use natural materials, dried fruit and simple techniques anyone can try.',
      category: 'Christmas Decor',
      href: '/christmas/garland-ideas',
      image: img('1512837958124-1184ad320621', 1000, 800),
      author: authors.alicia,
      date: 'Sep 22, 2026',
      readTime: '8 min read',
    },
    supporting: trending.slice(0, 3),
    latest: pool([trending, celebrations, recipes], 'christmas'),
    filters: commonFilters({
      subcategory: ['Recipes', 'Decor', 'Crafts', 'Gifts', 'Nails', 'Party Ideas'],
    }),
    articleCount: 486,
    seo: {
      title: 'Christmas Ideas & Inspiration — Recipes, Decor, Crafts & Gifts',
      description:
        'Explore hundreds of Christmas ideas: handmade decor, festive recipes, cozy crafts, gift guides and party inspiration for the whole family.',
      canonical: 'https://marigoldandmaple.com/christmas',
    },
  },

  weddings: {
    slug: 'weddings',
    kind: 'Life Event',
    name: 'Weddings',
    description:
      'From table settings to florals and everything in between — thoughtful wedding ideas and real details to help you style a celebration that feels entirely yours.',
    image: img('1519225421980-715cb0215aed', 1600, 900),
    season: 'wedding',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Weddings', href: '/weddings' },
    ],
    subcategories: [
      { label: 'Wedding Decor', href: '/weddings/decor' },
      { label: 'Wedding Cakes', href: '/weddings/cakes' },
      { label: 'Wedding Flowers', href: '/weddings/flowers' },
      { label: 'Table Settings', href: '/weddings/tables' },
      { label: 'Wedding Beauty', href: '/weddings/beauty' },
      { label: 'Bridal Showers', href: '/bridal-showers' },
    ],
    featured: {
      id: 'wed-feat',
      title: '14 Most Beautiful Dusty Blue Wedding Table Decor Ideas',
      excerpt:
        'Dusty blue is the palette of the season — soft, romantic and endlessly versatile. Here are our favorite ways to bring it to your wedding tablescape.',
      category: 'Wedding Decor',
      href: '/article/wedding-tables',
      image: img('1519225421980-715cb0215aed', 1000, 800),
      author: authors.amanda,
      date: 'Sep 21, 2026',
      readTime: '7 min read',
    },
    supporting: weddings.slice(1, 4),
    latest: pool([weddings, celebrations, trending], 'weddings'),
    filters: commonFilters({
      subcategory: ['Decor', 'Cakes', 'Flowers', 'Tables', 'Beauty', 'Showers'],
      occasion: ['Spring Wedding', 'Summer Wedding', 'Fall Wedding', 'Winter Wedding'],
    }),
    articleCount: 312,
    seo: {
      title: 'Wedding Ideas & Inspiration — Decor, Cakes, Flowers & Tables',
      description:
        'Beautiful wedding ideas and real details: table settings, florals, cakes, beauty and bridal shower inspiration for a celebration that feels like you.',
      canonical: 'https://marigoldandmaple.com/weddings',
    },
  },

  nails: {
    slug: 'nails',
    kind: 'Topic',
    name: 'Nails',
    description:
      'Manicure ideas for every mood and season — from soft everyday looks to statement sets, with step-by-step inspiration you can actually recreate.',
    image: img('1667769462514-1fd738b38498', 1600, 900),
    season: 'valentines',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Beauty', href: '/beauty' },
      { label: 'Nails', href: '/nails' },
    ],
    subcategories: [
      { label: 'Fall Nails', href: '/nails/fall' },
      { label: 'Christmas Nails', href: '/nails/christmas' },
      { label: 'Wedding Nails', href: '/nails/wedding' },
      { label: 'Short Nails', href: '/nails/short' },
      { label: 'Almond Nails', href: '/nails/almond' },
      { label: 'French Tips', href: '/nails/french' },
    ],
    featured: {
      id: 'nails-feat',
      title: '25 Elegant Christmas Nail Ideas for a Festive Manicure',
      excerpt:
        'Proof that one article lives across many categories — this set belongs to Beauty, Nails, Christmas and Winter all at once, no duplicate pages required.',
      category: 'Nails',
      href: '/article/christmas-nails',
      image: img('1667769462514-1fd738b38498', 1000, 800),
      author: authors.jordan,
      date: 'Sep 20, 2026',
      readTime: '6 min read',
    },
    supporting: beauty.slice(1, 4),
    latest: pool([beauty, beauty, recipes], 'nails'),
    filters: commonFilters({
      subcategory: ['Fall', 'Christmas', 'Wedding', 'Short', 'Almond', 'French'],
    }),
    articleCount: 198,
    seo: {
      title: 'Nail Ideas & Manicure Inspiration for Every Season',
      description:
        'Manicure ideas for every mood and occasion — fall nails, Christmas nails, wedding nails and everyday looks you can recreate at home.',
      canonical: 'https://marigoldandmaple.com/nails',
    },
  },

  recipes: {
    slug: 'recipes',
    kind: 'Topic',
    name: 'Food & Recipes',
    description:
      'Cozy, crowd-pleasing recipes for everyday meals and special occasions — breakfasts, dinners, desserts, drinks and party food worth gathering around.',
    image: img('1588467850140-763664599b53', 1600, 900),
    season: 'fall',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Food & Recipes', href: '/recipes' },
    ],
    subcategories: [
      { label: 'Breakfast', href: '/recipes/breakfast' },
      { label: 'Dinner', href: '/recipes/dinner' },
      { label: 'Desserts', href: '/recipes/desserts' },
      { label: 'Drinks', href: '/recipes/drinks' },
      { label: 'Appetizers', href: '/recipes/appetizers' },
      { label: 'Party Food', href: '/recipes/party-food' },
    ],
    featured: {
      id: 'rec-feat',
      title: 'Brown Butter Pumpkin Snickerdoodles',
      excerpt:
        'Soft, chewy and rolled in cinnamon sugar — these brown butter pumpkin snickerdoodles are the cookie your fall gatherings have been missing.',
      category: 'Desserts',
      href: '/recipe/christmas-sugar-cookies',
      image: img('1588467850140-763664599b53', 1000, 800),
      author: authors.maya,
      date: 'Sep 21, 2026',
      readTime: '5 min read',
    },
    supporting: recipes.slice(1, 4),
    latest: pool([recipes, recipes, seasonalSpotlight.articles], 'recipes'),
    filters: commonFilters({
      subcategory: ['Breakfast', 'Dinner', 'Desserts', 'Drinks', 'Appetizers', 'Party Food'],
      contentType: ['Recipe', 'Round-up', 'Guide'],
    }),
    articleCount: 640,
    seo: {
      title: 'Recipes & Food Ideas — Breakfast, Dinner, Desserts & Drinks',
      description:
        'Cozy, crowd-pleasing recipes for everyday meals and special occasions: breakfasts, dinners, desserts, drinks and party food.',
      canonical: 'https://marigoldandmaple.com/recipes',
    },
  },

  diy: {
    slug: 'diy',
    kind: 'Topic',
    name: 'DIY & Crafts',
    description:
      'Handmade projects for every season and occasion — crafts, home DIY, holiday makes and step-by-step tutorials you can actually finish in an afternoon.',
    image: img('1481349518771-20055b2a7b24', 1600, 900),
    season: 'fall',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'DIY & Crafts', href: '/diy' },
    ],
    subcategories: [
      { label: 'Christmas Crafts', href: '/diy/christmas-crafts' },
      { label: 'Holiday Crafts', href: '/diy/holiday-crafts' },
      { label: 'Kids Crafts', href: '/diy/kids-crafts' },
      { label: 'Home Decor DIY', href: '/diy/home-decor' },
      { label: 'Paper Crafts', href: '/diy/paper-crafts' },
      { label: 'Floral Projects', href: '/diy/floral' },
    ],
    featured: {
      id: 'diy-feat',
      title: 'DIY Macrame Snowflake Ornaments',
      excerpt:
        'A simple, meditative handmade Christmas decoration you can make with basic cotton cord and a few beads — no macrame experience required.',
      category: 'Christmas Crafts',
      href: '/diy/macrame-snowflakes',
      image: img('1481349518771-20055b2a7b24', 1000, 800),
      author: authors.alicia,
      date: 'Dec 12, 2026',
      readTime: '9 min read',
    },
    supporting: seasonalSpotlight.articles.slice(1, 4),
    latest: pool([seasonalSpotlight.articles, celebrations, trending], 'diy'),
    filters: commonFilters({
      subcategory: ['Christmas Crafts', 'Holiday Crafts', 'Kids Crafts', 'Home Decor', 'Paper Crafts', 'Floral'],
      contentType: ['Tutorial', 'DIY', 'Round-up', 'Guide'],
    }),
    articleCount: 274,
    seo: {
      title: 'DIY & Craft Ideas — Tutorials, Holiday Crafts & Home Projects',
      description:
        'Handmade DIY and craft ideas for every season: holiday crafts, kids crafts, home projects and step-by-step tutorials anyone can make.',
      canonical: 'https://marigoldandmaple.com/diy',
    },
  },
}

export const sortOptions = ['Latest', 'Popular', 'Most Saved', "Editor's Picks"] as const
export type SortOption = (typeof sortOptions)[number]

/** Related categories shown at the bottom — cross-linking the taxonomy. */
export const relatedCategories: Crumb[] = [
  { label: 'Christmas', href: '/christmas' },
  { label: 'Weddings', href: '/weddings' },
  { label: 'Nails', href: '/nails' },
  { label: 'Recipes', href: '/recipes' },
  { label: 'DIY & Crafts', href: '/diy' },
  { label: 'Home & Decor', href: '/home-decor' },
]
