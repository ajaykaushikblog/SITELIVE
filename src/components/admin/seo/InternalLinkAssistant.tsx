import { useMemo, useState } from 'react'
import { PillButton } from '../ui'
import { contentItems, contentType, type ContentItem } from '../../../lib/admin/cms'

/* Internal linking assistant — suggests relevant internal links from shared
   taxonomy (category, subcategory, occasion, season, tags, type). Suggestions
   are relevance-scored so no artificial or irrelevant links are proposed. */

function score(a: ContentItem, b: ContentItem): number {
  let s = 0
  if (a.category === b.category) s += 3
  s += a.subcategories.filter((x) => b.subcategories.includes(x)).length * 2
  s += a.occasions.filter((x) => b.occasions.includes(x)).length * 2
  s += a.seasons.filter((x) => b.seasons.includes(x)).length
  s += a.tags.filter((x) => b.tags.includes(x)).length
  if (a.type === b.type) s += 1
  return s
}

export function InternalLinkAssistant({ current }: { current?: ContentItem }) {
  const base = current ?? contentItems[0]
  const [inserted, setInserted] = useState<Set<string>>(new Set())

  const suggestions = useMemo(
    () =>
      contentItems
        .filter((c) => c.id !== base.id && c.status === 'published')
        .map((c) => ({ item: c, s: score(base, c) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 5),
    [base],
  )

  return (
    <div>
      <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Internal linking · suggested opportunities
      </p>
      {suggestions.length === 0 ? (
        <p className="text-[0.8rem] text-muted-foreground">No strongly related content found yet.</p>
      ) : (
        <ul className="space-y-2">
          {suggestions.map(({ item, s }) => (
            <li key={item.id} className="flex items-center gap-2.5 rounded-lg border border-border bg-background p-2.5">
              <img src={item.featuredImage} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.82rem] font-medium text-foreground">{item.title}</p>
                <p className="text-[0.7rem] text-muted-foreground">
                  {contentType(item.type).label} · relevance {s}
                </p>
              </div>
              <PillButton
                active={inserted.has(item.id)}
                onClick={() =>
                  setInserted((p) => {
                    const next = new Set(p)
                    next.has(item.id) ? next.delete(item.id) : next.add(item.id)
                    return next
                  })
                }
              >
                {inserted.has(item.id) ? 'Added' : 'Insert link'}
              </PillButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
