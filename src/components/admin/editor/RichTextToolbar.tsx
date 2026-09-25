import { useState } from 'react'
import { Link } from '../../ui/icons'

/* Inline rich-text controls shown above a paragraph. This is a UI prototype —
   formatting state is local and illustrative (no real content model / no fake
   persistence). The Link button opens the internal-linking flow conceptually
   (Phase 12). */
const marks = [
  { id: 'bold', label: 'B', cls: 'font-bold' },
  { id: 'italic', label: 'I', cls: 'italic' },
  { id: 'underline', label: 'U', cls: 'underline' },
  { id: 'strike', label: 'S', cls: 'line-through' },
] as const

export function RichTextToolbar({ onLink }: { onLink?: () => void }) {
  const [active, setActive] = useState<Record<string, boolean>>({})
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-secondary/40 p-1">
      {marks.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => setActive((a) => ({ ...a, [m.id]: !a[m.id] }))}
          className={`h-7 w-7 rounded text-[0.82rem] ${m.cls} ${active[m.id] ? 'bg-foreground text-background' : 'text-foreground hover:bg-card'}`}
          aria-pressed={!!active[m.id]}
          aria-label={m.id}
        >
          {m.label}
        </button>
      ))}
      <span className="mx-0.5 h-4 w-px bg-border" />
      <button type="button" onClick={onLink} className="flex h-7 items-center gap-1 rounded px-2 text-[0.74rem] font-semibold text-foreground hover:bg-card" aria-label="Insert link">
        <Link width={13} height={13} /> Link
      </button>
    </div>
  )
}
