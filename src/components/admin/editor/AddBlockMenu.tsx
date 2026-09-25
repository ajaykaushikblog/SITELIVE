import { useEffect, useRef, useState } from 'react'
import { Plus } from '../../ui/icons'
import { blockCatalog, type BlockType } from '../../../lib/admin/editor'

/* Grouped "Add block" menu. Blocks are organized by category (Text, Media,
   Editorial, Monetization, Content, Social) so editors scan by intent. Opens
   as a popover; searchable. */
export function AddBlockMenu({ onAdd, variant = 'full' }: { onAdd: (type: BlockType) => void; variant?: 'full' | 'compact' }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onEsc) }
  }, [open])

  const groups = blockCatalog
    .map((g) => ({ ...g, blocks: g.blocks.filter((b) => (b.label + b.hint).toLowerCase().includes(q.toLowerCase())) }))
    .filter((g) => g.blocks.length)

  const pick = (t: BlockType) => { onAdd(t); setOpen(false); setQ('') }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          variant === 'full'
            ? 'flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-[0.85rem] font-semibold text-muted-foreground transition hover:border-foreground/40 hover:text-foreground'
            : 'flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[0.78rem] font-semibold text-foreground shadow-sm hover:border-foreground/40'
        }
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Plus width={16} height={16} /> Add block
      </button>

      {open && (
        <div className="absolute left-1/2 z-30 mt-2 max-h-[26rem] w-[20rem] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card shadow-xl" role="menu">
          <div className="border-b border-border p-2">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search blocks…" className="w-full rounded-md border border-border bg-background px-3 py-2 text-[0.82rem] text-foreground outline-none focus:border-foreground/40" />
          </div>
          <div className="max-h-[21rem] overflow-y-auto p-2">
            {groups.length === 0 && <p className="px-2 py-6 text-center text-[0.8rem] text-muted-foreground">No blocks match “{q}”.</p>}
            {groups.map((g) => (
              <div key={g.title} className="mb-2 last:mb-0">
                <p className="px-2 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{g.title}</p>
                <div className="grid grid-cols-2 gap-1">
                  {g.blocks.map((b) => (
                    <button key={b.type} type="button" onClick={() => pick(b.type)} role="menuitem"
                      className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-secondary/60" title={b.hint}>
                      <span className="text-[1rem] leading-none">{b.icon}</span>
                      <span className="text-[0.78rem] font-medium leading-tight text-foreground">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
