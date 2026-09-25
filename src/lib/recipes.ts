import { type Article, type Season, img, authors } from './content'
import { type AuthorBio, articlesBySlug } from './articles'

/* =========================================================================
   Universal recipe model.
   A specialized content template inside the same publishing system. Every
   field is dynamic (CMS-driven) and optional fields gracefully disappear
   when empty, so ONE template renders a cookie, a cocktail or a pasta
   dinner identically — only the data and the seasonal accent change.
   ========================================================================= */

export type Ingredient = {
  /** numeric amount enables the serving adjuster to scale it; omit for "to taste" */
  qty?: number
  unit?: string
  name: string
  note?: string
}

export type IngredientGroup = {
  /** optional — a single unnamed group renders without a heading */
  title?: string
  items: Ingredient[]
}

export type InstructionStep = {
  heading?: string
  text: string
  image?: string
  video?: string
}

export type Nutrition = Partial<{
  calories: string
  protein: string
  carbohydrates: string
  fat: string
  fiber: string
  sugar: string
  sodium: string
}>

export type RecipeProduct = {
  name: string
  blurb: string
  price?: string
  image: string
  href: string
}

export type RecipeFull = {
  id: string
  title: string
  slug: string
  description: string
  featuredImage: string
  imageAlt: string
  imageCaption?: string
  imageCredit?: string
  /** vertical Pinterest-friendly crop */
  pinterestImage?: string
  author: AuthorBio
  publishedDate: string
  updatedDate?: string
  category: string
  subcategory?: string
  occasions: string[]
  seasons: string[]
  tags: string[]
  styles: string[]
  /** genuine rating data only — never invented */
  rating?: { value: number; count: number }

  /* quick info — all optional, hidden when absent */
  prepTime?: string
  cookTime?: string
  totalTime?: string
  servings?: number
  servingUnit?: string
  calories?: string
  difficulty?: string
  cost?: string

  ingredientGroups: IngredientGroup[]
  equipment?: string[]
  instructions: InstructionStep[]

  notes?: string[]
  tips?: string[]
  variations?: string[]
  substitutions?: string[]
  storage?: string
  makeAhead?: string

  nutrition?: Nutrition
  gallery?: { src: string; alt: string }[]
  products?: RecipeProduct[]

  season?: Season
  breadcrumb: { label: string; href: string }[]
  pinterest: { title: string; description: string; image: string }
  seo: {
    seoTitle: string
    metaDescription: string
    canonicalUrl: string
    robots: string
    ogImage: string
    schemaType: 'Recipe'
  }
  status: 'published' | 'draft'
  relatedRecipes?: string[]
}

/* author bios reused from the article layer for consistency */
const bios = {
  maya: {
    ...authors.maya,
    bio: 'Maya is our food editor, developing cozy, crowd-pleasing recipes and party menus made for real kitchens and real weeknights.',
    expertise: ['Recipes', 'Party Food', 'Baking'],
    socials: [
      { label: 'Pinterest', href: '#' },
      { label: 'Instagram', href: '#' },
    ],
    href: '/author/maya-reyes',
  } as AuthorBio,
}

