/* =========================================================================
   Phase 15 — Specialized editor data models (Recipe + DIY)
   These EXTEND the universal EditorContent (Phase 14) rather than replacing
   it. Every recipe/DIY document still carries the universal title, slug,
   taxonomy, blocks, SEO, Pinterest, social and publishing fields; these
   structures live alongside them under `recipeData` / `diyData`.
   All values are editor-supplied — nothing is fabricated (no fake nutrition,
   ratings, costs or SEO scores).
   ========================================================================= */
import type { ChecklistItem } from './editor'

let seq = 0
export const rid = (p = 's') => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`

/* ---- Shared time model: hours + minutes, with auto total + manual override ---- */
export type Duration = { hours: number; minutes: number }
export const emptyDuration = (): Duration => ({ hours: 0, minutes: 0 })
export const durationToMin = (d: Duration) => d.hours * 60 + d.minutes
export const minToDuration = (m: number): Duration => ({ hours: Math.floor(m / 60), minutes: m % 60 })
export function formatDuration(d: Duration): string {
  const parts: string[] = []
  if (d.hours) parts.push(`${d.hours} hr`)
  if (d.minutes) parts.push(`${d.minutes} min`)
  return parts.length ? parts.join(' ') : '—'
}

/* ---- Configurable option lists (not hard-coded into the public template) ---- */
export const cuisineOptions = ['American', 'Italian', 'Mexican', 'French', 'Mediterranean', 'Asian', 'Indian', 'Middle Eastern', 'Other']
export const courseOptions = ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Appetizer', 'Side', 'Dessert', 'Snack', 'Drink']
export const recipeDifficulty = ['Easy', 'Medium', 'Hard']
export const diyDifficulty = ['Easy', 'Intermediate', 'Advanced']
export const currencyOptions = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

/* ---- Recipe substructures ---- */
export type Ingredient = { id: string; qty: string; unit: string; name: string; prep: string }
export type IngredientGroup = { id: string; title: string; items: Ingredient[] }
export type RecipeStep = { id: string; text: string; image: string; timing: string; tip: string }
export type EquipmentItem = { id: string; name: string; qty: string; affiliateId: string }
export type Tip = { id: string; title: string; description: string }
export type GalleryImage = { id: string; url: string; alt: string; caption: string; primary: boolean }
export type NutritionBasis = 'serving' | 'recipe'
export type Nutrition = { basis: NutritionBasis; available: boolean; calories: string; protein: string; carbohydrates: string; fat: string; fiber: string; sugar: string; sodium: string }
export type AffiliateProductRef = { id: string; productName: string; imageUrl: string; price: string; merchant: string; affiliateUrl: string; cta: string; disclosure: string }
export type PdfConfig = { enabled: boolean; title: string; coverImage: string; includeNutrition: boolean; includeNotes: boolean; includeAuthor: boolean }

export type RecipeData = {
  cuisine: string
  course: string
  difficulty: string
  recipeCategory: string
  keywords: string[]
  prepTime: Duration
  cookTime: Duration
  totalOverride: boolean
  totalTime: Duration
  servings: { default: number; min: number; max: number; unit: string }
  ingredientGroups: IngredientGroup[]
  instructions: RecipeStep[]
  equipment: EquipmentItem[]
  nutrition: Nutrition
  notes: string
  tips: Tip[]
  gallery: GalleryImage[]
  products: AffiliateProductRef[]
  pdf: PdfConfig
}

/* ---- DIY substructures ---- */
export type Material = { id: string; qty: string; unit: string; name: string; note: string; affiliateId: string }
export type Tool = { id: string; name: string; qty: string; note: string; affiliateId: string }
export type DiyStep = { id: string; title: string; text: string; image: string; tip: string }
export type Variation = { id: string; title: string; description: string; image: string }

export type DiyData = {
  difficulty: string
  occasion: string
  season: string
  prepTime: Duration
  projectTime: Duration
  totalOverride: boolean
  totalTime: Duration
  cost: { amount: string; currency: string; unspecified: boolean }
  materials: Material[]
  tools: Tool[]
  steps: DiyStep[]
  tips: Tip[]
  variations: Variation[]
  gallery: GalleryImage[]
  products: AffiliateProductRef[]
}

/* ---- Factories (empty, editor fills them) ---- */
export const newIngredient = (): Ingredient => ({ id: rid('ing'), qty: '', unit: '', name: '', prep: '' })
export const newIngredientGroup = (title = ''): IngredientGroup => ({ id: rid('grp'), title, items: [newIngredient()] })
export const newRecipeStep = (): RecipeStep => ({ id: rid('step'), text: '', image: '', timing: '', tip: '' })
export const newEquipment = (): EquipmentItem => ({ id: rid('eq'), name: '', qty: '', affiliateId: '' })
export const newTip = (): Tip => ({ id: rid('tip'), title: '', description: '' })
export const newGalleryImage = (url = '', alt = '', primary = false): GalleryImage => ({ id: rid('gal'), url, alt, caption: '', primary })
export const newAffiliate = (): AffiliateProductRef => ({ id: rid('aff'), productName: '', imageUrl: '', price: '', merchant: '', affiliateUrl: '', cta: 'Shop now', disclosure: 'This post may contain affiliate links.' })
export const newMaterial = (): Material => ({ id: rid('mat'), qty: '', unit: '', name: '', note: '', affiliateId: '' })
export const newTool = (): Tool => ({ id: rid('tool'), name: '', qty: '', note: '', affiliateId: '' })
export const newDiyStep = (): DiyStep => ({ id: rid('dstep'), title: '', text: '', image: '', tip: '' })
export const newVariation = (): Variation => ({ id: rid('var'), title: '', description: '', image: '' })

export function emptyRecipeData(): RecipeData {
  return {
    cuisine: '', course: '', difficulty: 'Easy', recipeCategory: '', keywords: [],
    prepTime: emptyDuration(), cookTime: emptyDuration(), totalOverride: false, totalTime: emptyDuration(),
    servings: { default: 4, min: 1, max: 12, unit: 'servings' },
    ingredientGroups: [newIngredientGroup()],
    instructions: [newRecipeStep()],
    equipment: [],
    nutrition: { basis: 'serving', available: false, calories: '', protein: '', carbohydrates: '', fat: '', fiber: '', sugar: '', sodium: '' },
    notes: '', tips: [], gallery: [], products: [],
    pdf: { enabled: false, title: '', coverImage: '', includeNutrition: true, includeNotes: true, includeAuthor: true },
  }
}

export function emptyDiyData(): DiyData {
  return {
    difficulty: 'Easy', occasion: '', season: '',
    prepTime: emptyDuration(), projectTime: emptyDuration(), totalOverride: false, totalTime: emptyDuration(),
    cost: { amount: '', currency: 'USD', unspecified: false },
    materials: [newMaterial()],
    tools: [newTool()],
    steps: [newDiyStep()],
    tips: [], variations: [], gallery: [], products: [],
  }
}

/* Auto-total unless the editor overrode it */
export const recipeTotal = (r: RecipeData): Duration => (r.totalOverride ? r.totalTime : minToDuration(durationToMin(r.prepTime) + durationToMin(r.cookTime)))
export const diyTotal = (d: DiyData): Duration => (d.totalOverride ? d.totalTime : minToDuration(durationToMin(d.prepTime) + durationToMin(d.projectTime)))

/* ---- Specialized pre-publish checklists (severity: required/recommended/optional) ---- */
export type SpecSeverity = 'required' | 'recommended' | 'optional'
export type SpecCheck = { label: string; pass: boolean; severity: SpecSeverity }

export function recipeChecklist(r: RecipeData): SpecCheck[] {
  const hasIngredients = r.ingredientGroups.some((g) => g.items.some((i) => i.name.trim()))
  const hasInstructions = r.instructions.some((s) => s.text.trim())
  return [
    { label: 'At least one ingredient', pass: hasIngredients, severity: 'required' },
    { label: 'At least one instruction', pass: hasInstructions, severity: 'required' },
    { label: 'Prep time', pass: durationToMin(r.prepTime) > 0, severity: 'required' },
    { label: 'Cook time', pass: durationToMin(r.cookTime) > 0, severity: 'recommended' },
    { label: 'Servings', pass: r.servings.default > 0, severity: 'required' },
    { label: 'Difficulty', pass: !!r.difficulty, severity: 'recommended' },
    { label: 'Equipment listed', pass: r.equipment.length > 0, severity: 'optional' },
    { label: 'Nutrition provided', pass: r.nutrition.available, severity: 'optional' },
    { label: 'Recipe gallery', pass: r.gallery.length > 0, severity: 'optional' },
  ]
}

export function diyChecklist(d: DiyData): SpecCheck[] {
  const hasMaterials = d.materials.some((m) => m.name.trim())
  const hasTools = d.tools.some((t) => t.name.trim())
  const hasSteps = d.steps.some((s) => s.text.trim() || s.title.trim())
  return [
    { label: 'Difficulty', pass: !!d.difficulty, severity: 'required' },
    { label: 'At least one material', pass: hasMaterials, severity: 'required' },
    { label: 'At least one tool', pass: hasTools, severity: 'recommended' },
    { label: 'At least one step', pass: hasSteps, severity: 'required' },
    { label: 'Estimated cost or “not specified”', pass: d.cost.unspecified || !!d.cost.amount.trim(), severity: 'recommended' },
    { label: 'Project gallery', pass: d.gallery.length > 0, severity: 'optional' },
    { label: 'Variations', pass: d.variations.length > 0, severity: 'optional' },
  ]
}

/* Merge universal + specialized checklist items so one dialog shows everything */
export function toChecklistItems(list: SpecCheck[]): ChecklistItem[] {
  return list.map((c) => ({ label: c.label, pass: c.pass, severity: c.severity === 'required' ? 'required' : 'recommended' }))
}
