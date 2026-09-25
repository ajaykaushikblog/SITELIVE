import { useState } from 'react'
import { Copy, Trash } from '../../ui/icons'
import { BlockBody } from './BlockBody'
import { AddBlockMenu } from './AddBlockMenu'
import { blockDefs, makeBlock, uid, type BlockType, type BlockData, type ContentBlock } from '../../../lib/admin/editor'

/* The reorderable stack of content blocks. Native drag-and-drop for pointer
   users; Move Up / Move Down buttons give an accessible, keyboard-friendly
   alternative (spec §35). Duplicate and delete live on each block. */
export function BlockList({ blocks, onChange }: { blocks: ContentBlock[]; onChange: (next: ContentBlock[]) => void }) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const reindex = (arr: ContentBlock[]) => arr.map((b, i) => ({ ...b, order: i }))

  const update = (id: string, patch: Partial<BlockData>) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, data: { ...b.data, ...patch } } : b)))

  const move = (id: string, dir: -1 | 1) => {
    const i = blocks.findIndex((b) => b.id === id)
    const j = i + dir
    if (j < 0 || j >= blocks.length) return
    const next = [...blocks]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(reindex(next))
  }

  const duplicate = (id: string) => {
    const i = blocks.findIndex((b) => b.id === id)
    const copy = { ...blocks[i], id: uid(), data: { ...blocks[i].data } }
    const next = [...blocks.slice(0, i + 1), copy, ...blocks.slice(i + 1)]
    onChange(reindex(next))
  }

  const remove = (id: string) => onChange(reindex(blocks.filter((b) => b.id !== id)))

  const addAfter = (id: string | null, type: BlockType) => {
    const block = makeBlock(type, 0)
    if (id === null) { onChange(reindex([...blocks, block])); return }
    const i = blocks.findIndex((b) => b.id === id)
    onChange(reindex([...blocks.slice(0, i + 1), block, ...blocks.slice(i + 1)]))
  }

  const drop = (targetId: string) => {
    if (!dragId || dragId === targetId) return
    const from = blocks.findIndex((b) => b.id === dragId)
    const to = blocks.findIndex((b) => b.id === targetId)
    const next = [...blocks]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(reindex(next))
    setDragId(null); setOverId(null)
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const def = blockDefs[block.type]
        return (
          <div
            key={block.id}
            onDragOver={(e) => { e.preventDefault(); setOverId(block.id) }}
            onDrop={() => drop(block.id)}
            className={`group relative rounded-xl border bg-card transition ${overId === block.id && dragId ? 'border-primary ring-2 ring-primary/30' : 'border-border'} ${dragId === block.id ? 'opacity-40' : ''}`}
          >
            {/* Block header / toolbar */}
            <div className="flex items-center gap-2 border-b border-border/70 px-3 py-1.5">
              <span
                draggable
                onDragStart={() => setDragId(block.id)}
                onDragEnd={() => { setDragId(null); setOverId(null) }}
                className="cursor-grab select-none px-1 text-muted-foreground active:cursor-grabbing"
                aria-hidden
                title="Drag to reorder"
              >
                ⠿
              </span>
              <span className="text-[0.9rem]">{def?.icon}</span>
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{def?.label}</span>
              <div className="ml-auto flex items-center gap-0.5 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
                <IconBtn label="Move up" disabled={i === 0} onClick={() => move(block.id, -1)}>↑</IconBtn>
                <IconBtn label="Move down" disabled={i === blocks.length - 1} onClick={() => move(block.id, 1)}>↓</IconBtn>
                <IconBtn label="Duplicate block" onClick={() => duplicate(block.id)}><Copy width={15} height={15} /></IconBtn>
                <IconBtn label="Delete block" danger onClick={() => remove(block.id)}><Trash width={15} height={15} /></IconBtn>
              </div>
            </div>
            {/* Block body */}
            <div className="p-3">
              <BlockBody block={block} update={(patch) => update(block.id, patch)} />
            </div>
            {/* Inline insert */}
            <div className="flex justify-center pb-2">
              <div className="opacity-0 transition group-hover:opacity-100">
                <AddBlockMenu variant="compact" onAdd={(t) => addAfter(block.id, t)} />
              </div>
            </div>
          </div>
        )
      })}

      <AddBlockMenu onAdd={(t) => addAfter(null, t)} />
    </div>
  )
}

function IconBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-7 w-7 place-items-center rounded text-[0.85rem] disabled:opacity-30 ${danger ? 'text-muted-foreground hover:bg-error/10 hover:text-error' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
    >
      {children}
    </button>
  )
}
