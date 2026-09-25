import {
  SpecSection, RowList, DurationInput, ImageField, TipsEditor, GalleryEditor,
  AffiliateProductsEditor, LabeledSelect, LabeledInput, ctrl, label,
} from './Shared'
import {
  diyDifficulty, currencyOptions, formatDuration, diyTotal,
  newMaterial, newTool, newDiyStep, newVariation,
  type DiyData, type Material, type Tool, type DiyStep, type Variation,
} from '../../../../lib/admin/specialized'
import { taxonomyByKind } from '../../../../lib/admin/cms'

/* DIY / Tutorial structured editor. Extends the universal editor (Phase 15
   §20–32). Universal fields live in the shared chrome; these add the DIY
   project data model. */
export function DiySections({ data, onChange }: { data: DiyData; onChange: (d: DiyData) => void }) {
  const patch = (p: Partial<DiyData>) => onChange({ ...data, ...p })
  const total = diyTotal(data)

  return (
    <div className="space-y-3">
      <SpecSection title="Project information" defaultOpen>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LabeledSelect label="Difficulty" value={data.difficulty} onChange={(v) => patch({ difficulty: v })} options={diyDifficulty} />
          <LabeledSelect label="Occasion" value={data.occasion} onChange={(v) => patch({ occasion: v })} options={taxonomyByKind.occasion.map((t) => t.name)} placeholder="Select occasion…" />
          <LabeledSelect label="Season" value={data.season} onChange={(v) => patch({ season: v })} options={taxonomyByKind.season.map((t) => t.name)} placeholder="Select season…" />
        </div>
      </SpecSection>

      <SpecSection title="Time & cost" hint="Total time is auto-calculated. Cost is optional — mark “not specified” when unknown.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><span className={label}>Preparation time</span><DurationInput value={data.prepTime} onChange={(prepTime) => patch({ prepTime })} /></div>
          <div><span className={label}>Project time</span><DurationInput value={data.projectTime} onChange={(projectTime) => patch({ projectTime })} /></div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-[0.8rem] text-foreground">
          <input type="checkbox" checked={data.totalOverride} onChange={(e) => patch({ totalOverride: e.target.checked })} /> Override total time
        </label>
        {data.totalOverride ? (
          <div className="mt-2"><DurationInput value={data.totalTime} onChange={(totalTime) => patch({ totalTime })} /></div>
        ) : (
          <p className="mt-2 text-[0.85rem] text-foreground">Total time: <strong>{formatDuration(total)}</strong></p>
        )}
        <div className="mt-4 border-t border-border pt-4">
          <label className="mb-2 flex items-center gap-2 text-[0.8rem] text-foreground">
            <input type="checkbox" checked={data.cost.unspecified} onChange={(e) => patch({ cost: { ...data.cost, unspecified: e.target.checked } })} /> Cost not specified
          </label>
          {!data.cost.unspecified && (
            <div className="flex items-end gap-2">
              <div className="flex-1"><LabeledInput label="Estimated cost" value={data.cost.amount} onChange={(v) => patch({ cost: { ...data.cost, amount: v } })} placeholder="e.g. 25" /></div>
              <div className="w-28"><LabeledSelect label="Currency" value={data.cost.currency} onChange={(v) => patch({ cost: { ...data.cost, currency: v } })} options={currencyOptions} /></div>
            </div>
          )}
        </div>
      </SpecSection>

      <SpecSection title="Materials" badge={`${data.materials.length}`} hint="Each material can link to an affiliate product.">
        <RowList<Material>
          items={data.materials} onChange={(materials) => patch({ materials })} makeItem={newMaterial} addLabel="Add material" minRows={1}
          renderRow={(m, p) => (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input value={m.qty} onChange={(e) => p({ qty: e.target.value })} placeholder="Qty" className={ctrl} />
                <input value={m.unit} onChange={(e) => p({ unit: e.target.value })} placeholder="Unit" className={ctrl} />
                <input value={m.name} onChange={(e) => p({ name: e.target.value })} placeholder="Material" className={`${ctrl} col-span-2 sm:col-span-2`} />
              </div>
              <input value={m.note} onChange={(e) => p({ note: e.target.value })} placeholder="Note (optional)" className={ctrl} />
            </div>
          )}
        />
      </SpecSection>

      <SpecSection title="Tools" badge={`${data.tools.length}`}>
        <RowList<Tool>
          items={data.tools} onChange={(tools) => patch({ tools })} makeItem={newTool} addLabel="Add tool" minRows={1}
          renderRow={(t, p) => (
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_90px]">
                <input value={t.name} onChange={(e) => p({ name: e.target.value })} placeholder="Tool name" className={ctrl} />
                <input value={t.qty} onChange={(e) => p({ qty: e.target.value })} placeholder="Qty" className={ctrl} />
              </div>
              <input value={t.note} onChange={(e) => p({ note: e.target.value })} placeholder="Note (optional)" className={ctrl} />
            </div>
          )}
        />
      </SpecSection>

      <SpecSection title="Steps" badge={`${data.steps.length} steps`}>
        <RowList<DiyStep>
          items={data.steps} onChange={(steps) => patch({ steps })} makeItem={newDiyStep} addLabel="Add step" minRows={1}
          renderRow={(step, p, i) => (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/12 text-[0.75rem] font-semibold text-primary">{i + 1}</span>
                <input value={step.title} onChange={(e) => p({ title: e.target.value })} placeholder="Step title" className={`${ctrl} font-semibold`} />
              </div>
              <textarea rows={2} value={step.text} onChange={(e) => p({ text: e.target.value })} placeholder="Instruction…" className={`${ctrl} resize-y`} />
              <input value={step.tip} onChange={(e) => p({ tip: e.target.value })} placeholder="Step tip (optional)" className={ctrl} />
              <ImageField url={step.image} onPick={(url) => p({ image: url })} onClear={() => p({ image: '' })} ratio="aspect-video" />
            </div>
          )}
        />
      </SpecSection>

      <SpecSection title="Tips" badge={`${data.tips.length}`}>
        <TipsEditor tips={data.tips} onChange={(tips) => patch({ tips })} />
      </SpecSection>

      <SpecSection title="Variations" hint="Optional — color, size, seasonal or material variations." badge={`${data.variations.length}`}>
        <RowList<Variation>
          items={data.variations} onChange={(variations) => patch({ variations })} makeItem={newVariation} addLabel="Add variation"
          renderRow={(v, p) => (
            <div className="space-y-2">
              <input value={v.title} onChange={(e) => p({ title: e.target.value })} placeholder="Variation title" className={`${ctrl} font-semibold`} />
              <textarea rows={2} value={v.description} onChange={(e) => p({ description: e.target.value })} placeholder="Description" className={`${ctrl} resize-y`} />
              <ImageField url={v.image} onPick={(url) => p({ image: url })} onClear={() => p({ image: '' })} ratio="aspect-video" />
            </div>
          )}
        />
      </SpecSection>

      <SpecSection title="Project gallery" badge={`${data.gallery.length}`} hint="Finished, process and detail images.">
        <GalleryEditor gallery={data.gallery} onChange={(gallery) => patch({ gallery })} />
      </SpecSection>

      <SpecSection title="Affiliate products" badge={`${data.products.length}`}>
        <AffiliateProductsEditor products={data.products} onChange={(products) => patch({ products })} kindHint="Tools, materials, supplies or equipment." />
      </SpecSection>

      <div className="rounded-lg border border-border bg-secondary/30 p-3 text-[0.72rem] text-muted-foreground">
        <strong className="text-foreground">DIY structured data</strong> (schema.org/HowTo) auto-derives from these fields: name, image, difficulty {data.difficulty || '—'}, total time {formatDuration(total)}, {data.cost.unspecified ? 'cost not specified' : data.cost.amount ? `${data.cost.amount} ${data.cost.currency}` : 'no cost'}, {data.materials.length} materials, {data.tools.length} tools, {data.steps.length} steps.
      </div>
    </div>
  )
}
