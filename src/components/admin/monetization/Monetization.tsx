import { useMemo, useState } from 'react'
import { Button } from '../../ui/primitives'
import { Plus, Link as LinkIcon, Warning } from '../../ui/icons'
import { AdminPageHeader, Panel, Field, Textarea, Select, Badge, EmptyState, ConceptNote, PillButton, Tabs, StatCard } from '../ui'
import {
  MonSubnav,
  ExampleDataBanner,
  MetricGrid,
  SearchInput,
  FilterSelect,
  Pagination,
  useableList,
  money,
  type MonSection,
} from './shared'
import {
  adNetworks,
  affiliateNetworks,
  affiliateProducts,
  affiliateLinks,
  productCollections,
  sponsoredCampaigns,
  placements,
  monetizationRules,
  ruleFields,
  ruleActionTypes,
  taxonomyValues,
  connectionMeta,
  productStatusMeta,
  sponsoredStatusMeta,
  disclosureSettings,
  dateRanges,
  adSlotList,
  merchantList,
  productCategoryList,
  networkName,
  productPlacementCount,
  recommendationSignals,
  placementTypes,
  DEFAULT_PRODUCT_DISCLOSURE,
  type AffiliateProduct,
  type SponsoredCampaign,
  type MonetizationRule,
} from '../../../lib/admin/monetization'

/* =========================================================================
   Phase 17 — Universal Monetization & Affiliate management.

   ONE centralized platform: dashboard, advertising + ad networks + placements,
   affiliate products + links + networks + product collections, sponsored
   campaigns, automation rules, link health, expired products, reporting and
   settings. Everything is config-driven and merchant-agnostic. No provider is
   connected, so all revenue / impression / click figures are labelled example
   data and real metrics render as honest "—".
   ========================================================================= */

export function Monetization({ section = 'dashboard' }: { section?: MonSection }) {
  return (
    <div>
      <MonSubnav active={section} />
      {section === 'dashboard' && <DashboardPage />}
      {section === 'ads' && <AdsPage />}
      {section === 'networks' && <AdNetworksPage />}
      {section === 'placements' && <PlacementsPage />}
      {section === 'products' && <ProductsPage />}
      {section === 'links' && <LinksPage />}
      {section === 'affiliate-networks' && <AffiliateNetworksPage />}
      {section === 'product-collections' && <ProductCollectionsPage />}
      {section === 'sponsored' && <SponsoredPage />}
      {section === 'rules' && <RulesPage />}
      {section === 'link-health' && <LinkHealthPage />}
      {section === 'expired' && <ExpiredPage />}
      {section === 'revenue' && <RevenuePage />}
      {section === 'ad-performance' && <AdPerformancePage />}
      {section === 'affiliate-performance' && <AffiliatePerformancePage />}
      {section === 'sponsored-performance' && <SponsoredPerformancePage />}
      {section === 'settings' && <SettingsPage />}
    </div>
  )
}

/* ============================ Dashboard ============================ */
function DashboardPage() {
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization']}
        title="Monetization"
        description="One place to manage advertising, affiliate products and links, sponsored content, and reporting across the whole site."
      />
      <ExampleDataBanner />
      <MetricGrid />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NavCard title="Advertisements" hint={`${adSlotList().length} ad slots`} href="/admin/monetization/ads" />
        <NavCard title="Affiliate Products" hint={`${affiliateProducts.length} in library`} href="/admin/monetization/products" />
        <NavCard title="Affiliate Links" hint={`${affiliateLinks.length} tracked`} href="/admin/monetization/links" />
        <NavCard title="Product Collections" hint={`${productCollections.length} collections`} href="/admin/monetization/product-collections" />
        <NavCard title="Sponsored Content" hint={`${sponsoredCampaigns.length} campaigns`} href="/admin/monetization/sponsored" />
        <NavCard title="Rules" hint={`${monetizationRules.length} automation rules`} href="/admin/monetization/rules" />
        <NavCard title="Revenue" hint="Reporting overview" href="/admin/monetization/revenue" />
        <NavCard title="Settings" hint="Disclosures & defaults" href="/admin/monetization/settings" />
      </div>
    </div>
  )
}

function NavCard({ title, hint, href }: { title: string; hint: string; href: string }) {
  return (
    <a href={href} className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/40">
      <h3 className="font-serif text-[1.15rem] font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-[0.78rem] text-muted-foreground">{hint}</p>
      <span className="mt-3 inline-block text-[0.76rem] font-semibold text-primary group-hover:underline">Open →</span>
    </a>
  )
}