/* ======================= EXAMPLE 1 — Christmas Sugar Cookies ======================= */
const sugarCookies: RecipeFull = {
  id: 'rc-sugar-cookies',
  title: 'Easy Christmas Sugar Cookies',
  slug: 'christmas-sugar-cookies',
  description:
    'These classic cut-out sugar cookies are soft, buttery and hold their shape beautifully — the perfect canvas for holiday decorating with the whole family.',
  featuredImage: img('1481391319762-47dff72954d9', 1400, 900),
  imageAlt: 'Decorated Christmas sugar cookies on a cooling rack',
  imageCaption: 'Soft, buttery cut-outs that keep their crisp edges through decorating.',
  imageCredit: 'Photo: Monika Grabkowska',
  pinterestImage: img('1481391319762-47dff72954d9', 1000, 1500),
  author: bios.maya,
  publishedDate: 'December 10, 2026',
  updatedDate: 'December 12, 2026',
  category: 'Desserts',
  subcategory: 'Cookies',
  occasions: ['Christmas'],
  seasons: ['Winter'],
  tags: ['Christmas Cookies', 'Sugar Cookies', 'Baking', 'Holiday'],
  styles: ['Classic', 'Family-friendly'],
  rating: { value: 4.8, count: 214 },
  prepTime: '20 min',
  cookTime: '12 min',
  totalTime: '32 min',
  servings: 24,
  servingUnit: 'cookies',
  calories: '140 kcal',
  difficulty: 'Easy',
  cost: '$8',
  season: 'christmas',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Recipes', href: '/recipes' },
    { label: 'Desserts', href: '/recipes/desserts' },
    { label: 'Christmas Sugar Cookies', href: '/recipe/christmas-sugar-cookies' },
  ],
  ingredientGroups: [
    {
      title: 'For the Cookies',
      items: [
        { qty: 3, unit: 'cups', name: 'all-purpose flour', note: 'spooned & leveled' },
        { qty: 1, unit: 'cup', name: 'granulated sugar' },
        { qty: 1, unit: 'cup', name: 'unsalted butter', note: 'softened' },
        { qty: 1, name: 'large egg' },
        { qty: 2, unit: 'tsp', name: 'pure vanilla extract' },
        { qty: 1, unit: 'tsp', name: 'baking powder' },
        { qty: 0.5, unit: 'tsp', name: 'salt' },
      ],
    },
    {
      title: 'For the Icing',
      items: [
        { qty: 2, unit: 'cups', name: 'powdered sugar' },
        { qty: 2, unit: 'tbsp', name: 'milk', note: 'more as needed' },
        { name: 'Gel food coloring', note: 'optional' },
      ],
    },
  ],
  equipment: ['Stand or hand mixer', 'Rolling pin', 'Cookie cutters', 'Baking sheets', 'Parchment paper'],
  instructions: [
    { heading: 'Cream the butter and sugar', text: 'Beat the softened butter and granulated sugar together until light and fluffy, about 3 minutes. Add the egg and vanilla and mix until combined.' },
    { heading: 'Add the dry ingredients', text: 'Whisk together the flour, baking powder and salt, then add to the wet ingredients in two additions, mixing just until a soft dough forms.' },
    { heading: 'Chill the dough', text: 'Divide the dough in half, flatten into discs, wrap and refrigerate for at least 1 hour so the cookies hold their shape.', image: img('1607920592519-bab2a80a2cb7', 900, 600) },
    { heading: 'Roll and cut', text: 'Roll the dough to ¼-inch thickness on a floured surface and cut out your shapes. Place on parchment-lined baking sheets an inch apart.' },
    { heading: 'Bake', text: 'Bake at 350°F (175°C) for 10–12 minutes, until the edges are just set but not browned. Cool on the sheet for 5 minutes before transferring.' },
    { heading: 'Decorate', text: 'Whisk the icing ingredients until smooth, tint as desired, and decorate the fully cooled cookies. Let set before stacking.' },
  ],
  notes: ['Bring the butter to true room temperature — too cold and it won’t cream, too warm and the cookies spread.'],
  tips: ['For crisp edges, chill the cut cookies again for 10 minutes right before baking.', 'A little almond extract alongside the vanilla adds a bakery-style flavor.'],
  variations: ['Swap half the vanilla for peppermint extract for a festive twist.', 'Press sprinkles into the dough before baking for no-icing cookies.'],
  substitutions: ['Use a 1:1 gluten-free flour blend in place of all-purpose flour.'],
  storage: 'Store decorated cookies in an airtight container at room temperature for up to 1 week.',
  makeAhead: 'The dough can be made up to 3 days ahead, or frozen for up to 3 months. Thaw overnight before rolling.',
  nutrition: {
    calories: '140 kcal',
    protein: '2 g',
    carbohydrates: '20 g',
    fat: '6 g',
    fiber: '0 g',
    sugar: '11 g',
    sodium: '65 mg',
  },
  gallery: [
    { src: img('1607920592519-bab2a80a2cb7', 700, 700), alt: 'Rolling out cookie dough' },
    { src: img('1512909006721-3d6018887383', 700, 700), alt: 'Cut-out cookies ready to bake' },
    { src: img('1481391319762-47dff72954d9', 700, 700), alt: 'Decorated sugar cookies' },
  ],
  products: [
    { name: 'Stainless Cookie Cutter Set', blurb: 'A 12-piece holiday shape set that cuts cleanly every time.', price: '$16', image: img('1607920592519-bab2a80a2cb7', 400, 400), href: '#' },
    { name: 'Heavy-Gauge Baking Sheets', blurb: 'Warp-resistant pans for even, edge-to-edge baking.', price: '$28', image: img('1512909006721-3d6018887383', 400, 400), href: '#' },
  ],
  pinterest: {
    title: 'Easy Christmas Sugar Cookies 🍪',
    description: 'Soft, buttery cut-out sugar cookies that hold their shape — perfect for holiday decorating.',
    image: img('1481391319762-47dff72954d9', 1000, 1500),
  },
  seo: {
    seoTitle: 'Easy Christmas Sugar Cookies (Soft & Perfect for Decorating)',
    metaDescription:
      'The best easy Christmas sugar cookies — soft, buttery cut-outs that hold their shape, with a simple icing perfect for holiday decorating.',
    canonicalUrl: 'https://marigoldandmaple.com/recipe/christmas-sugar-cookies',
    robots: 'index,follow',
    ogImage: img('1481391319762-47dff72954d9', 1200, 630),
    schemaType: 'Recipe',
  },
  status: 'published',
  relatedRecipes: ['halloween-punch', 'garlic-pasta'],
}

