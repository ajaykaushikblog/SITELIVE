import { useEffect, useMemo, useState } from 'react'
import { Container, Button } from '../ui/primitives'
import {
  pinContentSamples,
  validatePin,
  PIN_SPEC,
  type PinContentSample,
  type AlternatePin,
  type PinTemplateId,
  type PinValidation,
} from '../../lib/pinterest'
import { PinterestPreview } from '../pinterest/PinterestPreview'
import { SocialPreview } from '../pinterest/SocialPreview'
import { PinTemplateSelector } from '../pinterest/PinTemplateSelector'
import { Check, Close, Plus, Copy, Trash, Star } from '../ui/icons'

/* =========================================================================
   CMS → Content → Pinterest

   Front-end concept for the Pinterest content manager. Reusable across every
   content type (article, recipe, DIY, listicle, gift guide). Manages the
   primary pin plus multiple alternate pins, a template selector, live
   validation indicators, and separate Pinterest / social previews.
   This is a UI/UX representation — it does not call the Pinterest API.
   ========================================================================= */

function useAdminSeo() {
  useEffect(() => {
    const prev = document.title
    document.title = 'Pinterest — Marigold & Maple CMS'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => {
      document.title = prev
      robots.remove()
    }
  }, [])
}

let pinSeq = 100
const newId = () => `pin-${++pinSeq}`

type WorkingPin = AlternatePin

/* Flatten a sample into an editable list of pins, primary first. */
function toPins(sample: PinContentSample): WorkingPin[] {
  const primary: WorkingPin = {
    id: 'primary',
    title: sample.pinterest.title,
    description: sample.pinterest.description,
    image: sample.pinterest.primaryImage,
    template: sample.pinterest.template,
    isPrimary: true,
  }
  return [primary, ...sample.pinterest.alternatePins.map((p) => ({ ...p, isPrimary: false }))]
}

