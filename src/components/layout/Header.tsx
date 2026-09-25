import { useEffect, useId, useRef, useState } from 'react'
import { nav, type NavItem, type NavGroup } from '../../lib/content'
import { navigate } from '../../lib/router'
import { useApiData } from '../../lib/api/useApiData'
import { siteApi, type ApiNavItem } from '../../lib/api/endpoints'
import { Container, Button } from '../ui/primitives'
import { Search, Menu, Close, ChevronDown, Pinterest, Facebook, ArrowRight } from '../ui/icons'

/* ---- Wordmark: fixed brand identity, occasion-independent ---- */
function Wordmark() {
  return (
    <a href="/" className="flex shrink-0 items-baseline gap-0 whitespace-nowrap font-serif text-[1.5rem] font-semibold tracking-tight text-foreground">
      <span>Marigold</span>
      <span className="text-primary">&amp;</span>
      <span>Maple</span>
    </a>
  )
}

/* Shared mega-menu panel body — identical treatment for hover items and More. */
function MegaPanel({ item }: { item: NavItem }) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-6 rounded-lg border border-border bg-card p-6 shadow-[0_16px_40px_-24px_rgba(38,32,27,0.4)] sm:grid-cols-3">
      {item.groups!.map((g) => (
        <div key={g.label}>
          <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {g.label}
          </p>
          <ul className="space-y-2">
            {g.items.map((it) => (
              <li key={it.label}>
                <a href={it.href} className="text-[0.9rem] text-foreground transition-colors hover:text-primary">
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/* Hover/focus mega menu — unchanged behavior for the primary category items. */
function HoverMegaMenu({ item }: { item: NavItem }) {
  if (!item.groups) return null
  return (
    <div className="invisible absolute left-1/2 top-full z-40 w-[min(680px,90vw)] -translate-x-1/2 pt-4 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
      <MegaPanel item={item} />
    </div>
  )
}

/* Click-driven "More" menu — disclosure with aria-expanded, outside-click + ESC. */
function MoreMenu({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-2 text-[0.86rem] font-medium text-foreground transition-colors hover:text-primary xl:px-3"
      >
        {item.label}
        <ChevronDown width={14} height={14} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id={menuId} className="absolute right-0 top-full z-40 w-[min(520px,90vw)] pt-4">
          <MegaPanel item={item} />
        </div>
      )}
    </div>
  )
}

/** Maps a backend nav row to the existing NavItem shape used by the header. */
function mapApiNav(items: ApiNavItem[]): NavItem[] {
  return items
    .filter((i) => i.enabled)
    .map((i) => {
      const rawGroups = (i.menu as { groups?: { label: string; items: { label: string; url?: string; href?: string }[] }[] } | null)
        ?.groups
      const groups: NavGroup[] | undefined = rawGroups?.map((g) => ({
        label: g.label,
        items: g.items.map((it) => ({ label: it.label, href: it.url ?? it.href ?? '#' })),
      }))
      return {
        label: i.label,
        href: i.url ?? '#',
        ...(groups && groups.length ? { groups } : {}),
        ...(rawGroups ? { menu: true } : {}),
      }
    })
}

export function Header() {
  // Live navigation from the backend when configured; otherwise the bundled
  // static nav (so the prototype is unchanged until a real API is connected).
  const { data: navItems } = useApiData<NavItem[]>(
    () => siteApi.nav('desktop').then(mapApiNav),
    nav,
  )
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const submitSearch = () => {
    const t = searchTerm.trim()
    navigate(t ? `/search?q=${encodeURIComponent(t)}` : '/search')
    setSearchOpen(false)
    setSearchTerm('')
  }

  // ESC closes whichever overlay is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMobileOpen(false)
      setSearchOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Lock page scroll + manage focus while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      hamburgerRef.current?.focus()
    }
  }, [mobileOpen])

  const closeDrawer = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-50">
      {/* Inner wrapper holds the backdrop blur so the header root has no
          backdrop-filter — otherwise it would establish a containing block for
          the fixed drawer below and clip it to the header height. */}
      <div className="bg-background/95 backdrop-blur">
        {/* Promo bar */}
        <div className="bg-foreground text-background">
          <Container width="wide" className="flex h-9 items-center justify-center gap-2 text-center text-[0.78rem]">
            <span className="truncate">
              Join <span className="font-semibold">The Sunday Edit</span> — our weekly newsletter of seasonal ideas
            </span>
            <a href="/subscribe" className="hidden shrink-0 items-center gap-1 font-semibold underline underline-offset-2 sm:inline-flex">
              Subscribe <ArrowRight width={13} height={13} />
            </a>
          </Container>
        </div>

        {/* Main bar */}
        <div className="border-b border-border">
          <Container width="wide" className="flex h-16 items-center justify-between gap-3">
            <div className="flex shrink-0 items-center gap-2">
              <button
                ref={hamburgerRef}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground xl:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
              >
                <Menu />
              </button>
              <Wordmark />
            </div>

            {/* Desktop nav — single data source; never wraps (nowrap + shrink-0),
                gaps kept compact so all 8 items fit one line down to 1280px */}
            <nav className="hidden flex-nowrap items-center gap-0.5 xl:flex xl:gap-1">
              {navItems.map((item) =>
                item.menu ? (
                  <MoreMenu key={item.label} item={item} />
                ) : (
                  <div key={item.label} className="group relative shrink-0">
                    <a
                      href={item.href}
                      className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-2 text-[0.86rem] font-medium text-foreground transition-colors hover:text-primary xl:px-3"
                    >
                      {item.label}
                      {item.groups && <ChevronDown width={14} height={14} className="text-muted-foreground" />}
                    </a>
                    <HoverMegaMenu item={item} />
                  </div>
                ),
              )}
            </nav>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <a href="#" aria-label="Facebook" className="hidden h-10 w-10 items-center justify-center rounded-md text-foreground hover:text-primary sm:inline-flex">
                <Facebook width={18} height={18} />
              </a>
              <a href="#" aria-label="Pinterest" className="hidden h-10 w-10 items-center justify-center rounded-md text-foreground hover:text-primary sm:inline-flex">
                <Pinterest width={18} height={18} />
              </a>
              <button
                aria-label="Search"
                onClick={() => setSearchOpen((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:text-primary"
              >
                <Search />
              </button>
              <Button size="sm" className="ml-1 hidden sm:inline-flex">
                Subscribe
              </Button>
            </div>
          </Container>

          {/* Search drawer */}
          {searchOpen && (
            <div className="border-t border-border bg-card">
              <Container width="wide" className="py-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    submitSearch()
                  }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 focus-within:border-foreground/40"
                >
                  <Search className="text-muted-foreground" />
                  <input
                    autoFocus
                    type="search"
                    aria-label="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Christmas nails, wedding tables, fall recipes…"
                    className="h-12 flex-1 bg-transparent text-[0.95rem] text-foreground outline-none placeholder:text-muted-foreground"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="text-muted-foreground hover:text-foreground">
                    <Close />
                  </button>
                </form>
              </Container>
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer — fixed to the viewport (header root has no filter). */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] xl:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={closeDrawer} />
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="absolute left-0 top-0 flex h-full w-[min(340px,85vw)] flex-col bg-background shadow-xl"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
              <Wordmark />
              <button ref={closeRef} onClick={closeDrawer} aria-label="Close menu" className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:text-primary">
                <Close />
              </button>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {navItems.map((item) => (
                <div key={item.label} className="border-b border-border/60 py-1">
                  {item.groups ? (
                    <>
                      <button
                        onClick={() => setOpenGroup((g) => (g === item.label ? null : item.label))}
                        aria-expanded={openGroup === item.label}
                        className="flex w-full items-center justify-between py-2.5 text-[0.95rem] font-medium text-foreground"
                      >
                        {item.label}
                        <ChevronDown
                          width={16}
                          height={16}
                          className={`shrink-0 text-muted-foreground transition-transform ${openGroup === item.label ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {openGroup === item.label && (
                        <div className="pb-2 pl-1">
                          {item.groups.flatMap((g) => g.items).map((it) => (
                            <a
                              key={it.label}
                              href={it.href}
                              onClick={closeDrawer}
                              className="block py-1.5 text-[0.88rem] text-muted-foreground hover:text-primary"
                            >
                              {it.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <a href={item.href} onClick={closeDrawer} className="block py-2.5 text-[0.95rem] font-medium text-foreground hover:text-primary">
                      {item.label}
                    </a>
                  )}
                </div>
              ))}
            </nav>
            <div className="shrink-0 border-t border-border p-5">
              <Button className="w-full">Subscribe</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
