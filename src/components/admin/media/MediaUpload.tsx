import { useRef, useState } from 'react'
import { Upload, Close, Check, Warning } from '../../ui/icons'
import { ConceptNote } from '../ui'

/* =========================================================================
   Reusable upload interface — drag & drop, browse, multiple files, an upload
   queue with per-item status. This is a production-ready UI concept: it does
   NOT perform real uploads. Files are read locally only to preview a thumbnail
   and show the queue; real storage is wired in the backend phase.
   ========================================================================= */

type QueueStatus = 'queued' | 'ready' | 'error'

type QueueItem = {
  id: string
  name: string
  sizeKB: number
  thumb: string | null
  status: QueueStatus
  error?: string
}

const MAX_KB = 8 * 1024
const ALLOWED = /\.(jpe?g|png|webp|avif|gif|svg|mp4|pdf)$/i

export function MediaUpload({ onClose }: { onClose?: () => void }) {
  const [items, setItems] = useState<QueueItem[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | null) {
    if (!files) return
    const next: QueueItem[] = []
    for (const file of Array.from(files)) {
      const sizeKB = Math.round(file.size / 1024)
      const allowed = ALLOWED.test(file.name)
      const tooBig = sizeKB > MAX_KB
      const thumb = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      next.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        sizeKB,
        thumb,
        status: !allowed ? 'error' : tooBig ? 'error' : 'ready',
        error: !allowed ? 'Unsupported format' : tooBig ? 'Exceeds 8 MB limit' : undefined,
      })
    }
    setItems((prev) => [...next, ...prev])
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const ready = items.filter((i) => i.status === 'ready').length

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? 'border-primary bg-seasonal-soft/40' : 'border-border bg-secondary/30 hover:border-foreground/30'
        }`}
        aria-label="Upload media — drag files here or press Enter to browse"
      >
        <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-card text-foreground shadow-sm">
          <Upload width={22} height={22} />
        </span>
        <p className="font-serif text-[1.15rem] font-semibold text-foreground">Drag &amp; drop files here</p>
        <p className="mt-1 text-[0.82rem] text-muted-foreground">
          or <span className="font-semibold text-primary">browse</span> to choose · JPEG, PNG, WebP, AVIF, MP4, PDF
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.mp4,.pdf"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-[0.8rem] font-semibold text-foreground">
              Upload queue <span className="text-muted-foreground">({items.length})</span>
            </p>
            <button
              type="button"
              onClick={() => setItems([])}
              className="text-[0.76rem] font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
          <ul className="divide-y divide-border">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary">
                  {it.thumb ? (
                    <img src={it.thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-[0.6rem] text-muted-foreground">
                      {it.name.split('.').pop()?.toUpperCase()}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.82rem] font-medium text-foreground">{it.name}</p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    {it.sizeKB.toLocaleString()} KB
                    {it.error && <span className="text-error"> · {it.error}</span>}
                  </p>
                  {/* Progress track — stays at "queued" because no real upload runs. */}
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full ${it.status === 'error' ? 'w-full bg-error/40' : 'w-0 bg-primary'}`}
                    />
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-2">
                  {it.status === 'ready' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[0.66rem] font-semibold text-muted-foreground">
                      <Check width={12} height={12} /> Ready
                    </span>
                  )}
                  {it.status === 'error' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-error/12 px-2 py-0.5 text-[0.66rem] font-semibold text-error">
                      <Warning width={12} height={12} /> Error
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    aria-label={`Remove ${it.name} from queue`}
                  >
                    <Close width={16} height={16} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-[0.74rem] text-muted-foreground">
              {ready} of {items.length} ready to upload
            </p>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-border px-3 py-1.5 text-[0.78rem] font-semibold text-foreground hover:bg-secondary"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}

      <ConceptNote>
        This is a UI prototype — files are previewed locally but not stored. Actual storage, upload
        progress and processing connect to the chosen provider during backend implementation.
      </ConceptNote>
    </div>
  )
}
