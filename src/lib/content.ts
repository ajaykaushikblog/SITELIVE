/* =========================================================================
   Content model + seed data.
   The public site speaks human editorial language (Occasions, Topics,
   Collections) — never database terminology. A single article carries
   multiple taxonomy references (many-to-many) via its `taxonomy` field.
   ========================================================================= */

export type Author = {
  name: string
  role: string
  avatar: string
}

export type Article = {
  id: string
  title: string
  excerpt?: string
  /** Human category label shown on the badge */
  category: string
  href: string
  image: string
  author: Author
  date: string
  readTime?: string
  /** Cross-cutting taxonomy — occasions/topics/seasons/tags/audiences */
  taxonomy?: string[]
}

/** Build a cropped, auto-formatted Unsplash URL at an exact ratio. */
export const img = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`

/* ---------------- Authors ---------------- */

export const authors: Record<string, Author> = {
  alicia: {
    name: 'Alicia Butner',
    role: 'Home & Holidays Editor',
    avatar: img('1494790108377-be9c29b29330', 160, 160),
  },
  amanda: {
    name: 'Amanda Thompson',
    role: 'Weddings & Celebrations',
    avatar: img('1438761681033-6461ffad8d80', 160, 160),
  },
  maya: {
    name: 'Maya Reyes',
    role: 'Food & Recipes Editor',
    avatar: img('1544005313-94ddf0286df2', 160, 160),
  },
  jordan: {
    name: 'Jordan Blake',
    role: 'Beauty & Style',
    avatar: img('1500648767791-00dcc994a43e', 160, 160),
  },
}

/* ---------------- Navigation ---------------- */

export type NavGroup = { label: string; items: { label: string; href: string }[] }

export type NavItem = {
  label: string
  href: string
  /** mega-menu columns, when present */
  groups?: NavGroup[]
  /**
   * Marks a trigger-only item (e.g. "More") that opens a menu instead of
   * navigating. One nav config drives desktop primary + More mega menu and the
   * mobile drawer + More accordion, so the production CMS can later own this
   * structure (label / url / children / grouping) without touching the header.
   */
  menu?: boolean
}

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Occasions',
    href: '/occasions',
    groups: [
      {
        label: 'Fall & Winter',
        items: [
          { label: 'Christmas', href: '/christmas' },
          { label: 'Halloween', href: '/halloween' },
          { label: 'Thanksgiving', href: '/thanksgiving' },
          { label: "New Year's", href: '/new-years' },
        ],
      },
      {
        label: 'Spring & Summer',
        items: [
          { label: "Valentine's Day", href: '/valentines-day' },
          { label: 'Easter', href: '/easter' },
          { label: "Mother's Day", href: '/mothers-day' },
          { label: '4th of July', href: '/4th-of-july' },
        ],
      },
      {
        label: 'Milestones',
        items: [
          { label: "Father's Day", href: '/fathers-day' },
          { label: 'Graduation', href: '/graduation' },
          { label: 'Back to School', href: '/back-to-school' },
          { label: "St. Patrick's Day", href: '/st-patricks-day' },
        ],
      },
    ],
  },
  {
    label: 'Weddings',
    href: '/weddings',
    groups: [
      {
        label: 'Plan',
        items: [
          { label: 'Wedding Ideas', href: '/weddings/ideas' },
          { label: 'Wedding Decor', href: '/weddings/decor' },
          { label: 'Bridal Showers', href: '/bridal-showers' },
          { label: 'Engagements', href: '/engagements' },
        ],
      },
      {
        label: 'Details',
        items: [
          { label: 'Table Settings', href: '/weddings/tables' },
          { label: 'Florals', href: '/weddings/florals' },
          { label: 'Anniversaries', href: '/anniversaries' },
        ],
      },
    ],
  },
  {
    label: 'Food & Recipes',
    href: '/recipes',
    groups: [
      {
        label: 'Meals',
        items: [
          { label: 'Recipes', href: '/recipes' },
          { label: 'Breakfast', href: '/recipes/breakfast' },
          { label: 'Lunch', href: '/recipes/lunch' },
          { label: 'Dinner', href: '/recipes/dinner' },
        ],
      },
      {
        label: 'More',
        items: [
          { label: 'Desserts', href: '/recipes/desserts' },
          { label: 'Drinks', href: '/recipes/drinks' },
          { label: 'Appetizers', href: '/recipes/appetizers' },
          { label: 'Party Food', href: '/recipes/party-food' },
        ],
      },
    ],
  },
  {
    label: 'Beauty',
    href: '/beauty',
    groups: [
      {
        label: 'Beauty',
        items: [
          { label: 'Nails', href: '/nails' },
          { label: 'Makeup', href: '/makeup' },
          { label: 'Hair', href: '/hair' },
          { label: 'Self Care', href: '/self-care' },
        ],
      },
    ],
  },
  {
    label: 'DIY & Crafts',
    href: '/diy',
    groups: [
      {
        label: 'Make',
        items: [
          { label: 'DIY', href: '/diy' },
          { label: 'Crafts', href: '/crafts' },
          { label: 'Kids Crafts', href: '/kids-crafts' },
          { label: 'Seasonal Crafts', href: '/seasonal-crafts' },
        ],
      },
    ],
  },
  {
    label: 'Home & Decor',
    href: '/home-decor',
    groups: [
      {
        label: 'Decorate',
        items: [
          { label: 'Home Decor', href: '/home-decor' },
          { label: 'Holiday Decor', href: '/holiday-decor' },
          { label: 'Party Decor', href: '/party-decor' },
        ],
      },
    ],
  },
  {
    label: 'More',
    href: '/more',
    menu: true,
    groups: [
      {
        label: 'Discover',
        items: [
          { label: 'Gifts', href: '/gifts' },
          { label: 'Ideas & Advice', href: '/ideas' },
        ],
      },
      {
        label: 'Popular',
        items: [
          { label: 'Seasonal Crafts', href: '/seasonal-crafts' },
          { label: 'Kids Crafts', href: '/kids-crafts' },
          { label: 'Party Decor', href: '/party-decor' },
        ],
      },
    ],
  },
]

/* ---------------- Seasonal spotlight (CMS-driven, swappable) ---------------- */

export type Season = 'fall' | 'christmas' | 'valentines' | 'halloween' | 'wedding'

export const seasonalSpotlight: {
  season: Season
  eyebrow: string
  title: string
  articles: Article[]
} = {
  season: 'fall',
  eyebrow: 'This Season',
  title: 'Make It Cute This Fall',
  articles: [
    {
      id: 's1',
      title: '14 Best Fall Activities to Do With the Whole Family',
      category: 'Inspiration',
      href: '/fall/activities',
      image: img('1572978306654-a3835dd40cd4', 800, 800),
      author: authors.alicia,
      date: 'Sep 18, 2026',
    },
    {
      id: 's2',
      title: '14 Handmade Fall Decor Projects for a Cozy Home',
      category: 'DIY + Home',
      href: '/fall/decor',
      image: img('1602457471441-e7099c989338', 800, 800),
      author: authors.alicia,
      date: 'Sep 16, 2026',
    },
    {
      id: 's3',
      title: '15 Fun Toddler Fall Crafts for Busy Little Hands',
      category: 'Crafts',
      href: '/fall/toddler-crafts',
      image: img('1633955810370-0bbcbdba3e5f', 800, 800),
      author: authors.jordan,
      date: 'Sep 15, 2026',
    },
    {
      id: 's4',
      title: '13 Girly Pumpkin Carving Ideas for a Cute Fall',
      category: 'Inspiration',
      href: '/fall/pumpkins',
      image: img('1603528283899-d15c8832de80', 800, 800),
      author: authors.jordan,
      date: 'Sep 12, 2026',
    },
  ],
}

/* ---------------- Featured hero ---------------- */

export const featured: Article = {
  id: 'f1',
  title: '15 Handmade Christmas Garland Ideas for a Cozy Holiday Home',
  excerpt:
    'Christmas garlands are one of the easiest ways to make a home feel warmer and more festive — here are our favorite handmade ideas to try this year.',
  category: 'Christmas',
  href: '/christmas/garland-ideas',
  image: img('1512837958124-1184ad320621', 1200, 1000),
  author: authors.alicia,
  date: 'Sep 22, 2026',
  readTime: '8 min read',
}

/* ---------------- Trending ---------------- */

export const trending: Article[] = [
  {
    id: 't1',
    title: '15 Christmas Icebreaker Games for Adults',
    category: 'Christmas',
    href: '/christmas/icebreakers',
    image: img('1512484346026-44def92f7385', 700, 560),
    author: authors.alicia,
    date: 'Sep 20, 2026',
  },
  {
    id: 't2',
    title: '17 Christmas Solo Date Ideas to Enjoy the Season',
    category: 'Christmas',
    href: '/christmas/solo-dates',
    image: img('1733312030191-e6ac99c11310', 700, 560),
    author: authors.jordan,
    date: 'Sep 19, 2026',
  },
  {
    id: 't3',
    title: '17 Christmas Bucket List Ideas for Adults',
    category: 'Christmas',
    href: '/christmas/bucket-list',
    image: img('1481349518771-20055b2a7b24', 700, 560),
    author: authors.alicia,
    date: 'Sep 18, 2026',
  },
  {
    id: 't4',
    title: '15 Christmas Party Games for Small Groups',
    category: 'Christmas',
    href: '/christmas/party-games',
    image: img('1543589077-47d81606c1bf', 700, 560),
    author: authors.amanda,
    date: 'Sep 17, 2026',
  },
]

/* ---------------- Topic rows ---------------- */

export const recipes: Article[] = [
  {
    id: 'r1',
    title: 'Brown Butter Pumpkin Snickerdoodles',
    category: 'Desserts',
    href: '/recipes/pumpkin-snickerdoodles',
    image: img('1588467850140-763664599b53', 700, 560),
    author: authors.maya,
    date: 'Sep 21, 2026',
  },
  {
    id: 'r2',
    title: 'Cozy Maple Chai Latte You Can Make at Home',
    category: 'Drinks',
    href: '/recipes/maple-chai-latte',
    image: img('1588467850132-d1668cdaab88', 700, 560),
    author: authors.maya,
    date: 'Sep 19, 2026',
  },
  {
    id: 'r3',
    title: 'Easy One-Bowl Apple Cinnamon Muffins',
    category: 'Breakfast',
    href: '/recipes/apple-cinnamon-muffins',
    image: img('1781635550872-142f05e33995', 700, 560),
    author: authors.maya,
    date: 'Sep 17, 2026',
  },
  {
    id: 'r4',
    title: '20 Cozy Fall Dinners for Busy Weeknights',
    category: 'Dinner',
    href: '/recipes/fall-dinners',
    image: img('1781611172399-60ffdb6be527', 700, 560),
    author: authors.maya,
    date: 'Sep 15, 2026',
  },
]

export const beauty: Article[] = [
  {
    id: 'b1',
    title: '18 Cozy Fall Nail Ideas Everyone Will Love',
    category: 'Nails',
    href: '/nails/fall-ideas',
    image: img('1667769462514-1fd738b38498', 700, 560),
    author: authors.jordan,
    date: 'Sep 20, 2026',
  },
  {
    id: 'b2',
    title: 'Soft Heart-Tip Manicure for a Sweet Everyday Look',
    category: 'Nails',
    href: '/nails/heart-tips',
    image: img('1754799670410-b282791342c3', 700, 560),
    author: authors.jordan,
    date: 'Sep 18, 2026',
  },
  {
    id: 'b3',
    title: 'The Cool-Toned Ombre Manicure Trend for Autumn',
    category: 'Nails',
    href: '/nails/ombre',
    image: img('1772322586702-73125782bd99', 700, 560),
    author: authors.jordan,
    date: 'Sep 16, 2026',
  },
  {
    id: 'b4',
    title: '13 Must-Try Fall Self-Care Routines for Everyone',
    category: 'Self Care',
    href: '/self-care/fall-routines',
    image: img('1780402695873-d3053ee43f11', 700, 560),
    author: authors.jordan,
    date: 'Sep 14, 2026',
  },
]

export const weddings: Article[] = [
  {
    id: 'w1',
    title: '14 Most Beautiful Dusty Blue Wedding Table Decor Ideas',
    category: 'Wedding Decor',
    href: '/weddings/dusty-blue-tables',
    image: img('1519225421980-715cb0215aed', 700, 560),
    author: authors.amanda,
    date: 'Sep 21, 2026',
  },
  {
    id: 'w2',
    title: '15 Charming Rustic Wedding Table Decor Ideas',
    category: 'Wedding Decor',
    href: '/weddings/rustic-tables',
    image: img('1561593367-66c79c2294e6', 700, 560),
    author: authors.amanda,
    date: 'Sep 19, 2026',
  },
  {
    id: 'w3',
    title: '15 Beautiful Outdoor Wedding Table Decor Ideas',
    category: 'Wedding Decor',
    href: '/weddings/outdoor-tables',
    image: img('1632528011905-54e2464961f4', 700, 560),
    author: authors.amanda,
    date: 'Sep 17, 2026',
  },
  {
    id: 'w4',
    title: '12 Amazing Eucalyptus Wedding Table Decor Ideas',
    category: 'Wedding Decor',
    href: '/weddings/eucalyptus-tables',
    image: img('1590683673322-0f3fabd72169', 700, 560),
    author: authors.amanda,
    date: 'Sep 15, 2026',
  },
]

export const celebrations: Article[] = [
  {
    id: 'c1',
    title: '15 Creative Western Party Backdrop Ideas',
    category: 'Party Decor',
    href: '/parties/western-backdrops',
    image: img('1530103862676-de8c9debad1d', 700, 560),
    author: authors.amanda,
    date: 'Sep 20, 2026',
  },
  {
    id: 'c2',
    title: '15 Amazing Handmade Birthday Card Ideas to Make Now',
    category: 'Birthdays',
    href: '/birthdays/card-ideas',
    image: img('1583875762487-5f8f7c718d14', 700, 560),
    author: authors.alicia,
    date: 'Sep 18, 2026',
  },
  {
    id: 'c3',
    title: '13 Sweet Baby Shower Dessert Table Ideas',
    category: 'Baby Showers',
    href: '/baby-showers/dessert-tables',
    image: img('1504196606672-aef5c9cefc92', 700, 560),
    author: authors.amanda,
    date: 'Sep 16, 2026',
  },
  {
    id: 'c4',
    title: '12 Creative Graduation Party Ideas Worth Celebrating',
    category: 'Party Decor',
    href: '/parties/graduation',
    image: img('1741969494307-55394e3e4071', 700, 560),
    author: authors.amanda,
    date: 'Sep 14, 2026',
  },
]

/* Popular categories — occasion/topic browse tiles */
export const popularCategories: { label: string; href: string; image: string }[] = [
  { label: 'Christmas', href: '/christmas', image: img('1512484346026-44def92f7385', 500, 640) },
  { label: 'Recipes', href: '/recipes', image: img('1588467850140-763664599b53', 500, 640) },
  { label: 'Weddings', href: '/weddings', image: img('1519225421980-715cb0215aed', 500, 640) },
  { label: 'Nails', href: '/nails', image: img('1667769462514-1fd738b38498', 500, 640) },
  { label: 'DIY', href: '/diy', image: img('1602457471441-e7099c989338', 500, 640) },
  { label: 'Birthdays', href: '/birthdays', image: img('1530103862676-de8c9debad1d', 500, 640) },
]
