import { useMemo, useState } from 'react'
import { Button } from '../../ui/primitives'
import { AdminPageHeader, Panel, Badge, ConceptNote } from '../ui'
import { Plus, Trash } from '../../ui/icons'
import { useAuth } from '../../../lib/api/useAuth'
import { apiConfigured } from '../../../lib/api/client'
import { useApiData } from '../../../lib/api/useApiData'
import { integrationsApi, type ApiIntegration } from '../../../lib/api/endpoints'
import {
  integrationServices,
  serviceDef,
  placementLabels,
  emptyRow,
  type IntegrationRow,
  type Placement,
} from '../../../lib/admin/integrations'

/* =========================================================================
   Verification & Custom Code  (/admin/site/verification)

   Paste verification codes and tracking snippets (Google Analytics, AdSense,
   Search Console, Tag Manager, Bing, Pinterest, Meta, Custom Code) that are
   stored in the real database and injected into the public site through the
   backend render endpoint — no source edits required.

   Security: this screen edits executable HTML/JS. The code is NEVER rendered
   here (only shown inside plain textareas), writes require the 'Manage
   integrations' permission (enforced server-side), and every change is
   recorded in the Activity Log with the acting user.
   ========================================================================= */

function apiToRow(a: ApiIntegration): IntegrationRow {
  return {
    id: a.id,
    service: a.service,
    name: a.name,
    enabled: a.enabled,
    headCode: a.headCode,
    bodyStartCode: a.bodyStartCode,
    bodyEndCode: a.bodyEndCode,
    updatedAt: a.updatedAt,
    updatedBy: a.updatedBy,
  }
}

/* Build the card list: one card per service, plus every extra saved custom
   snippet (Custom Code supports multiples). */
function buildCards(rows: IntegrationRow[]): IntegrationRow[] {
  const cards: IntegrationRow[] = []
  for (const def of integrationServices) {
    const matches = rows.filter((r) => r.service === def.service)
    if (def.multiple) {
      cards.push(...(matches.length ? matches : [emptyRow(def.service)]))
    } else {
      cards.push(matches[0] ?? emptyRow(def.service))
    }
  }
  return cards
}

const codeAreaCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-[0.78rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40'

function fmt(iso: string | null): string {
  if (!iso) return 'Never'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? 'Never' : d.toLocaleString()
}

function IntegrationCard({
  initial,
  canManage,
  onSaved,
  onDeleted,
}: {
  initial: IntegrationRow
  canManage: boolean
  onSaved: () => void
  onDeleted: () => void
}) {
  const def = serviceDef(initial.service)
  const [row, setRow] = useState<IntegrationRow>(initial)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const patch = (p: Partial<IntegrationRow>) => setRow((r) => ({ ...r, ...p }))

  async function save() {
    setErr(null)
    setMsg(null)
    if (!apiConfigured) {
      setMsg('Prototype mode — connect the backend (VITE_API_BASE_URL) to persist.')
      return
    }
    setBusy(true)
    try {
      const body = {
        service: row.service,
        name: row.name || def.label,
        enabled: row.enabled,
        headCode: row.headCode,
        bodyStartCode: row.bodyStartCode,
        bodyEndCode: row.bodyEndCode,
      }
      const saved = row.id ? await integrationsApi.update(row.id, body) : await integrationsApi.create(body)
      setRow(apiToRow(saved))
      setMsg('Saved.')
      onSaved()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function clearOrDelete() {
    setErr(null)
    setMsg(null)
    if (!row.id) {
      // Unsaved card → just clear the fields locally.
      patch({ headCode: '', bodyStartCode: '', bodyEndCode: '', enabled: false })
      return
    }
    if (!apiConfigured) return
    if (!confirm(`Delete the saved code for "${row.name || def.label}"? This cannot be undone.`)) return
    setBusy(true)
    try {
      await integrationsApi.remove(row.id)
      onDeleted()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Delete failed')
      setBusy(false)
    }
  }

  const statusTone = row.enabled ? 'bg-success/15 text-success' : 'bg-secondary text-muted-foreground'

  return (
    <Panel
      title={def.label}
      actions={<Badge label={row.enabled ? 'Active' : 'Disabled'} tone={statusTone} />}
    >
      <p className="-mt-1 mb-3 text-[0.82rem] text-muted-foreground">{def.description}</p>

      {/* Enable / disable + name */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-[0.85rem] font-medium text-foreground">
          <input
            type="checkbox"
            checked={row.enabled}
            disabled={!canManage}
            onChange={(e) => patch({ enabled: e.target.checked })}
          />
          Enable on the public site
        </label>
        {def.multiple && (
          <input
            value={row.name}
            disabled={!canManage}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="Snippet name"
            className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-[0.82rem] text-foreground outline-none focus:border-foreground/40"
          />
        )}
      </div>

      <p className="mb-3 rounded-md bg-secondary/50 px-3 py-2 text-[0.78rem] leading-relaxed text-muted-foreground">
        {def.help}
      </p>

      {/* Code fields — one per supported placement. Rendered ONLY as editable
          text; never injected/executed inside the CMS. */}
      <div className="space-y-3">
        {def.placements.map((pl: Placement) => {
          const field = pl === 'head' ? 'headCode' : pl === 'bodyStart' ? 'bodyStartCode' : 'bodyEndCode'
          return (
            <label key={pl} className="block">
              <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {placementLabels[pl]}
              </span>
              <textarea
                rows={4}
                value={(row as any)[field] as string}
                disabled={!canManage}
                spellCheck={false}
                onChange={(e) => patch({ [field]: e.target.value } as Partial<IntegrationRow>)}
                placeholder={`Paste code for ${placementLabels[pl].toLowerCase()}…`}
                className={codeAreaCls}
              />
            </label>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.72rem] text-muted-foreground">
          Last updated: {fmt(row.updatedAt)}
          {row.updatedBy ? ` · by ${row.updatedBy}` : ''}
        </p>
        <div className="flex items-center gap-2">
          {(err || msg) && (
            <span className={`text-[0.75rem] ${err ? 'text-error' : 'text-success'}`}>{err ?? msg}</span>
          )}
          <button
            type="button"
            onClick={clearOrDelete}
            disabled={!canManage || busy}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-[0.78rem] font-semibold text-muted-foreground hover:border-error hover:text-error disabled:opacity-40"
          >
            <Trash width={13} height={13} /> {row.id ? 'Delete' : 'Clear'}
          </button>
          <Button size="sm" onClick={save} disabled={!canManage || busy}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Panel>
  )
}

export function IntegrationsManager() {
  const { can } = useAuth()
  // When the API is live, only users with the permission may edit. In prototype
  // mode (no backend) the fields are editable but clearly non-persisting.
  const canManage = !apiConfigured || can('Manage integrations')

  const fallback = useMemo<IntegrationRow[]>(() => [], [])
  const { data, reload } = useApiData<IntegrationRow[]>(
    () => integrationsApi.list().then((rows) => rows.map(apiToRow)),
    fallback,
  )

  const [extraCustom, setExtraCustom] = useState(0)
  const cards = useMemo(() => {
    const base = buildCards(data)
    // Local "Add custom snippet" cards (persist on first save).
    const extras = Array.from({ length: extraCustom }, () => emptyRow('custom'))
    return [...base, ...extras]
  }, [data, extraCustom])

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Site', 'Verification & Custom Code']}
        title="Verification & Custom Code"
        description="Paste verification codes and tracking snippets from external services. They are saved to your database and injected into the public site automatically — you do not need to edit website files."
        actions={
          <Button size="sm" onClick={() => setExtraCustom((n) => n + 1)} disabled={!canManage}>
            <Plus width={15} height={15} /> Add custom snippet
          </Button>
        }
      />

      <div className="mb-6 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-[0.82rem] leading-relaxed text-foreground">
        <strong>Only paste code from services you trust.</strong> Custom JavaScript runs on every
        public page and can affect website functionality. This code is stored securely and is only
        editable by administrators — it is never shown to visitors except as the enabled snippets
        each page needs.
      </div>

      {!apiConfigured && (
        <ConceptNote>
          No backend is connected (prototype mode). Codes edited here are not persisted. Set
          VITE_API_BASE_URL and sign in as an admin to store and inject them for real.
        </ConceptNote>
      )}
      {apiConfigured && !canManage && (
        <ConceptNote>
          Your role does not include the “Manage integrations” permission, so these fields are
          read-only.
        </ConceptNote>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {cards.map((card, i) => (
          <IntegrationCard
            key={card.id ?? `new-${card.service}-${i}`}
            initial={card}
            canManage={canManage}
            onSaved={reload}
            onDeleted={reload}
          />
        ))}
      </div>
    </div>
  )
}
