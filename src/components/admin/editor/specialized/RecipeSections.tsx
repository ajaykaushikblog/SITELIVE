import { ConceptNote } from '../../ui'
import {
  SpecSection, RowList, DurationInput, ImageField, TipsEditor, GalleryEditor,
  AffiliateProductsEditor, LabeledSelect, LabeledInput, ctrl, label,
} from './Shared'
import {
  cuisineOptions, courseOptions, recipeDifficulty,
  formatDuration, recipeTotal, durationToMin,
  newIngredient, newIngredientGroup, newRecipeStep, newEquipment,
  type RecipeData, type Ingredient, type IngredientGroup, type RecipeStep, type EquipmentItem,
} from '../../../../lib/admin/specialized'

/* Recipe-specific structured editor. Extends the universal editor — the
   universal title/slug/taxonomy/SEO/Pinterest/social/publishing live in the
   shared chrome; these sections add the recipe data model (Phase 15 §2–19). */
export function RecipeSections({ data, onChange }: { data: RecipeData; onChange: (d: RecipeData) => void }) {
  const patch = (p: Partial<RecipeData>) => onChange({ ...data, ...p })
  const total = recipeTotal(data)

  return (
    <div className="space-y-3">
      <SpecSection title="Recipe information" defaultOpen>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LabeledSelect label="Cuisine" value={data.cuisine} onChange={(v) => patch({ cuisine: v })} options={cuisineOptions} placeholder="Select cuisine…" />
          <LabeledSelect label="Course" value={data.course} onChange={(v) => patch({ course: v })} options={courseOptions} placeholder="Select course…" />
          <LabeledSelect label="Difficulty" value={data.difficulty} onChange={(v) => patch({ difficulty: v })} options={recipeDifficulty} />
          <LabeledInput label="Recipe category" value={data.recipeCategory} onChange={(v) => patch({ recipeCategory: v })} placeholder="e.g. Cookies" />
        </div>
        <div className="mt-3">
          <LabeledInput label="Keywords / tags" value={data.keywords.join(', ')} onChange={(v) => patch({ keywords: v.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="comma, separated" />
        </div>
      </SpecSection>

      <SpecSection title="Timing" hint="Total is calculated automatically from prep + cook. Toggle to override manually.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><span className={label}>Prep time</span><DurationInput value={data.prepTime} onChange={(prepTime) => patch({ prepTime })} /></div>
          <div><span className={label}>Cook time</span><DurationInput value={data.cookTime} onChange={(cookTime) => patch({ cookTime })} /></div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-[0.8rem] text-foreground">
          <input type="checkbox" checked={data.totalOverride} onChange={(e) => patch({ totalOverride: e.target.checked })} /> Override total time
        </label>
        {data.totalOverride ? (
          <div className="mt-2"><DurationInput value={data.totalTime} onChange={(totalTime) => patch({ totalTime })} /></div>
        ) : (
          <p className="mt-2 text-[0.85rem] text-foreground">Total time: <strong>{formatDuration(total)}</strong></p>
        )}
      </SpecSection>

      <SpecSection title="Servings">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <span className={label}>Default servings</span>
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1">
              <button type="button" onClick={() => patch({ servings: { ...data.servings, default: Math.max(data.servings.min, data.servings.default - 1) } })} className="grid h-7 w-7 place-items-center rounded hover:bg-secondary" aria-label="Decrease servings">−</button>
              <span className="min-w-8 text-center text-[0.95rem] font-semibold text-foreground">{data.servings.default}</span>
              <button type="button" onClick={() => patch({ servings: { ...data.servings, default: Math.min(data.servings.max, data.servings.default + 1) } })} className="grid h-7 w-7 place-items-center rounded hover:bg-secondary" aria-label="Increase servings">+</button>
            </div>
          </div>
          <label className="w-24"><span className={label}>Min</span><input type="number" min={1} value={data.servings.min} onChange={(e) => patch({ servings: { ...data.servings, min: Number(e.target.value) || 1 } })} className={ctrl} /></label>
          <label className="w-24"><span className={label}>Max</span><input type="number" min={1} value={data.servings.max} onChange={(e) => patch({ servings: { ...data.servings, max: Number(e.target.value) || 1 } })} className={ctrl} /></label>
          <label className="w-32"><span className={label}>Unit</span><input value={data.servings.unit} onChange={(e) => patch({ servings: { ...data.servings, unit: e.target.value } })} placeholder="servings" className={ctrl} /></label>
        </div>
        <p className="mt-2 text-[0.72rem] text-muted-foreground">The public recipe page uses this to scale ingredient quantities.</p>
      </SpecSection>

      <SpecSection title="Ingredients" badge={`${data.ingredientGroups.reduce((n, g) => n + g.items.length, 0)}`}>
        <IngredientGroups groups={data.ingredientGroups} onChange={(ingredientGroups) => patch({ ingredientGroups })} />
      </SpecSection>

      <SpecSection title="Instructions" badge={`${data.instructions.length} steps`}>
        <RowList<RecipeStep>
          items={data.instructions} onChange={(instructions) => patch({ instructions })} makeItem={newRecipeStep} addLabel="Add step" minRows={1}
          renderRow={(step, p, i) => (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/12 text-[0.75rem] font-semibold text-primary">{i + 1}</span>
                <input value={step.timing} onChange={(e) => p({ timing: e.target.value })} placeholder="Timing (optional, e.g. 5 min)" className={`${ctrl} max-w-[220px]`} />
              </div>
              <textarea rows={2} value={step.text} onChange={(e) => p({ text: e.target.value })} placeholder="Instruction…" className={`${ctrl} resize-y`} />
              <input value={step.tip} onChange={(e) => p({ tip: e.target.value })} placeholder="Step tip (optional)" className={ctrl} />
              <ImageField url={step.image} onPick={(url) => p({ image: url })} onClear={() => p({ image: '' })} ratio="aspect-video" />
            </div>
          )}
        />
      </SpecSection>

      <SpecSection title="Equipment" hint="Optional. Each item can link to an affiliate product.">
        <RowList<EquipmentItem>
          items={data.equipment} onChange={(equipment) => patch({ equipment })} makeItem={newEquipment} addLabel="Add equipment"
          renderRow={(eq, p) => (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_90px]">
              <input value={eq.name} onChange={(e) => p({ name: e.target.value })} placeholder="Equipment name" className={ctrl} />
              <input value={eq.qty} onChange={(e) => p({ qty: e.target.value })} placeholder="Qty" className={ctrl} />
            </div>
          )}
        />
      </SpecSection>

      <SpecSection title="Nutrition" hint="Optional. Enter genuine values only — nothing is auto-generated.">
        <label className="mb-3 flex items-center gap-2 text-[0.82rem] text-foreground">
          <input type="checkbox" checked={data.nutrition.available} onChange={(e) => patch({ nutrition: { ...data.nutrition, available: e.target.checked } })} /> Nutrition data is available
        </label>
        {data.nutrition.available ? (
          <>
            <LabeledSelect label="Basis" value={data.nutrition.basis} onChange={(v) => patch({ nutrition: { ...data.nutrition, basis: v as RecipeData['nutrition']['basis'] } })} options={['serving', 'recipe']} />
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(['calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar', 'sodium'] as const).map((k) => (
                <label key={k} className="block">
                  <span className="mb-1 block text-[0.68rem] capitalize text-muted-foreground">{k}</span>
                  <input value={data.nutrition[k]} onChange={(e) => patch({ nutrition: { ...data.nutrition, [k]: e.target.value } })} placeholder="—" className={ctrl} />
                </label>
              ))}
            </div>
          </>
        ) : (
          <ConceptNote>Nutrition data not available — the public recipe page will hide the nutrition panel.</ConceptNote>
        )}
      </SpecSection>

      <SpecSection title="Recipe notes" hint="Storage, make-ahead, substitutions, serving suggestions.">
        <textarea rows={4} value={data.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Add recipe notes…" className={`${ctrl} resize-y leading-relaxed`} />
      </SpecSection>

      <SpecSection title="Tips" badge={`${data.tips.length}`}>
        <TipsEditor tips={data.tips} onChange={(tips) => patch({ tips })} />
      </SpecSection>

      <SpecSection title="Recipe gallery" badge={`${data.gallery.length}`}>
        <GalleryEditor gallery={data.gallery} onChange={(gallery) => patch({ gallery })} />
      </SpecSection>

      <SpecSection title="Affiliate products" badge={`${data.products.length}`}>
        <AffiliateProductsEditor products={data.products} onChange={(products) => patch({ products })} kindHint="Cookware, tools, appliances or ingredients." />
      </SpecSection>

      <SpecSection title="PDF download (future)" hint="Configuration only — actual PDF generation is connected later.">
        <label className="mb-3 flex items-center gap-2 text-[0.82rem] text-foreground">
          <input type="checkbox" checked={data.pdf.enabled} onChange={(e) => patch({ pdf: { ...data.pdf, enabled: e.target.checked } })} /> Enable PDF download
        </label>
        {data.pdf.enabled && (
          <div className="space-y-3">
            <LabeledInput label="PDF title" value={data.pdf.title} onChange={(v) => patch({ pdf: { ...data.pdf, title: v } })} placeholder="Printable recipe title" />
            <ImageField label="Cover image" url={data.pdf.coverImage} onPick={(url) => patch({ pdf: { ...data.pdf, coverImage: url } })} onClear={() => patch({ pdf: { ...data.pdf, coverImage: '' } })} />
            {(['includeNutrition', 'includeNotes', 'includeAuthor'] as const).map((k) => (
              <label key={k} className="flex items-center gap-2 text-[0.82rem] text-foreground">
                <input type="checkbox" checked={data.pdf[k]} onChange={(e) => patch({ pdf: { ...data.pdf, [k]: e.target.checked } })} /> {k.replace('include', 'Include ')}
              </label>
            ))}
          </div>
        )}
      </SpecSection>

      <div className="rounded-lg border border-border bg-secondary/30 p-3 text-[0.72rem] text-muted-foreground">
        <strong className="text-foreground">Recipe structured data</strong> (schema.org/Recipe) auto-derives from these fields: name, image, author, description, prep {durationToMin(data.prepTime)}m · cook {durationToMin(data.cookTime)}m · total {formatDuration(total)}, yield {data.servings.default} {data.servings.unit}, {data.ingredientGroups.reduce((n, g) => n + g.items.length, 0)} ingredients, {data.instructions.length} steps{data.nutrition.available ? ', nutrition' : ''}. Rating fields appear only with genuine review data.
      </div>
    </div>
  )
}

/* Ingredient groups (each group holds a reorderable list of ingredients) */
function IngredientGroups({ groups, onChange }: { groups: IngredientGroup[]; onChange: (g: IngredientGroup[]) => void }) {
  const patchGroup = (id: string, p: Partial<IngredientGroup>) => onChange(groups.map((g) => (g.id === id ? { ...g, ...p } : g)))
  const moveGroup = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= groups.length) return
    const next = [...groups]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="space-y-3">
      {groups.map((group, gi) => (
        <div key={group.id} className="rounded-lg border border-border bg-secondary/20 p-3">
          <div className="mb-2 flex items-center gap-2">
            <input value={group.title} onChange={(e) => patchGroup(group.id, { title: e.target.value })} placeholder="Group name (optional, e.g. For the Dough)" className={`${ctrl} font-semibold`} />
            <button type="button" onClick={() => moveGroup(gi, -1)} disabled={gi === 0} className="grid h-7 w-7 shrink-0 place-items-center rounded text-muted-foreground hover:bg-secondary disabled:opacity-25" aria-label="Move group up">↑</button>
            <button type="button" onClick={() => moveGroup(gi, 1)} disabled={gi === groups.length - 1} className="grid h-7 w-7 shrink-0 place-items-center rounded text-muted-foreground hover:bg-secondary disabled:opacity-25" aria-label="Move group down">↓</button>
            <button type="button" onClick={() => groups.length > 1 && onChange(groups.filter((g) => g.id !== group.id))} disabled={groups.length <= 1} className="grid h-7 w-7 shrink-0 place-items-center rounded text-muted-foreground hover:bg-error/10 hover:text-error disabled:opacity-25" aria-label="Delete group">✕</button>
          </div>
          <RowList<Ingredient>
            items={group.items} onChange={(items) => patchGroup(group.id, { items })} makeItem={newIngredient} addLabel="Add ingredient" minRows={1}
            renderRow={(ing, p) => (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input value={ing.qty} onChange={(e) => p({ qty: e.target.value })} placeholder="Qty" className={ctrl} />
                <input value={ing.unit} onChange={(e) => p({ unit: e.target.value })} placeholder="Unit" className={ctrl} />
                <input value={ing.name} onChange={(e) => p({ name: e.target.value })} placeholder="Ingredient" className={`${ctrl} col-span-2 sm:col-span-1`} />
                <input value={ing.prep} onChange={(e) => p({ prep: e.target.value })} placeholder="Prep (e.g. sifted)" className={`${ctrl} col-span-2 sm:col-span-1`} />
              </div>
            )}
          />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...groups, newIngredientGroup()])} className="text-[0.8rem] font-semibold text-primary hover:text-foreground">+ Add ingredient group</button>
    </div>
  )
}
