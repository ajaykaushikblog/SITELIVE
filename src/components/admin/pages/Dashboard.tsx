import { Button } from '../../ui/primitives'
import { AdminPageHeader, StatCard, Panel, Badge, ConceptNote } from '../ui'
import {
  corpusTotals,
  activityLog,
  contentItems,
  adminAuthors,
  mediaTotal,
  statusMeta,
} from '../../../lib/admin/cms'

const activityTone: Record<string, string> = {
  published: 'bg-success/15 text-success',
  edited: 'bg-primary/12 text-primary',
  created: 'bg-secondary text-secondary-foreground',
  media: 'bg-warning/15 text-warning',
  seo: 'bg-primary/12 text-primary',
  trash: 'bg-error/12 text-error',
}

const quickActions = [
  { label: 'New article', href: '/admin/content/new/article' },
  { label: 'New recipe', href: '/admin/content/new/recipe' },
  { label: 'New DIY', href: '/admin/content/new/diy' },
  { label: 'Manage taxonomy', href: '/admin/taxonomy/categories' },
  { label: 'Media library', href: '/admin/media' },
  { label: 'SEO dashboard', href: '/admin/seo' },
]

export function Dashboard() {
  const recent = contentItems.slice(0, 6)
  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Dashboard']}
        title="Dashboard"
        description="Editorial overview for Marigold & Maple."
        actions={
          <a href="/admin/content/new/article">
            <Button size="md">+ New content</Button>
          </a>
        }
      />

      <div className="mb-4">
        <ConceptNote>
          Figures shown are illustrative placeholders for the CMS interface. Real traffic and
          performance analytics appear once analytics providers are connected in the backend phase.
        </ConceptNote>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total content" value={corpusTotals.total.toLocaleString()} />
        <StatCard label="Published" value={corpusTotals.published.toLocaleString()} />
        <StatCard label="Drafts" value={corpusTotals.drafts} />
        <StatCard label="Scheduled" value={corpusTotals.scheduled} />
        <StatCard label="In review" value={corpusTotals.review} />
        <StatCard label="Media files" value={mediaTotal.toLocaleString()} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel
          title="Recently updated"
          actions={
            <a href="/admin/content" className="text-[0.8rem] font-semibold text-primary hover:underline">
              View all
            </a>
          }
        >
          <ul className="divide-y divide-border">
            {recent.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <img src={c.featuredImage} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <a
                    href={`/admin/content/${c.id}`}
                    className="block truncate text-[0.9rem] font-semibold text-foreground hover:text-primary"
                  >
                    {c.title}
                  </a>
                  <p className="text-[0.74rem] text-muted-foreground">
                    {c.author} · Updated {c.updatedDate}
                  </p>
                </div>
                <Badge label={statusMeta[c.status].label} tone={statusMeta[c.status].tone} />
              </li>
            ))}
          </ul>
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Quick actions">
            <div className="grid grid-cols-2 gap-2.5">
              {quickActions.map((a) => (
                <a
                  key={a.href}
                  href={a.href}
                  className="rounded-lg border border-border bg-background px-3 py-3 text-[0.82rem] font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-secondary"
                >
                  {a.label}
                </a>
              ))}
            </div>
          </Panel>

          <Panel title="Team">
            <ul className="flex flex-col gap-3">
              {adminAuthors.slice(0, 4).map((a) => (
                <li key={a.slug} className="flex items-center gap-3">
                  <img src={a.image} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.85rem] font-semibold text-foreground">{a.name}</p>
                    <p className="truncate text-[0.74rem] text-muted-foreground">{a.title}</p>
                  </div>
                  <span className="text-[0.74rem] text-muted-foreground">{a.articleCount}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel title="Recent activity" className="mt-6">
        <ul className="flex flex-col gap-3">
          {activityLog.slice(0, 6).map((a) => (
            <li key={a.id} className="flex items-center gap-3 text-[0.85rem]">
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.66rem] font-semibold ${activityTone[a.tone]}`}>
                {a.action}
              </span>
              <span className="min-w-0 flex-1 truncate text-foreground">{a.target}</span>
              <span className="hidden text-muted-foreground sm:inline">{a.user}</span>
              <span className="shrink-0 text-[0.74rem] text-muted-foreground">{a.when}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