/* ======================= EXAMPLE 2 — Halloween Party Punch ======================= */
const halloweenPunch: RecipeFull = {
  id: 'rc-halloween-punch',
  title: 'Easy Halloween Party Punch',
  slug: 'halloween-punch',
  description:
    'A spooky-cute, non-alcoholic party punch that glows a ghoulish green and comes together in five minutes — with a boozy option for the grown-ups.',
  featuredImage: img('1536935338788-846bb9981813', 1400, 900),
  imageAlt: 'Glasses of green Halloween party punch with garnish',
  imageCaption: 'A fizzy, color-changing punch that doubles as a centerpiece.',
  imageCredit: 'Photo: Kelsey Chance',
  pinterestImage: img('1536935338788-846bb9981813', 1000, 1500),
  author: bios.maya,
  publishedDate: 'October 3, 2026',
  category: 'Drinks',
  subcategory: 'Party Drinks',
  occasions: ['Halloween'],
  seasons: ['Fall'],
  tags: ['Halloween', 'Punch', 'Party Drinks', 'Mocktail'],
  styles: ['Fun', 'Family-friendly'],
  prepTime: '5 min',
  totalTime: '5 min',
  servings: 12,
  servingUnit: 'servings',
  difficulty: 'Easy',
  cost: '$12',
  season: 'halloween',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Recipes', href: '/recipes' },
    { label: 'Drinks', href: '/recipes/drinks' },
    { label: 'Halloween Party Punch', href: '/recipe/halloween-punch' },
  ],
  ingredientGroups: [
    {
      items: [
        { qty: 4, unit: 'cups', name: 'lime sherbet' },
        { qty: 2, unit: 'L', name: 'lemon-lime soda', note: 'chilled' },
        { qty: 4, unit: 'cups', name: 'pineapple juice', note: 'chilled' },
        { qty: 1, unit: 'cup', name: 'green apple slices' },
        { name: 'Gummy worms', note: 'for garnish' },
        { name: 'Dry ice', note: 'optional, for fog — handle with care' },
      ],
    },
  ],
  equipment: ['Large punch bowl', 'Ladle', 'Ice ring mold'],
  instructions: [
    { heading: 'Chill everything', text: 'Make sure the soda and juice are well chilled — a warm punch waters down fast as the sherbet melts.' },
    { heading: 'Build the base', text: 'Pour the pineapple juice into a large punch bowl, then slowly add the lemon-lime soda down the side to keep the fizz.' },
    { heading: 'Add the sherbet', text: 'Scoop the lime sherbet in just before serving so it floats and foams into a spooky green cream on top.' },
    { heading: 'Garnish and serve', text: 'Float apple slices and gummy worms on top. For dramatic fog, add a small piece of dry ice to the bowl (never to individual cups).' },
  ],
  tips: ['For adults, add 1½ cups of vodka or white rum with the juice.', 'Freeze an ice ring with berries inside so it chills the punch without diluting it.'],
  variations: ['Swap lime sherbet for orange to make a “pumpkin” punch.'],
  storage: 'Best served fresh; keep the base (without sherbet) covered in the fridge for up to 1 day.',
  makeAhead: 'Mix the juice and apple slices ahead; add soda and sherbet right before guests arrive.',
  gallery: [
    { src: img('1536935338788-846bb9981813', 700, 700), alt: 'Green party punch in glasses' },
    { src: img('1514362545857-3bc16c4c7d1b', 700, 700), alt: 'Halloween drinks table' },
  ],
  pinterest: {
    title: 'Easy Halloween Party Punch 🎃',
    description: 'A glowing green, spooky-cute party punch that comes together in 5 minutes.',
    image: img('1536935338788-846bb9981813', 1000, 1500),
  },
  seo: {
    seoTitle: 'Easy Halloween Party Punch (Non-Alcoholic + Boozy Option)',
    metaDescription:
      'A spooky-cute green Halloween party punch that comes together in 5 minutes — kid-friendly, with an easy grown-up variation.',
    canonicalUrl: 'https://marigoldandmaple.com/recipe/halloween-punch',
    robots: 'index,follow',
    ogImage: img('1536935338788-846bb9981813', 1200, 630),
    schemaType: 'Recipe',
  },
  status: 'published',
  relatedRecipes: ['christmas-sugar-cookies', 'garlic-pasta'],
}

