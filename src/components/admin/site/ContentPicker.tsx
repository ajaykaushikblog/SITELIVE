import { useMemo, useState } from 'react'
import { Search, Plus, Trash } from '../../ui/icons'
import { PillButton } from '../ui'
import { contentItems, contentType } from '../../../lib/admin/cms'
import { move } from '../../../lib/admin/site'

/* =========================================================================
   Reusable manual content selector.

   Search across title / type / category / occasion / author, add items,
   remove them, and reorder with accessible Move up / Move down controls
   (no drag-and-drop required). Manual ordering here overrides any automatic
   ordering when the parent section/collection is configured as Manual.
   Used by the Homepage Manager and the Collection editor.
   ========================================================================= */

export function ContentPicker({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const [q, setQ] = useState('')

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return contentItems
      .filter((i) => !selected.includes(i.id))
      .filter(
        (i) =>
          i.title.toLowerCase().includes(s) ||
          contentType(i.type).label.toLowerCase().includes(s) ||
          i.category.toLowerCase().includes(s) ||
          i.author.toLowerCase().includes(s) ||
          i.occasions.some((o) => o.toLowerCase().includes(s)),
      )
      .slice(0, 6)
  }, [q, selected])

  const add = (id: string) => {
    onChange([...selected, id])
    setQ('')
  }
  const remove = (id: string) => onChange(selected.filter((x) => x !== id))
  const reorder = (index: number, dir: -1 | 1) => onChange(move(selected, index, dir))

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, type, category, occasion or author…"
          className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-[0.85rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40"
        />
        {results.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-card shadow-lg">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => add(r.id)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-secondary"
                >
                  <img src={r.featuredImage} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.82rem] font-medium text-foreground">{r.title}</span>
                    <span className="block text-[0.7rem] text-muted-foreground">
                      {contentType(r.type).label} · {r.category}
                    </span>
                  </span>
                  <Plus width={15} height={15} className="text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-secondary/30 px-3 py-4 text-center text-[0.78rem] text-muted-foreground">
          No items selected yet. Search above to add content.
        </p>
      ) : (
        <ol className="space-y-2">
          {selected.map((id, i) => {
            const item = contentItems.find((x) => x.id === id)
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-[0.7rem] font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                {item && <img src={item.featuredImage} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />}
                <span className="min-w-0 flex-1 truncate text-[0.82rem] font-medium text-foreground">
                  {item ? item.title : '(deleted content)'}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => reorder(i, -1)}
                    disabled={i === 0}
                    aria-label={`Move ${item?.title ?? 'item'} up`}
                    className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => reorder(i, 1)}
                    disabled={i === selected.length - 1}
                    aria-label={`Move ${item?.title ?? 'item'} down`}
                    className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <PillButton tone="danger" onClick={() => remove(id)}>
                    <Trash width={13} height={13} /> Remove
                  </PillButton>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
