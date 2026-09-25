import { useState } from 'react'
import { Panel, Select } from '../ui'
import { productCollections } from '../../../lib/admin/monetization'

/* =========================================================================
   Phase 17 §15 — Content-level monetization overrides.

   Embedded in the content editor. Every option defaults to "Inherit global"
   so content follows the site-wide settings unless an editor deliberately
   overrides ads, affiliate blocks or sponsored placements for one piece.
   ========================================================================= */

const inherit = [
  { value: 'inherit', label: 'Inherit global' },
  { value: 'on', label: 'Force on' },
  { value: 'off', label: 'Force off' },
]

export function MonetizationOverrides() {
  const [ads, setAds] = useState('inherit')
  const [affiliate, setAffiliate] = useState('inherit')
  const [sponsored, setSponsored] = useState('inherit')
  const [collection, setCollection] = useState('')

  return (
    <Panel title="Monetization">
      <p className="mb-4 text-[0.8rem] text-muted-foreground">
        Overrides for this piece only. Leave on <span className="font-medium text-foreground">Inherit global</span> to follow site-wide monetization settings.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Advertisements" value={ads} onChange={setAds} options={inherit} />
        <Select label="Affiliate blocks" value={affiliate} onChange={setAffiliate} options={inherit} />
        <Select label="Sponsored" value={sponsored} onChange={setSponsored} options={inherit} />
      </div>
      <div className="mt-4">
        <Select
          label="Pin a product collection (optional)"
          value={collection}
          onChange={setCollection}
          options={[{ value: '', label: '— Auto (from rules) —' }, ...productCollections.map((c) => ({ value: c.id, label: c.name }))]}
        />
      </div>
    </Panel>
  )
}