/* ============================ Advertising ============================ */
function AdsPage() {
  const [editing, setEditing] = useState(false)
  const slots = adSlotList()

  if (editing) return <AdSlotEditor onBack={() => setEditing(false)} />

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Advertisements']}
        title="Advertisements"
        description="Manage ad slots across the site. Built on the Phase 8 ad slot registry — every slot maps to a placement in a page template."
        actions={<Button size="md" onClick={() => setEditing(true)}><Plus width={15} height={15} /> Add ad slot</Button>}
      />
      <ExampleDataBanner>Impressions, clicks and revenue require a connected ad network and analytics provider.</ExampleDataBanner>

      <Panel title={`Ad slots (${slots.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Slot</th>
                <th className="py-2 pr-4 font-semibold">Format</th>
                <th className="py-2 pr-4 font-semibold">Type</th>
                <th className="py-2 pr-4 font-semibold">Device</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
                <th className="py-2 pr-4 font-semibold text-right">Impr.</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-4">
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <p className="font-mono text-[0.7rem] text-muted-foreground">{s.id}</p>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{s.format}</td>
                  <td className="py-2.5 pr-4 capitalize text-muted-foreground">{s.type}</td>
                  <td className="py-2.5 pr-4 capitalize text-muted-foreground">{s.device}</td>
                  <td className="py-2.5 pr-4">
                    <Badge label={s.status} tone={s.status === 'active' ? 'bg-success/15 text-success' : s.status === 'scheduled' ? 'bg-primary/12 text-primary' : 'bg-muted text-muted-foreground'} />
                  </td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function AdSlotEditor({ onBack }: { onBack: () => void }) {
  const [device, setDevice] = useState('all')
  const [type, setType] = useState('display')
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Advertisements', 'New']}
        title="Add advertisement slot"
        actions={
          <>
            <Button variant="outline" size="md" onClick={onBack}>Back</Button>
            <Button size="md" onClick={() => { alert('Ad slot saved (prototype).'); onBack() }}>Save slot</Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Slot details">
          <div className="space-y-4">
            <Field label="Name" placeholder="e.g. Article — after intro" />
            <Field label="Slot ID" mono placeholder="article_after_intro" hint="Referenced by placements and page templates." />
            <Select label="Device" value={device} onChange={setDevice} options={[
              { value: 'all', label: 'All devices' },
              { value: 'desktop', label: 'Desktop' },
              { value: 'tablet', label: 'Tablet' },
              { value: 'mobile', label: 'Mobile' },
            ]} />
            <Select label="Ad type" value={type} onChange={setType} options={[
              { value: 'display', label: 'Display' },
              { value: 'native', label: 'Native' },
              { value: 'responsive', label: 'Responsive' },
              { value: 'video', label: 'Video' },
              { value: 'sponsored', label: 'Sponsored' },
            ]} />
          </div>
        </Panel>
        <Panel title="Network & code">
          <div className="space-y-4">
            <Select label="Ad network" value={adNetworks[0].id} options={adNetworks.map((n) => ({ value: n.id, label: n.name }))} />
            <Textarea label="Ad code / unit ID" rows={5} mono placeholder="Paste ad unit code once a network is connected." />
            <ConceptNote>Ad code is stored but only rendered after a network is connected in Ad Networks.</ConceptNote>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function AdNetworksPage() {
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Ad Networks']}
        title="Ad Networks"
        description="Connect display and direct-sold networks. No fake connection states — each network reports its true status."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adNetworks.map((n) => (
          <Panel key={n.id} title={n.name}>
            <div className="mb-3 flex items-center gap-2">
              <Badge label={connectionMeta[n.status].label} tone={connectionMeta[n.status].tone} />
              {n.isDefault && <Badge label="Default" tone="bg-primary/12 text-primary" />}
            </div>
            <p className="mb-3 text-[0.78rem] capitalize text-muted-foreground">{n.type} network</p>
            {n.notes && <p className="mb-3 text-[0.78rem] text-muted-foreground">{n.notes}</p>}
            <PillButton>{n.status === 'connected' ? 'Manage' : 'Connect'}</PillButton>
          </Panel>
        ))}
      </div>
    </div>
  )
}

function PlacementsPage() {
  const [pageType, setPageType] = useState('all')
  const rows = placements.filter((p) => pageType === 'all' || p.pageType === pageType)
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Placements']}
        title="Placement Manager"
        description="Map ad slots to positions across page templates. Toggle placements on or off per page type without touching code."
      />
      <div className="mb-5 flex flex-wrap gap-2">
        <FilterSelect value={pageType} onChange={setPageType} options={[{ value: 'all', label: 'All page types' }, ...placementTypes.map((t) => ({ value: t, label: t }))]} />
      </div>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Page type</th>
                <th className="py-2 pr-4 font-semibold">Position</th>
                <th className="py-2 pr-4 font-semibold">Ad slot</th>
                <th className="py-2 pr-4 font-semibold">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 capitalize font-semibold text-foreground">{p.pageType}</td>
                  <td className="py-2.5 pr-4 capitalize text-muted-foreground">{p.position}</td>
                  <td className="py-2.5 pr-4 font-mono text-[0.72rem] text-muted-foreground">{p.slotId}</td>
                  <td className="py-2.5 pr-4">
                    <input type="checkbox" defaultChecked={p.enabled} className="h-4 w-4 accent-[var(--color-primary)]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ============================ Affiliate products ============================ */
function ProductsPage() {
  const [editing, setEditing] = useState<AffiliateProduct | 'new' | null>(null)
  const [q, setQ] = useState('')
  const [merchant, setMerchant] = useState('all')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('updated')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let list = affiliateProducts.filter((p) => {
      if (q && !`${p.name} ${p.merchant} ${p.category}`.toLowerCase().includes(q.toLowerCase())) return false
      if (merchant !== 'all' && p.merchant !== merchant) return false
      if (category !== 'all' && p.category !== category) return false
      if (status !== 'all' && p.status !== status) return false
      return true
    })
    list = list.slice().sort((a, b) => (sort === 'price' ? a.price - b.price : sort === 'name' ? a.name.localeCompare(b.name) : 0))
    return list
  }, [q, merchant, category, status, sort])

  const { slice, page, pages, setPage } = useableList(filtered, 6)

  if (editing) return <ProductEditor product={editing === 'new' ? null : editing} onBack={() => setEditing(null)} />

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Affiliate Products']}
        title="Affiliate Product Library"
        description="A central library of products. Add a product once, then insert it into any article, recipe, DIY or collection — no duplicated product data."
        actions={<Button size="md" onClick={() => setEditing('new')}><Plus width={15} height={15} /> Add product</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search products…" />
        <FilterSelect value={merchant} onChange={setMerchant} options={[{ value: 'all', label: 'All merchants' }, ...merchantList().map((m) => ({ value: m, label: m }))]} />
        <FilterSelect value={category} onChange={setCategory} options={[{ value: 'all', label: 'All categories' }, ...productCategoryList().map((c) => ({ value: c, label: c }))]} />
        <FilterSelect value={status} onChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'expired', label: 'Expired' }]} />
        <FilterSelect value={sort} onChange={setSort} options={[{ value: 'updated', label: 'Sort: Recent' }, { value: 'name', label: 'Sort: Name' }, { value: 'price', label: 'Sort: Price' }]} />
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-[0.82rem]">
          <span className="font-semibold">{selected.size} selected</span>
          <PillButton>Add to collection</PillButton>
          <PillButton>Set inactive</PillButton>
          <PillButton tone="danger" onClick={() => { if (confirm(`Remove ${selected.size} product(s)? References in content are kept.`)) setSelected(new Set()) }}>Remove</PillButton>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="No products match" hint="Adjust your search or filters." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {slice.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative aspect-[4/3] bg-secondary">
                  <img src={p.image} alt="" className="h-full w-full object-cover" />
                  <label className="absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-md border border-border bg-background/90">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="h-3.5 w-3.5 accent-[var(--color-primary)]" />
                  </label>
                  <span className="absolute right-3 top-3"><Badge label={productStatusMeta[p.status].label} tone={productStatusMeta[p.status].tone} /></span>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-[1.05rem] font-semibold text-foreground">{p.name}</h3>
                  <p className="mt-0.5 text-[0.76rem] text-muted-foreground">{p.merchant} · {p.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-semibold text-foreground">{money(p.price, p.currency)}</span>
                    <span className="text-[0.72rem] text-muted-foreground">{productPlacementCount(p)} placements</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <PillButton onClick={() => setEditing(p)}>Edit</PillButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  )
}

function ProductEditor({ product, onBack }: { product: AffiliateProduct | null; onBack: () => void }) {
  const p = product
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Affiliate Products', p ? p.name : 'New']}
        title={p ? p.name : 'Add product'}
        description="Merchant-agnostic — works with any store or affiliate network, not just one marketplace."
        actions={
          <>
            <Button variant="outline" size="md" onClick={onBack}>Back</Button>
            <Button size="md" onClick={() => { alert('Product saved (prototype).'); onBack() }}>Save product</Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="space-y-6">
          <Panel title="Product details">
            <div className="space-y-4">
              <Field label="Product name" value={p?.name} placeholder="e.g. Stoneware Berry Bowl Set" />
              <Textarea label="Description" rows={3} value={p?.description} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Merchant / store" value={p?.merchant} placeholder="Any store" />
                <Select label="Affiliate network" value={p?.networkId ?? affiliateNetworks[0].id} options={affiliateNetworks.map((n) => ({ value: n.id, label: n.name }))} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Price" value={p ? String(p.price) : ''} type="number" />
                <Field label="Currency" value={p?.currency ?? 'USD'} />
                <Field label="Category" value={p?.category} />
              </div>
            </div>
          </Panel>
          <Panel title="Links">
            <div className="space-y-4">
              <Field label="Original product URL" mono value={p?.productUrl} placeholder="https://store.example/product" hint="The plain destination — always shown, never hidden." />
              <Field label="Affiliate URL" mono value={p?.affiliateUrl} placeholder="https://network.example/track?..." hint="Where the affiliate click is routed." />
              <Field label="CTA text" value={p?.ctaText} placeholder="Shop now" />
            </div>
          </Panel>
          <Panel title="Disclosure">
            <Textarea label="Disclosure text" rows={2} value={p?.disclosure ?? DEFAULT_PRODUCT_DISCLOSURE} hint="Shown with the product block — required for FTC compliance." />
          </Panel>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Panel title="Image">
            <img src={p?.image ?? 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop'} alt="" className="aspect-square w-full rounded-lg border border-border object-cover" />
            <PillButton>Change (media library)</PillButton>
          </Panel>
          <Panel title="Status">
            <Select value={p?.status ?? 'active'} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'expired', label: 'Expired' }]} />
          </Panel>
          {p && (
            <Panel title="Usage">
              <ul className="space-y-1.5 text-[0.8rem] text-muted-foreground">
                <li>Articles: <span className="font-semibold text-foreground">{p.usage.articles.length}</span></li>
                <li>Recipes: <span className="font-semibold text-foreground">{p.usage.recipes.length}</span></li>
                <li>DIY: <span className="font-semibold text-foreground">{p.usage.diy.length}</span></li>
                <li>Collections: <span className="font-semibold text-foreground">{p.usage.collections.length}</span></li>
                <li>Homepage: <span className="font-semibold text-foreground">{p.usage.homepage}</span></li>
              </ul>
            </Panel>
          )}
        </aside>
      </div>
    </div>
  )
}

/* ============================ Affiliate links ============================ */
function LinksPage() {
  const [editing, setEditing] = useState<(typeof affiliateLinks)[number] | 'new' | null>(null)
  const [q, setQ] = useState('')

  if (editing) return <LinkEditor link={editing === 'new' ? null : editing} onBack={() => setEditing(null)} />

  const rows = affiliateLinks.filter((l) => !q || `${l.merchant} ${l.destinationUrl}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Affiliate Links']}
        title="Affiliate Link Management"
        description="Track affiliate links independently of products. The original destination and the affiliate destination are always shown side by side — never hidden."
        actions={<Button size="md" onClick={() => setEditing('new')}><Plus width={15} height={15} /> Add link</Button>}
      />
      <ExampleDataBanner>Click counts are illustrative — real tracking requires a connected analytics provider.</ExampleDataBanner>
      <div className="mb-5"><SearchInput value={q} onChange={setQ} placeholder="Search links…" /></div>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Merchant</th>
                <th className="py-2 pr-4 font-semibold">Destination</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
                <th className="py-2 pr-4 font-semibold">Used</th>
                <th className="py-2 pr-4 font-semibold text-right">Clicks (ex.)</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-semibold text-foreground">{l.merchant}</td>
                  <td className="py-2.5 pr-4 font-mono text-[0.72rem] text-muted-foreground">
                    <span className="flex items-center gap-1.5"><LinkIcon width={12} height={12} /> {l.destinationUrl}</span>
                  </td>
                  <td className="py-2.5 pr-4"><Badge label={l.status === 'active' ? 'Active' : 'Disabled'} tone={l.status === 'active' ? 'bg-success/15 text-success' : 'bg-error/12 text-error'} /></td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{l.usageCount}×</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{l.exampleClicks.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right"><PillButton onClick={() => setEditing(l)}>Edit</PillButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function LinkEditor({ link, onBack }: { link: (typeof affiliateLinks)[number] | null; onBack: () => void }) {
  const l = link
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Affiliate Links', l ? l.merchant : 'New']}
        title={l ? `${l.merchant} link` : 'Add affiliate link'}
        actions={
          <>
            <Button variant="outline" size="md" onClick={onBack}>Back</Button>
            <Button size="md" onClick={() => { alert('Link saved (prototype).'); onBack() }}>Save link</Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Original destination">
          <div className="space-y-4">
            <Field label="Merchant" value={l?.merchant} />
            <Field label="Original URL" mono value={l?.destinationUrl} hint="The real product page a reader lands on." />
            <Select label="Linked product (optional)" value={l?.productId ?? ''} options={[{ value: '', label: '— None —' }, ...affiliateProducts.map((p) => ({ value: p.id, label: p.name }))]} />
          </div>
        </Panel>
        <Panel title="Affiliate destination">
          <div className="space-y-4">
            <Field label="Affiliate URL" mono value={l?.affiliateUrl} hint="Where the tracked click actually goes." />
            <Field label="Tracking parameters" mono value={l?.trackingParams} placeholder="tag=..., irclickid=..." />
            <Select label="Status" value={l?.status ?? 'active'} options={[{ value: 'active', label: 'Active' }, { value: 'disabled', label: 'Disabled' }]} />
          </div>
        </Panel>
      </div>
      <div className="mt-6"><Panel title="Disclosure"><Textarea label="Disclosure" rows={2} value={l?.disclosure ?? DEFAULT_PRODUCT_DISCLOSURE} /></Panel></div>
    </div>
  )
}

function AffiliateNetworksPage() {
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Affiliate Networks']}
        title="Affiliate Networks"
        description="Connect the networks you actually use. No account is claimed as connected until you configure it."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {affiliateNetworks.map((n) => (
          <Panel key={n.id} title={n.name}>
            <div className="mb-3 flex items-center gap-2">
              <Badge label={connectionMeta[n.status].label} tone={connectionMeta[n.status].tone} />
              {n.isDefault && <Badge label="Default" tone="bg-primary/12 text-primary" />}
            </div>
            {n.notes && <p className="mb-3 text-[0.78rem] text-muted-foreground">{n.notes}</p>}
            <PillButton>{n.status === 'connected' ? 'Manage' : 'Connect'}</PillButton>
          </Panel>
        ))}
      </div>
    </div>
  )
}

function ProductCollectionsPage() {
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Product Collections']}
        title="Product Collections"
        description="Group affiliate products into reusable sets — gift guides, kitchen essentials, seasonal picks — and drop them into any content."
        actions={<Button size="md"><Plus width={15} height={15} /> New collection</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {productCollections.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative aspect-[16/9] bg-secondary">
              <img src={c.coverImage} alt="" className="h-full w-full object-cover" />
              <span className="absolute left-3 top-3"><Badge label={c.status} tone={c.status === 'active' ? 'bg-success/15 text-success' : c.status === 'scheduled' ? 'bg-primary/12 text-primary' : 'bg-muted text-muted-foreground'} /></span>
            </div>
            <div className="p-4">
              <h3 className="font-serif text-[1.1rem] font-semibold text-foreground">{c.name}</h3>
              <p className="mt-1 line-clamp-2 text-[0.78rem] text-muted-foreground">{c.description}</p>
              <p className="mt-2 text-[0.72rem] text-muted-foreground">{c.productIds.length} products</p>
              <div className="mt-3"><PillButton>Edit &amp; reorder</PillButton></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================ Sponsored ============================ */
function SponsoredPage() {
  const [editing, setEditing] = useState<SponsoredCampaign | 'new' | null>(null)
  if (editing) return <SponsoredEditor campaign={editing === 'new' ? null : editing} onBack={() => setEditing(null)} />
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Sponsored Content']}
        title="Sponsored Content"
        description="Manage paid brand placements with clear disclosure. Campaigns flow through Draft → Scheduled → Active → Expired."
        actions={<Button size="md" onClick={() => setEditing('new')}><Plus width={15} height={15} /> New campaign</Button>}
      />
      <ExampleDataBanner>Impression and click figures are illustrative until analytics is connected.</ExampleDataBanner>
      <div className="grid gap-4 lg:grid-cols-2">
        {sponsoredCampaigns.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid sm:grid-cols-[160px_1fr]">
              <div className="aspect-video bg-secondary sm:aspect-auto"><img src={c.image} alt="" className="h-full w-full object-cover" /></div>
              <div className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge label={sponsoredStatusMeta[c.status].label} tone={sponsoredStatusMeta[c.status].tone} />
                  <Badge label="Sponsored" tone="bg-secondary text-secondary-foreground" />
                </div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{c.brand}</p>
                <h3 className="font-serif text-[1.05rem] font-semibold text-foreground">{c.title}</h3>
                <p className="mt-1 text-[0.74rem] text-muted-foreground">{c.startDate} → {c.endDate} · {c.placement}</p>
                <div className="mt-3"><PillButton onClick={() => setEditing(c)}>Edit</PillButton></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SponsoredEditor({ campaign, onBack }: { campaign: SponsoredCampaign | null; onBack: () => void }) {
  const c = campaign
  const [tab, setTab] = useState('details')
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Sponsored Content', c ? c.brand : 'New']}
        title={c ? c.title : 'New sponsored campaign'}
        actions={
          <>
            <Button variant="outline" size="md" onClick={onBack}>Back</Button>
            <Button size="md" onClick={() => { alert('Campaign saved (prototype).'); onBack() }}>Save campaign</Button>
          </>
        }
      />
      <div className="mb-6"><Tabs tabs={[{ id: 'details', label: 'Details' }, { id: 'preview', label: 'Previews' }]} active={tab} onChange={setTab} /></div>
      {tab === 'details' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Campaign">
            <div className="space-y-4">
              <Field label="Brand" value={c?.brand} />
              <Field label="Campaign name" value={c?.campaign} />
              <Field label="Headline" value={c?.title} />
              <Textarea label="Description" rows={3} value={c?.description} />
              <Field label="CTA" value={c?.cta} />
              <Field label="Destination URL" mono value={c?.destinationUrl} />
            </div>
          </Panel>
          <Panel title="Schedule & placement">
            <div className="space-y-4">
              <Select label="Placement" value={c?.placement ?? 'homepage'} options={placementTypes.map((t) => ({ value: t, label: t }))} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date" type="date" value={c?.startDate} />
                <Field label="End date" type="date" value={c?.endDate} />
              </div>
              <Select label="Status" value={c?.status ?? 'draft'} options={Object.entries(sponsoredStatusMeta).map(([id, m]) => ({ value: id, label: m.label }))} />
              <Textarea label="Disclosure" rows={2} value={c?.disclosure ?? 'Sponsored — paid partnership.'} hint="Shown prominently — sponsored content must be clearly labelled." />
            </div>
          </Panel>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {['Homepage', 'Category', 'Article', 'Mobile'].map((label) => (
            <Panel key={label} title={label}>
              <div className="overflow-hidden rounded-lg border border-border">
                <div className="aspect-video bg-secondary"><img src={c?.image ?? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop'} alt="" className="h-full w-full object-cover" /></div>
                <div className="p-3">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Sponsored · {c?.brand ?? 'Brand'}</p>
                  <p className="mt-0.5 line-clamp-2 font-serif text-[0.9rem] font-semibold text-foreground">{c?.title ?? 'Campaign headline'}</p>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================ Rules ============================ */
function RulesPage() {
  const [editing, setEditing] = useState<MonetizationRule | 'new' | null>(null)
  if (editing) return <RuleEditor rule={editing === 'new' ? null : editing} onBack={() => setEditing(null)} />
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Rules']}
        title="Monetization Rules"
        description="Configure conditions and actions that attach products, ads or sponsored placements to content automatically — no hard-coded category logic."
        actions={<Button size="md" onClick={() => setEditing('new')}><Plus width={15} height={15} /> New rule</Button>}
      />
      <div className="space-y-3">
        {monetizationRules.map((r) => (
          <Panel key={r.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-serif text-[1.1rem] font-semibold text-foreground">{r.name}</h3>
                  <Badge label={r.status === 'active' ? 'Active' : 'Disabled'} tone={r.status === 'active' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'} />
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                  <span className="font-semibold">If</span> {r.conditions.map((c) => `${c.field} = ${c.value}`).join(' and ')} <span className="font-semibold">then</span> {r.actions.map((a) => ruleActionTypes.find((t) => t.id === a.type)?.label).join(', ')}
                </p>
              </div>
              <PillButton onClick={() => setEditing(r)}>Edit</PillButton>
            </div>
          </Panel>
        ))}
      </div>
      <div className="mt-6"><RecommendationPanel /></div>
    </div>
  )
}

function RecommendationPanel() {
  return (
    <Panel title="Product recommendation engine">
      <p className="mb-3 text-[0.8rem] text-muted-foreground">
        Rules and blocks match products to content using the signals below. This is deterministic matching by shared attributes — not personalized per-visitor targeting.
      </p>
      <div className="flex flex-wrap gap-2">
        {recommendationSignals.map((s) => (
          <span key={s} className="rounded-full bg-secondary px-3 py-1 text-[0.76rem] font-semibold capitalize text-secondary-foreground">{s}</span>
        ))}
      </div>
    </Panel>
  )
}

function RuleEditor({ rule, onBack }: { rule: MonetizationRule | null; onBack: () => void }) {
  const [field, setField] = useState(rule?.conditions[0]?.field ?? 'contentType')
  const [value, setValue] = useState(rule?.conditions[0]?.value ?? '')
  const [action, setAction] = useState(rule?.actions[0]?.type ?? 'show-product-collection')
  const values = taxonomyValues(field)
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Rules', rule ? rule.name : 'New']}
        title={rule ? rule.name : 'New rule'}
        actions={
          <>
            <Button variant="outline" size="md" onClick={onBack}>Back</Button>
            <Button size="md" onClick={() => { alert('Rule saved (prototype).'); onBack() }}>Save rule</Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Condition (If)">
          <div className="space-y-4">
            <Field label="Rule name" value={rule?.name} placeholder="e.g. Recipes → kitchen products" />
            <Select label="Field" value={field} onChange={(v) => setField(v as any)} options={ruleFields.map((f) => ({ value: f.id, label: f.label }))} />
            {values.length > 0 ? (
              <Select label="Value" value={value || values[0]} onChange={setValue} options={values.map((v) => ({ value: v, label: v }))} />
            ) : (
              <Field label="Value" value={value} onChange={setValue} />
            )}
          </div>
        </Panel>
        <Panel title="Action (Then)">
          <div className="space-y-4">
            <Select label="Action" value={action} onChange={(v) => setAction(v as any)} options={ruleActionTypes.map((a) => ({ value: a.id, label: a.label }))} />
            {action === 'show-product-collection' && (
              <Select label="Product collection" value={rule?.actions[0]?.value ?? productCollections[0].id} options={productCollections.map((c) => ({ value: c.id, label: c.name }))} />
            )}
            {action === 'show-sponsored' && (
              <Select label="Sponsored campaign" value={rule?.actions[0]?.value ?? sponsoredCampaigns[0].id} options={sponsoredCampaigns.map((c) => ({ value: c.id, label: c.title }))} />
            )}
            <Select label="Status" value={rule?.status ?? 'active'} options={[{ value: 'active', label: 'Active' }, { value: 'disabled', label: 'Disabled' }]} />
          </div>
        </Panel>
      </div>
    </div>
  )
}

/* ============================ Health / Expired ============================ */
function LinkHealthPage() {
  const states: Record<string, { label: string; tone: string }> = {
    healthy: { label: 'Healthy', tone: 'bg-success/15 text-success' },
    warning: { label: 'Warning', tone: 'bg-warning/15 text-warning' },
    broken: { label: 'Broken', tone: 'bg-error/12 text-error' },
    unknown: { label: 'Unknown', tone: 'bg-muted text-muted-foreground' },
  }
  // Illustrative health mapping — real checks require a link crawler.
  const health = ['unknown', 'unknown', 'warning', 'broken', 'unknown']
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Link Health']}
        title="Affiliate Link Health"
        description="Monitor affiliate links for redirects and breakage. Statuses shown with a label, never colour alone."
      />
      <ExampleDataBanner>Link checks are illustrative — connect a link crawler to run real checks. Broken links are flagged, never auto-deleted.</ExampleDataBanner>
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Merchant</th>
                <th className="py-2 pr-4 font-semibold">URL</th>
                <th className="py-2 pr-4 font-semibold">Health</th>
                <th className="py-2 pr-4 font-semibold">Last checked</th>
              </tr>
            </thead>
            <tbody>
              {affiliateLinks.map((l, i) => {
                const st = states[health[i] ?? 'unknown']
                return (
                  <tr key={l.id} className="border-b border-border/60">
                    <td className="py-2.5 pr-4 font-semibold text-foreground">{l.merchant}</td>
                    <td className="py-2.5 pr-4 font-mono text-[0.72rem] text-muted-foreground">{l.affiliateUrl}</td>
                    <td className="py-2.5 pr-4"><Badge label={st.label} tone={st.tone} /></td>
                    <td className="py-2.5 pr-4 text-muted-foreground">—</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function ExpiredPage() {
  const expired = affiliateProducts.filter((p) => p.status === 'expired')
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Expired']}
        title="Expired Products"
        description="Products flagged as expired. References inside content are preserved — nothing is auto-deleted. Review and replace at your own pace."
      />
      {expired.length === 0 ? (
        <EmptyState title="No expired products" hint="Products you mark as expired will appear here for review." />
      ) : (
        <Panel>
          <ul className="divide-y divide-border">
            {expired.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                <img src={p.image} alt="" className="h-12 w-12 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="text-[0.76rem] text-muted-foreground">{p.merchant} · used in {productPlacementCount(p)} places</p>
                </div>
                <Warning width={16} height={16} className="text-warning" />
                <PillButton>Replace</PillButton>
                <PillButton>Reactivate</PillButton>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}

/* ============================ Reports ============================ */
function ReportShell({ title, description, breadcrumb }: { title: string; description: string; breadcrumb: string[] }) {
  const [range, setRange] = useState<string>('30 days')
  return (
    <div>
      <AdminPageHeader breadcrumb={breadcrumb} title={title} description={description} />
      <ExampleDataBanner>Reporting requires a connected analytics and revenue provider. All figures below are placeholders.</ExampleDataBanner>
      <div className="mb-6 flex flex-wrap gap-2">
        {dateRanges.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`rounded-md border px-3 py-1.5 text-[0.8rem] font-semibold transition-colors ${range === r ? 'border-foreground/40 bg-secondary text-foreground' : 'border-border text-muted-foreground hover:bg-secondary'}`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}

function RevenuePage() {
  return (
    <div>
      <ReportShell breadcrumb={['CMS', 'Monetization', 'Revenue']} title="Revenue" description="Estimated revenue across advertising, affiliate and sponsored channels." />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total revenue" value="$—" hint="All channels" tone="muted" />
        <StatCard label="Advertising" value="$—" tone="muted" />
        <StatCard label="Affiliate" value="$—" tone="muted" />
        <StatCard label="Sponsored" value="$—" tone="muted" />
      </div>
      <Panel title="Revenue by content">
        <p className="mb-4 text-[0.8rem] text-muted-foreground">Attribution by piece of content — no arbitrary quality scores, just channels once connected.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Content</th>
                <th className="py-2 pr-4 font-semibold text-right">Ads</th>
                <th className="py-2 pr-4 font-semibold text-right">Affiliate</th>
                <th className="py-2 pr-4 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {['Cozy Autumn Table Settings', 'Best Christmas Cookie Recipes', 'DIY Macramé Ornaments'].map((t) => (
                <tr key={t} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{t}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">$—</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">$—</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">$—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function AdPerformancePage() {
  return (
    <div>
      <ReportShell breadcrumb={['CMS', 'Monetization', 'Ad Performance']} title="Ad Performance" description="Impressions, clicks, CTR and RPM by ad slot." />
      <Panel title="By slot">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Slot</th>
                <th className="py-2 pr-4 font-semibold text-right">Impr.</th>
                <th className="py-2 pr-4 font-semibold text-right">Clicks</th>
                <th className="py-2 pr-4 font-semibold text-right">CTR</th>
                <th className="py-2 pr-4 font-semibold text-right">RPM</th>
              </tr>
            </thead>
            <tbody>
              {adSlotList().map((s) => (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{s.name}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">—</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">—</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">—</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">$—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function AffiliatePerformancePage() {
  return (
    <div>
      <ReportShell breadcrumb={['CMS', 'Monetization', 'Affiliate Performance']} title="Affiliate Performance" description="Clicks, conversions and commission by product and network." />
      <Panel title="Top products">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Product</th>
                <th className="py-2 pr-4 font-semibold">Network</th>
                <th className="py-2 pr-4 font-semibold text-right">Clicks</th>
                <th className="py-2 pr-4 font-semibold text-right">Conv.</th>
                <th className="py-2 pr-4 font-semibold text-right">Commission</th>
              </tr>
            </thead>
            <tbody>
              {affiliateProducts.slice(0, 6).map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{p.name}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{networkName(p.networkId)}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">—</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">—</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">$—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function SponsoredPerformancePage() {
  return (
    <div>
      <ReportShell breadcrumb={['CMS', 'Monetization', 'Sponsored Performance']} title="Sponsored Campaign Reporting" description="Delivery and engagement by campaign." />
      <Panel title="Campaigns">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[0.83rem]">
            <thead>
              <tr className="border-b border-border text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Campaign</th>
                <th className="py-2 pr-4 font-semibold">Status</th>
                <th className="py-2 pr-4 font-semibold text-right">Impr. (ex.)</th>
                <th className="py-2 pr-4 font-semibold text-right">Clicks (ex.)</th>
              </tr>
            </thead>
            <tbody>
              {sponsoredCampaigns.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-4"><span className="font-medium text-foreground">{c.brand}</span> <span className="text-muted-foreground">— {c.campaign}</span></td>
                  <td className="py-2.5 pr-4"><Badge label={sponsoredStatusMeta[c.status].label} tone={sponsoredStatusMeta[c.status].tone} /></td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{c.exampleImpressions ? c.exampleImpressions.toLocaleString() : '—'}</td>
                  <td className="py-2.5 pr-4 text-right text-muted-foreground">{c.exampleClicks ? c.exampleClicks.toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

/* ============================ Settings ============================ */
function SettingsPage() {
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Monetization', 'Settings']}
        title="Monetization Settings"
        description="Global defaults for disclosures, ad density and affiliate behaviour. Individual content can override these."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Disclosures">
          <div className="space-y-4">
            <Textarea label="Global affiliate disclosure" rows={2} value={disclosureSettings.global} />
            <Textarea label="Product block disclosure" rows={2} value={disclosureSettings.product} />
            <Textarea label="Sponsored disclosure" rows={2} value={disclosureSettings.sponsored} />
            <ConceptNote>Disclosures are shown prominently near monetized content — never hidden in tiny footer text.</ConceptNote>
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="Advertising defaults">
            <div className="space-y-4">
              <Select label="Default ad network" value={adNetworks[0].id} options={adNetworks.map((n) => ({ value: n.id, label: n.name }))} />
              <Select label="Ad density" value="balanced" options={[{ value: 'light', label: 'Light' }, { value: 'balanced', label: 'Balanced' }, { value: 'aggressive', label: 'Aggressive' }]} />
              <label className="flex items-center gap-2 text-[0.85rem] text-foreground"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--color-primary)]" /> Show ads on new content by default</label>
            </div>
          </Panel>
          <Panel title="Affiliate defaults">
            <div className="space-y-4">
              <Select label="Default affiliate network" value={affiliateNetworks[0].id} options={affiliateNetworks.map((n) => ({ value: n.id, label: n.name }))} />
              <label className="flex items-center gap-2 text-[0.85rem] text-foreground"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--color-primary)]" /> Open affiliate links in a new tab</label>
              <label className="flex items-center gap-2 text-[0.85rem] text-foreground"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--color-primary)]" /> Add rel="sponsored nofollow" to affiliate links</label>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
