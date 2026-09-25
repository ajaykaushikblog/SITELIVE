import { Check, Warning, Close, Clock } from '../../ui/icons'
import { Badge, PillButton } from '../ui'
import {
  buildToc,
  prePublishChecklist,
  publishReadiness,
  sampleRevisions,
  type EditorContent,
} from '../../../lib/admin/editor'

/* ---- Modal shell ---- */
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl sm:rounded-2xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="font-serif text-[1.2rem] font-semibold text-foreground">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Close"><Close width={18} height={18} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

/* ---- Pre-publish validation checklist ---- */
export function PrePublishDialog({ content, onClose, onPublish, extra = [] }: { content: EditorContent; onClose: () => void; onPublish: () => void; extra?: import('../../../lib/admin/editor').ChecklistItem[] }) {
  const list = [...prePublishChecklist(content), ...extra]
  const { ready, requiredMissing, recommendedMissing } = publishReadiness(list)
  return (
    <Modal title="Pre-publish checklist" onClose={onClose}>
      <p className="mb-4 text-[0.85rem] text-muted-foreground">
        {ready ? 'All required checks pass — you’re ready to publish.' : `${requiredMissing} required item${requiredMissing === 1 ? '' : 's'} still need attention.`}
        {recommendedMissing > 0 && ` ${recommendedMissing} recommended item${recommendedMissing === 1 ? '' : 's'} could improve reach.`}
      </p>
      <ul className="space-y-1.5">
        {list.map((c) => (
          <li key={c.label} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2">
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${c.pass ? 'bg-success/15 text-success' : c.severity === 'required' ? 'bg-error/15 text-error' : 'bg-warning/15 text-warning'}`}>
              {c.pass ? <Check width={13} height={13} /> : <Warning width={12} height={12} />}
            </span>
            <span className="flex-1 text-[0.85rem] text-foreground">{c.label}</span>
            <Badge label={c.severity} tone={c.severity === 'required' ? 'bg-secondary text-secondary-foreground' : 'bg-secondary/60 text-muted-foreground'} />
          </li>
        ))}
      </ul>
      <div className="mt-5 flex justify-end gap-2">
        <PillButton onClick={onClose}>Keep editing</PillButton>
        <button type="button" disabled={!ready} onClick={onPublish}
          className="rounded-full bg-primary px-4 py-1.5 text-[0.82rem] font-semibold text-primary-foreground disabled:opacity-40">
          Publish now
        </button>
      </div>
    </Modal>
  )
}

/* ---- Revision history (illustrative) ---- */
export function RevisionsDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Revision history" onClose={onClose}>
      <p className="mb-4 text-[0.8rem] text-muted-foreground">Illustrative history — no real version store is wired up in this prototype.</p>
      <ol className="space-y-2">
        {sampleRevisions.map((r) => (
          <li key={r.id} className={`rounded-lg border px-3.5 py-2.5 ${r.current ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[0.85rem] font-semibold text-foreground">v{r.version} · {r.editor}</span>
              {r.current ? <Badge label="Current" tone="bg-success/15 text-success" /> : <PillButton>Restore</PillButton>}
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-[0.74rem] text-muted-foreground"><Clock width={12} height={12} /> {r.when}</p>
            <p className="mt-1 text-[0.82rem] text-muted-foreground">{r.summary}</p>
          </li>
        ))}
      </ol>
    </Modal>
  )
}

/* ---- Content preview (desktop/tablet/mobile using a public-style template) ---- */
const frameCls: Record<string, string> = { desktop: 'max-w-full', tablet: 'max-w-[768px]', mobile: 'max-w-[390px]' }

export function PreviewDialog({ content, device, setDevice, onClose }: {
  content: EditorContent
  device: 'desktop' | 'tablet' | 'mobile'
  setDevice: (d: 'desktop' | 'tablet' | 'mobile') => void
  onClose: () => void
}) {
  const toc = buildToc(content.blocks)
  return (
    <Modal title="Preview" onClose={onClose} wide>
      <div className="mb-4 flex justify-center gap-1.5">
        {(['desktop', 'tablet', 'mobile'] as const).map((d) => (
          <PillButton key={d} active={device === d} onClick={() => setDevice(d)}><span className="capitalize">{d}</span></PillButton>
        ))}
      </div>
      <div className={`mx-auto rounded-xl border border-border bg-background p-6 transition-all ${frameCls[device]}`}>
        {content.featuredImage && <img src={content.featuredImage} alt="" className="mb-5 aspect-[16/9] w-full rounded-lg object-cover" />}
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{content.taxonomy.category || 'Uncategorized'}</p>
        <h1 className="mt-1 font-serif text-[1.9rem] font-semibold leading-tight text-foreground">{content.title || 'Untitled'}</h1>
        {content.excerpt && <p className="mt-3 text-[1rem] leading-relaxed text-muted-foreground">{content.excerpt}</p>}
        <p className="mt-3 text-[0.78rem] text-muted-foreground">By {content.author}</p>

        {toc.length > 1 && (
          <nav className="mt-5 rounded-lg border border-border bg-secondary/30 p-4">
            <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">In this article</p>
            <ul className="space-y-1">
              {toc.map((t) => <li key={t.id} className={`text-[0.85rem] text-foreground ${t.level === 3 ? 'pl-4 text-muted-foreground' : ''}`}>{t.text}</li>)}
            </ul>
          </nav>
        )}

        <article className="mt-6 space-y-4">
          {content.blocks.map((b) => <PreviewBlock key={b.id} block={b} />)}
        </article>
      </div>
    </Modal>
  )
}

function PreviewBlock({ block }: { block: EditorContent['blocks'][number] }) {
  const d = block.data
  switch (block.type) {
    case 'paragraph': return d.text ? <p className="text-[0.95rem] leading-relaxed text-foreground">{d.text}</p> : null
    case 'heading': return d.text ? <h2 className="font-serif text-[1.4rem] font-semibold text-foreground">{d.text}</h2> : null
    case 'subheading': return d.text ? <h3 className="font-serif text-[1.15rem] font-semibold text-foreground">{d.text}</h3> : null
    case 'quote': return d.text ? <blockquote className="border-l-2 border-primary/50 pl-4 font-serif text-[1.05rem] italic text-foreground">{d.text}{d.title && <cite className="mt-1 block text-[0.8rem] not-italic text-muted-foreground">— {d.title}</cite>}</blockquote> : null
    case 'unordered-list': return <ul className="list-disc space-y-1 pl-5 text-[0.95rem] text-foreground">{(d.items ?? []).filter(Boolean).map((i, k) => <li key={k}>{i}</li>)}</ul>
    case 'ordered-list': return <ol className="list-decimal space-y-1 pl-5 text-[0.95rem] text-foreground">{(d.items ?? []).filter(Boolean).map((i, k) => <li key={k}>{i}</li>)}</ol>
    case 'checklist': return <ul className="space-y-1 text-[0.95rem] text-foreground">{(d.items ?? []).filter(Boolean).map((i, k) => <li key={k} className="flex items-center gap-2"><input type="checkbox" checked={d.checked?.[k]} readOnly /> {i}</li>)}</ul>
    case 'image': return d.imageUrl ? <figure><img src={d.imageUrl} alt={d.alt} className="w-full rounded-lg" />{d.caption && <figcaption className="mt-1 text-center text-[0.78rem] text-muted-foreground">{d.caption}</figcaption>}</figure> : null
    case 'callout': return <div className="rounded-lg border border-border bg-secondary/40 p-4"><p className="font-semibold text-foreground">{d.title}</p>{d.text && <p className="mt-1 text-[0.9rem] text-muted-foreground">{d.text}</p>}</div>
    case 'divider': return <hr className="border-border" />
    case 'newsletter': return <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-center text-[0.85rem] text-muted-foreground">Newsletter signup</div>
    default: return <div className="rounded-lg border border-dashed border-border bg-secondary/20 p-3 text-center text-[0.78rem] text-muted-foreground">{block.type} block</div>
  }
}