/* ======================= EXAMPLE 3 — Creamy Garlic Pasta ======================= */
const garlicPasta: RecipeFull = {
  id: 'rc-garlic-pasta',
  title: 'Creamy Garlic Pasta',
  slug: 'garlic-pasta',
  description:
    'A restaurant-worthy creamy garlic pasta that comes together in one pan in under 30 minutes — the weeknight dinner you’ll make on repeat.',
  featuredImage: img('1621996346565-e3dbc646d9a9', 1400, 900),
  imageAlt: 'Bowl of creamy garlic pasta with parsley',
  imageCaption: 'Silky, garlicky and ready in the time it takes the pasta to boil.',
  imageCredit: 'Photo: Eaters Collective',
  pinterestImage: img('1621996346565-e3dbc646d9a9', 1000, 1500),
  author: bios.maya,
  publishedDate: 'September 8, 2026',
  category: 'Dinner',
  subcategory: 'Pasta',
  occasions: [],
  seasons: ['All Season'],
  tags: ['Pasta', 'Quick Meals', 'Dinner', 'Vegetarian'],
  styles: ['Comfort Food', 'Weeknight'],
  rating: { value: 4.9, count: 512 },
  prepTime: '10 min',
  cookTime: '15 min',
  totalTime: '25 min',
  servings: 4,
  servingUnit: 'servings',
  calories: '520 kcal',
  difficulty: 'Easy',
  season: 'fall',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Recipes', href: '/recipes' },
    { label: 'Dinner', href: '/recipes/dinner' },
    { label: 'Creamy Garlic Pasta', href: '/recipe/garlic-pasta' },
  ],
  ingredientGroups: [
    {
      items: [
        { qty: 1, unit: 'lb', name: 'fettuccine or linguine' },
        { qty: 6, name: 'garlic cloves', note: 'minced' },
        { qty: 3, unit: 'tbsp', name: 'butter' },
        { qty: 1, unit: 'cup', name: 'heavy cream' },
        { qty: 1, unit: 'cup', name: 'parmesan', note: 'freshly grated' },
        { qty: 2, unit: 'tbsp', name: 'olive oil' },
        { name: 'Salt and black pepper', note: 'to taste' },
        { qty: 2, unit: 'tbsp', name: 'fresh parsley', note: 'chopped' },
      ],
    },
  ],
  equipment: ['Large pot', 'Deep skillet', 'Microplane or grater'],
  instructions: [
    { heading: 'Cook the pasta', text: 'Boil the pasta in well-salted water until just shy of al dente. Reserve 1 cup of pasta water before draining.' },
    { heading: 'Bloom the garlic', text: 'Melt the butter with the olive oil over medium heat, add the minced garlic and cook gently for 1–2 minutes until fragrant but not browned.' },
    { heading: 'Build the sauce', text: 'Pour in the cream and bring to a gentle simmer, then whisk in the parmesan until smooth and glossy.' },
    { heading: 'Toss and finish', text: 'Add the drained pasta to the sauce, loosening with splashes of reserved pasta water until silky. Season, fold in parsley and serve immediately.', image: img('1473093295043-cdd812d0e601', 900, 600) },
  ],
  tips: ['Grate the parmesan yourself — pre-shredded cheese won’t melt into a smooth sauce.', 'Add a pinch of red pepper flakes for gentle heat.'],
  variations: ['Add sautéed mushrooms or wilted spinach.', 'Stir in grilled chicken or shrimp to make it a heartier main.'],
  substitutions: ['Use half-and-half for a lighter sauce, or a cashew cream to keep it dairy-free.'],
  storage: 'Refrigerate leftovers up to 3 days; reheat gently with a splash of milk to loosen the sauce.',
  nutrition: {
    calories: '520 kcal',
    protein: '17 g',
    carbohydrates: '58 g',
    fat: '25 g',
    fiber: '3 g',
    sugar: '3 g',
    sodium: '480 mg',
  },
  products: [
    { name: 'Rotary Cheese Grater', blurb: 'Grates parmesan into fine, meltable ribbons in seconds.', price: '$22', image: img('1473093295043-cdd812d0e601', 400, 400), href: '#' },
  ],
  pinterest: {
    title: 'Creamy Garlic Pasta (25-Minute Dinner) 🍝',
    description: 'A silky one-pan creamy garlic pasta that’s ready in under 30 minutes.',
    image: img('1621996346565-e3dbc646d9a9', 1000, 1500),
  },
  seo: {
    seoTitle: 'Creamy Garlic Pasta (Easy 25-Minute One-Pan Dinner)',
    metaDescription:
      'A silky, restaurant-worthy creamy garlic pasta made in one pan in under 30 minutes — the perfect easy weeknight dinner.',
    canonicalUrl: 'https://marigoldandmaple.com/recipe/garlic-pasta',
    robots: 'index,follow',
    ogImage: img('1621996346565-e3dbc646d9a9', 1200, 630),
    schemaType: 'Recipe',
  },
  status: 'published',
  relatedRecipes: ['christmas-sugar-cookies', 'halloween-punch'],
}