function ValidationRow({ v }: { v: PinValidation }) {
  const items: [keyof PinValidation, string][] = [
    ['title', 'Title present'],
    ['description', 'Description present'],
    ['image', 'Image present'],
    ['ratio', 'Correct 2:3 ratio'],
    ['destination', 'Destination URL'],
  ]
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map(([key, label]) => {
        const ok = v[key]
        return (
          <li key={key} className="inline-flex items-center gap-1.5 text-[0.78rem]">
            <span
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${
                ok ? 'bg-success/20 text-success' : 'bg-destructive/15 text-destructive'
              }`}
            >
              {ok ? <Check width={11} height={11} /> : <Close width={11} height={11} />}
            </span>
            <span className={ok ? 'text-muted-foreground' : 'text-foreground'}>{label}</span>
          </li>
        )
      })}
    </ul>
  )
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  textarea?: boolean
  hint?: string
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </label>
        {hint && <span className="text-[0.68rem] text-muted-foreground">{hint}</span>}
      </div>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40"
        />
      )}
    </div>
  )
}

export function AdminPinterest() {
  useAdminSeo()
  const [sampleId, setSampleId] = useState(pinContentSamples[0].id)
  const sample = pinContentSamples.find((s) => s.id === sampleId) ?? pinContentSamples[0]

  const [pins, setPins] = useState<WorkingPin[]>(() => toPins(sample))
  const [activeId, setActiveId] = useState('primary')
  const [social, setSocial] = useState(sample.social)

  // reload working state when switching sample content
  const switchSample = (id: string) => {
    const s = pinContentSamples.find((x) => x.id === id) ?? pinContentSamples[0]
    setSampleId(id)
    setPins(toPins(s))
    setActiveId('primary')
    setSocial(s.social)
  }

  const active = pins.find((p) => p.id === activeId) ?? pins[0]
  const updateActive = (patch: Partial<WorkingPin>) =>
    setPins((prev) => prev.map((p) => (p.id === active.id ? { ...p, ...patch } : p)))

  const addPin = () => {
    const id = newId()
    setPins((prev) => [
      ...prev,
      { id, title: '', description: '', image: '', template: active.template, isPrimary: false },
    ])
    setActiveId(id)
  }
  const duplicatePin = (p: WorkingPin) => {
    const id = newId()
    setPins((prev) => [...prev, { ...p, id, isPrimary: false, title: `${p.title} (copy)` }])
    setActiveId(id)
  }
  const deletePin = (p: WorkingPin) => {
    if (p.isPrimary) return
    setPins((prev) => prev.filter((x) => x.id !== p.id))
    if (activeId === p.id) setActiveId('primary')
  }
  const setPrimary = (p: WorkingPin) =>
    setPins((prev) => prev.map((x) => ({ ...x, isPrimary: x.id === p.id })))

  const validation = useMemo(
    () =>
      validatePin(
        { title: active.title, description: active.description, primaryImage: active.image },
        sample.destination,
      ),
    [active, sample.destination],
  )

  return (
    <main className="min-h-screen bg-background py-10">
      <Container width="wide">
        <div className="mb-2 text-[0.78rem] text-muted-foreground">
          CMS <span className="mx-1.5 text-border">/</span> Content{' '}
          <span className="mx-1.5 text-border">/</span>{' '}
          <span className="text-foreground">Pinterest</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-[2rem] font-semibold tracking-tight text-foreground sm:text-[2.4rem]">
              Pinterest Content
            </h1>
            <p className="mt-1 text-[0.9rem] text-muted-foreground">
              Manage Pinterest-optimized pins, templates and social metadata for any article.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Editing content
            </label>
            <select
              value={sampleId}
              onChange={(e) => switchSample(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground outline-none focus:border-foreground/40"
            >
              {pinContentSamples.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} · {s.category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
          {/* editor column */}
          <div className="space-y-8">
            {/* pins manager */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-serif text-[1.3rem] font-semibold text-foreground">
                  Pins <span className="text-muted-foreground">({pins.length})</span>
                </h2>
                <Button size="sm" variant="outline" type="button" onClick={addPin}>
                  <Plus width={14} height={14} /> Add pin
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {pins.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveId(p.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.78rem] transition-colors ${
                      p.id === active.id
                        ? 'border-primary bg-seasonal-soft/40 text-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/40'
                    }`}
                  >
                    {p.isPrimary && <Star width={12} height={12} className="text-seasonal" />}
                    {p.title || 'Untitled pin'}
                  </button>
                ))}
              </div>
            </section>

            {/* active pin editor */}
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-serif text-[1.2rem] font-semibold text-foreground">
                  {active.isPrimary ? 'Primary pin' : 'Alternate pin'}
                </h3>
                <div className="flex gap-2">
                  {!active.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(active)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[0.76rem] font-medium text-foreground hover:border-primary hover:text-primary"
                    >
                      <Star width={13} height={13} /> Set primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => duplicatePin(active)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[0.76rem] font-medium text-foreground hover:border-primary hover:text-primary"
                  >
                    <Copy width={13} height={13} /> Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePin(active)}
                    disabled={active.isPrimary}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[0.76rem] font-medium text-destructive hover:border-destructive disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash width={13} height={13} /> Delete
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <LabeledInput
                  label="Pin title"
                  value={active.title}
                  onChange={(v) => updateActive({ title: v })}
                  placeholder="e.g. 25 Elegant Christmas Nail Ideas"
                  hint={`${active.title.length}/100`}
                />
                <LabeledInput
                  label="Pin description"
                  value={active.description}
                  onChange={(v) => updateActive({ description: v })}
                  placeholder="Keyword-rich description Pinners will see when they save…"
                  textarea
                  hint={`${active.description.length} chars`}
                />
                <LabeledInput
                  label="Pin image URL"
                  value={active.image}
                  onChange={(v) => updateActive({ image: v })}
                  placeholder={`https://…  (${PIN_SPEC.label}, 2:3)`}
                />
              </div>

              <div className="mt-5 rounded-lg border border-border bg-muted/30 p-3">
                <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Validation
                </p>
                <ValidationRow v={validation} />
              </div>

              <div className="mt-6">
                <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Pin template
                </p>
                <PinTemplateSelector
                  value={active.template}
                  onChange={(id: PinTemplateId) => updateActive({ template: id })}
                  title={active.title || sample.label}
                  image={active.image || sample.pinterest.primaryImage}
                />
              </div>
            </section>

            {/* social metadata (separate from Pinterest) */}
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <h3 className="mb-4 font-serif text-[1.2rem] font-semibold text-foreground">
                Social (Open Graph) metadata
              </h3>
              <div className="space-y-4">
                <LabeledInput
                  label="Social title"
                  value={social.title}
                  onChange={(v) => setSocial((s) => ({ ...s, title: v }))}
                />
                <LabeledInput
                  label="Social description"
                  value={social.description}
                  onChange={(v) => setSocial((s) => ({ ...s, description: v }))}
                  textarea
                />
                <LabeledInput
                  label="Social image URL (1.91:1)"
                  value={social.image}
                  onChange={(v) => setSocial((s) => ({ ...s, image: v }))}
                />
              </div>
            </section>

            <div className="flex gap-3">
              <Button size="md" type="button">Save Pinterest content</Button>
              <Button size="md" variant="outline" type="button">Cancel</Button>
            </div>
          </div>

          {/* live previews */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <PinterestPreview
              title={active.title || sample.label}
              description={active.description}
              image={active.image || sample.pinterest.primaryImage}
              template={active.template}
              destination={sample.destination}
            />
            <SocialPreview
              title={social.title}
              description={social.description}
              image={social.image}
              destination={sample.destination}
            />
          </aside>
        </div>
      </Container>
    </main>
  )
}
