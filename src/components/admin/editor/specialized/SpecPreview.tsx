import { useState } from 'react'
import { Modal } from '../EditorExtras'
import { PillButton } from '../../ui'
import { Print, Clock } from '../../../ui/icons'
import { formatDuration, recipeTotal, diyTotal, type RecipeData, type DiyData } from '../../../../lib/admin/specialized'
import type { EditorContent } from '../../../../lib/admin/editor'

/* Specialized previews render the structured data the way the existing public
   Recipe / DIY templates do — one design, not a disconnected mockup. Device
   framing matches the universal preview (desktop / tablet / mobile). */
const frame: Record<string, string> = { desktop: 'max-w-full', tablet: 'max-w-[768px]', mobile: 'max-w-[390px]' }
type Device = 'desktop' | 'tablet' | 'mobile'

function DeviceBar({ device, setDevice }: { device: Device; setDevice: (d: Device) => void }) {
  return (
    <div className="mb-4 flex justify-center gap-1.5">
      {(['desktop', 'tablet', 'mobile'] as const).map((d) => (
        <PillButton key={d} active={device === d} onClick={() => setDevice(d)}><span className="capitalize">{d}</span></PillButton>
      ))}
    </div>
  )
}

const heroFallback = 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&q=70'

/* ---------- Recipe preview ---------- */
export function RecipePreviewDialog({ content, data, onClose }: { content: EditorContent; data: RecipeData; onClose: () => void }) {
  const [device, setDevice] = useState<Device>('desktop')
  const [print, setPrint] = useState(false)
  const total = recipeTotal(data)
  const meta = [
    data.prepTime && formatDuration(data.prepTime) !== '—' ? { k: 'Prep', v: formatDuration(data.prepTime) } : null,
    formatDuration(data.cookTime) !== '—' ? { k: 'Cook', v: formatDuration(data.cookTime) } : null,
    { k: 'Total', v: formatDuration(total) },
    { k: 'Serves', v: `${data.servings.default} ${data.servings.unit}` },
    data.difficulty ? { k: 'Difficulty', v: data.difficulty } : null,
  ].filter(Boolean) as { k: string; v: string }[]

  return (
    <Modal title="Recipe preview" onClose={onClose} wide>
      <div className="mb-3 flex items-center justify-between">
        <DeviceBar device={device} setDevice={setDevice} />
        <PillButton onClick={() => setPrint(true)}><Print width={14} height={14} /> Print preview</PillButton>
      </div>
      <div className={`mx-auto rounded-xl border border-border bg-background p-6 transition-all ${frame[device]}`}>
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{content.taxonomy.category || data.recipeCategory || 'Recipe'}{data.cuisine && ` · ${data.cuisine}`}</p>
        <h1 className="mt-1 font-serif text-[1.9rem] font-semibold leading-tight text-foreground">{content.title || 'Untitled recipe'}</h1>
        {content.excerpt && <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{content.excerpt}</p>}
        <p className="mt-2 text-[0.78rem] text-muted-foreground">By {content.author || 'Unassigned'}</p>
        <img src={content.featuredImage || heroFallback} alt="" className="mt-4 aspect-[16/9] w-full rounded-lg object-cover" />

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-border bg-secondary/30 p-3 sm:grid-cols-5">
          {meta.map((m) => <div key={m.k} className="text-center"><p className="text-[0.66rem] uppercase tracking-wide text-muted-foreground">{m.k}</p><p className="text-[0.85rem] font-semibold text-foreground">{m.v}</p></div>)}
        </div>

        <Section title="Ingredients">
          {data.ingredientGroups.map((g) => (
            <div key={g.id} className="mb-3">
              {g.title && <p className="mb-1 font-serif text-[1rem] font-semibold text-foreground">{g.title}</p>}
              <ul className="space-y-1">
                {g.items.filter((i) => i.name).map((i) => <li key={i.id} className="text-[0.9rem] text-foreground">{[i.qty, i.unit, i.name].filter(Boolean).join(' ')}{i.prep && <span className="text-muted-foreground">, {i.prep}</span>}</li>)}
              </ul>
            </div>
          ))}
        </Section>

        {data.equipment.length > 0 && <Section title="Equipment"><ul className="list-disc space-y-0.5 pl-5 text-[0.9rem] text-foreground">{data.equipment.filter((e) => e.name).map((e) => <li key={e.id}>{e.name}{e.qty && ` (${e.qty})`}</li>)}</ul></Section>}

        <Section title="Instructions">
          <ol className="space-y-3">
            {data.instructions.filter((s) => s.text).map((s, i) => (
              <li key={s.id} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/12 text-[0.8rem] font-semibold text-primary">{i + 1}</span>
                <div>
                  <p className="text-[0.92rem] leading-relaxed text-foreground">{s.text}</p>
                  {s.timing && <p className="mt-0.5 flex items-center gap-1 text-[0.74rem] text-muted-foreground"><Clock width={12} height={12} /> {s.timing}</p>}
                  {s.image && <img src={s.image} alt="" className="mt-2 aspect-video w-full max-w-md rounded-md object-cover" />}
                  {s.tip && <p className="mt-1 rounded-md bg-secondary/50 px-2 py-1 text-[0.8rem] text-muted-foreground">💡 {s.tip}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {data.nutrition.available && <Section title={`Nutrition (per ${data.nutrition.basis})`}><div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{(['calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar', 'sodium'] as const).filter((k) => data.nutrition[k]).map((k) => <div key={k} className="rounded-md border border-border p-2 text-center"><p className="text-[0.64rem] capitalize text-muted-foreground">{k}</p><p className="text-[0.85rem] font-semibold text-foreground">{data.nutrition[k]}</p></div>)}</div></Section>}
        {data.tips.length > 0 && <Section title="Tips"><ul className="space-y-2">{data.tips.map((t) => <li key={t.id}><p className="text-[0.88rem] font-semibold text-foreground">{t.title}</p><p className="text-[0.85rem] text-muted-foreground">{t.description}</p></li>)}</ul></Section>}
        {data.notes && <Section title="Notes"><p className="whitespace-pre-line text-[0.9rem] leading-relaxed text-muted-foreground">{data.notes}</p></Section>}
        {data.products.length > 0 && <Section title="Recommended products"><p className="text-[0.78rem] text-muted-foreground">{data.products.filter((p) => p.productName).map((p) => p.productName).join(' · ')}</p></Section>}

        <p className="mt-6 rounded-lg border border-dashed border-border p-3 text-center text-[0.74rem] text-muted-foreground">Ads, related recipes and author box render here via the existing public Recipe Page.</p>
      </div>

      {print && <RecipePrintDialog content={content} data={data} onClose={() => setPrint(false)} />}
    </Modal>
  )
}

/* ---------- Recipe print preview (clean, no nav/ads) ---------- */
function RecipePrintDialog({ content, data, onClose }: { content: EditorContent; data: RecipeData; onClose: () => void }) {
  const total = recipeTotal(data)
  return (
    <Modal title="Print preview" onClose={onClose}>
      <div className="rounded-lg border border-border bg-white p-6 text-black">
        <h1 className="font-serif text-[1.5rem] font-bold">{content.title || 'Untitled recipe'}</h1>
        {content.excerpt && <p className="mt-1 text-[0.9rem] text-neutral-600">{content.excerpt}</p>}
        {content.featuredImage && <img src={content.featuredImage} alt="" className="mt-3 aspect-[16/9] w-full rounded object-cover" />}
        <p className="mt-3 text-[0.82rem]">Prep {formatDuration(data.prepTime)} · Cook {formatDuration(data.cookTime)} · Total {formatDuration(total)} · Serves {data.servings.default} {data.servings.unit}</p>
        <h2 className="mt-4 font-serif text-[1.1rem] font-bold">Ingredients</h2>
        {data.ingredientGroups.map((g) => (
          <div key={g.id} className="mt-1">
            {g.title && <p className="font-semibold">{g.title}</p>}
            <ul className="list-disc pl-5 text-[0.88rem]">{g.items.filter((i) => i.name).map((i) => <li key={i.id}>{[i.qty, i.unit, i.name].filter(Boolean).join(' ')}{i.prep && `, ${i.prep}`}</li>)}</ul>
          </div>
        ))}
        <h2 className="mt-4 font-serif text-[1.1rem] font-bold">Instructions</h2>
        <ol className="list-decimal space-y-1 pl-5 text-[0.88rem]">{data.instructions.filter((s) => s.text).map((s) => <li key={s.id}>{s.text}</li>)}</ol>
        {data.notes && <><h2 className="mt-4 font-serif text-[1.1rem] font-bold">Notes</h2><p className="whitespace-pre-line text-[0.88rem]">{data.notes}</p></>}
      </div>
      <p className="mt-3 text-[0.74rem] text-muted-foreground">The printable layout excludes navigation and advertisements. Actual print/PDF export is connected in the backend phase.</p>
    </Modal>
  )
}

/* ---------- DIY preview ---------- */
export function DiyPreviewDialog({ content, data, onClose }: { content: EditorContent; data: DiyData; onClose: () => void }) {
  const [device, setDevice] = useState<Device>('desktop')
  const total = diyTotal(data)
  return (
    <Modal title="DIY project preview" onClose={onClose} wide>
      <DeviceBar device={device} setDevice={setDevice} />
      <div className={`mx-auto rounded-xl border border-border bg-background p-6 transition-all ${frame[device]}`}>
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{content.taxonomy.category || 'DIY'}{data.difficulty && ` · ${data.difficulty}`}</p>
        <h1 className="mt-1 font-serif text-[1.9rem] font-semibold leading-tight text-foreground">{content.title || 'Untitled project'}</h1>
        {content.excerpt && <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{content.excerpt}</p>}
        <p className="mt-2 text-[0.78rem] text-muted-foreground">By {content.author || 'Unassigned'}</p>
        <img src={content.featuredImage || heroFallback} alt="" className="mt-4 aspect-[16/9] w-full rounded-lg object-cover" />

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-border bg-secondary/30 p-3 sm:grid-cols-4">
          <Meta k="Difficulty" v={data.difficulty || '—'} />
          <Meta k="Total time" v={formatDuration(total)} />
          <Meta k="Cost" v={data.cost.unspecified ? 'Not specified' : data.cost.amount ? `${data.cost.amount} ${data.cost.currency}` : '—'} />
          <Meta k="Steps" v={`${data.steps.filter((s) => s.text || s.title).length}`} />
        </div>

        {data.materials.some((m) => m.name) && <Section title="Materials"><ul className="list-disc space-y-0.5 pl-5 text-[0.9rem] text-foreground">{data.materials.filter((m) => m.name).map((m) => <li key={m.id}>{[m.qty, m.unit, m.name].filter(Boolean).join(' ')}{m.note && <span className="text-muted-foreground">, {m.note}</span>}</li>)}</ul></Section>}
        {data.tools.some((t) => t.name) && <Section title="Tools"><ul className="list-disc space-y-0.5 pl-5 text-[0.9rem] text-foreground">{data.tools.filter((t) => t.name).map((t) => <li key={t.id}>{t.name}{t.qty && ` (${t.qty})`}</li>)}</ul></Section>}

        <Section title="Steps">
          <ol className="space-y-3">
            {data.steps.filter((s) => s.text || s.title).map((s, i) => (
              <li key={s.id} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/12 text-[0.8rem] font-semibold text-primary">{i + 1}</span>
                <div>
                  {s.title && <p className="font-serif text-[1rem] font-semibold text-foreground">{s.title}</p>}
                  <p className="text-[0.92rem] leading-relaxed text-foreground">{s.text}</p>
                  {s.image && <img src={s.image} alt="" className="mt-2 aspect-video w-full max-w-md rounded-md object-cover" />}
                  {s.tip && <p className="mt-1 rounded-md bg-secondary/50 px-2 py-1 text-[0.8rem] text-muted-foreground">💡 {s.tip}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {data.tips.length > 0 && <Section title="Tips"><ul className="space-y-2">{data.tips.map((t) => <li key={t.id}><p className="text-[0.88rem] font-semibold text-foreground">{t.title}</p><p className="text-[0.85rem] text-muted-foreground">{t.description}</p></li>)}</ul></Section>}
        {data.variations.length > 0 && <Section title="Variations"><ul className="space-y-2">{data.variations.map((v) => <li key={v.id}><p className="text-[0.88rem] font-semibold text-foreground">{v.title}</p><p className="text-[0.85rem] text-muted-foreground">{v.description}</p></li>)}</ul></Section>}
        {data.products.length > 0 && <Section title="Recommended products"><p className="text-[0.78rem] text-muted-foreground">{data.products.filter((p) => p.productName).map((p) => p.productName).join(' · ')}</p></Section>}

        <p className="mt-6 rounded-lg border border-dashed border-border p-3 text-center text-[0.74rem] text-muted-foreground">Ads, related projects and author box render here via the existing public DIY Page.</p>
      </div>
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 border-t border-border pt-4">
      <h2 className="mb-2 font-serif text-[1.15rem] font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  )
}
function Meta({ k, v }: { k: string; v: string }) {
  return <div className="text-center"><p className="text-[0.66rem] uppercase tracking-wide text-muted-foreground">{k}</p><p className="text-[0.85rem] font-semibold text-foreground">{v}</p></div>
}