export const recipesBySlug: Record<string, RecipeFull> = {
  'christmas-sugar-cookies': sugarCookies,
  'halloween-punch': halloweenPunch,
  'garlic-pasta': garlicPasta,
}

export function getRecipe(slug: string): RecipeFull | undefined {
  return recipesBySlug[slug]
}

/* Card object for a recipe (used in related grids) */
const recipeCard = (r: RecipeFull): Article => ({
  id: r.id,
  title: r.title,
  category: r.subcategory || r.category,
  href: `/recipe/${r.slug}`,
  image: r.featuredImage,
  author: r.author,
  date: r.publishedDate,
  readTime: r.totalTime ? `${r.totalTime} total` : undefined,
})

/* Related recipes (approx. 10): explicit picks first, then relevance by
   shared category / occasion / season / tags, then the rest of the pool.
   In production this ranking is CMS-driven. */
export function relatedRecipes(r: RecipeFull): Article[] {
  const others = Object.values(recipesBySlug).filter((x) => x.slug !== r.slug)

  const score = (x: RecipeFull) => {
    let s = 0
    if (x.category === r.category) s += 3
    if (x.subcategory && x.subcategory === r.subcategory) s += 3
    s += x.occasions.filter((o) => r.occasions.includes(o)).length * 2
    s += x.seasons.filter((se) => r.seasons.includes(se)).length
    s += x.tags.filter((t) => r.tags.includes(t)).length
    return s
  }

  const explicit = (r.relatedRecipes ?? [])
    .map((s) => recipesBySlug[s])
    .filter(Boolean) as RecipeFull[]

  const ranked = others
    .filter((x) => !explicit.includes(x))
    .sort((a, b) => score(b) - score(a))

  const recipeCards = [...explicit, ...ranked].map(recipeCard)

  /* Top up to ~10 with cross-links to existing articles for a full grid */
  const articleCards = Object.values(articlesBySlug).map((a) => ({
    id: a.id,
    title: a.title,
    category: a.subcategory || a.category,
    href: `/article/${a.slug}`,
    image: a.featuredImage,
    author: a.author,
    date: a.publishedDate,
  }))

  return [...recipeCards, ...articleCards].slice(0, 10)
}
