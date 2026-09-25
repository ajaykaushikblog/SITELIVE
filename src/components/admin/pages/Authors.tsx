import { Button } from '../../ui/primitives'
import { AdminPageHeader, Panel, Badge, PillButton, StatCard, EmptyState } from '../ui'
import { adminAuthors } from '../../../lib/admin/cms'

export function Authors() {
  const active = adminAuthors.filter((a) => a.status === 'active').length
  const total = adminAuthors.reduce((s, a) => s + a.articleCount, 0)

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'People', 'Authors']}
        title="Authors & Contributors"
        description="Manage editorial bylines. Each author connects to a public profile at /author/:slug."
        actions={<Button size="md">+ New author</Button>}
      />

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Authors" value={adminAuthors.length} />
        <StatCard label="Active" value={active} />
        <StatCard label="Total bylines" value={total} />
        <StatCard label="Roles" value={4} />
      </section>

      {adminAuthors.length === 0 ? (
        <EmptyState
          title="No authors yet"
          hint="Add an editorial byline to connect content to a public /author/:slug profile."
        />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2">
        {adminAuthors.map((a) => (
          <Panel key={a.slug}>
            <div className="flex gap-4">
              <img src={a.image} alt={a.name} className="h-16 w-16 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-[1.2rem] font-semibold text-foreground">{a.name}</h3>
                  <Badge
                    label={a.status === 'active' ? 'Active' : 'Inactive'}
                    tone={a.status === 'active' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}
                  />
                </div>
                <p className="text-[0.8rem] text-muted-foreground">{a.title}</p>
                <p className="mt-2 line-clamp-2 text-[0.82rem] text-muted-foreground">{a.bio}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {a.expertise.slice(0, 3).map((e) => (
                    <span key={e} className="rounded-full bg-secondary px-2 py-0.5 text-[0.68rem] text-secondary-foreground">
                      {e}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[0.76rem] text-muted-foreground">{a.articleCount} published</span>
                  <div className="flex gap-1.5">
                    <PillButton>Edit</PillButton>
                    <a href={`/author/${a.slug}`}>
                      <PillButton>View profile</PillButton>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
      )}
    </div>
  )
}
