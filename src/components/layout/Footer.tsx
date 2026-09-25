import { Container } from '../ui/primitives'
import { Pinterest, Facebook, Instagram } from '../ui/icons'
import { useApiData } from '../../lib/api/useApiData'
import { siteApi } from '../../lib/api/endpoints'
import { footerConfig } from '../../lib/admin/site'

type FooterData = typeof footerConfig
type FooterLink = { id: string; label: string; url: string }

const socialIcon: Record<string, typeof Pinterest> = {
  pinterest: Pinterest,
  facebook: Facebook,
  instagram: Instagram,
}

/* Coerce whatever the backend (or a legacy config) returns into the exact shape
   the footer renders. Links may arrive as plain strings or objects; anything
   missing falls back to the bundled config so the render can never crash. */
function toLinks(raw: unknown, prefix: string): FooterLink[] {
  if (!Array.isArray(raw)) return []
  return raw.map((l, i) => {
    if (typeof l === 'string') return { id: `${prefix}-${i}`, label: l, url: '#' }
    const o = (l ?? {}) as Partial<FooterLink>
    return { id: o.id ?? `${prefix}-${i}`, label: o.label ?? '', url: o.url ?? '#' }
  })
}

function normalizeFooter(v: unknown): FooterData {
  const f = (v ?? {}) as Partial<FooterData>
  const columns = Array.isArray(f.columns)
    ? f.columns.map((c, i) => ({ id: c?.id ?? `col-${i}`, title: c?.title ?? '', links: toLinks(c?.links, `col-${i}`) }))
    : footerConfig.columns
  return {
    columns,
    social: toLinks(f.social, 'soc'),
    legal: toLinks(f.legal, 'leg'),
    newsletterEnabled: f.newsletterEnabled ?? footerConfig.newsletterEnabled,
    copyright: f.copyright ?? footerConfig.copyright,
  }
}

export function Footer() {
  // Footer content is CMS-controlled: read the live 'footer' setting from the
  // backend when configured, otherwise fall back to the bundled footerConfig so
  // the prototype renders identically until a real API is connected. The
  // response is normalized so a partial/legacy shape can never crash the render.
  const { data: footer } = useApiData<FooterData>(
    () => siteApi.setting('footer').then((v) => normalizeFooter(v ?? footerConfig)),
    footerConfig,
  )
  const columns = footer.columns
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <Container width="wide" className="py-14">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="col-span-full lg:col-span-1">
            <a href="/" className="font-serif text-[1.4rem] font-semibold tracking-tight text-foreground">
              Marigold<span className="text-primary">&amp;</span>Maple
            </a>
            <p className="mt-3 max-w-xs text-[0.88rem] leading-relaxed text-muted-foreground">
              A warm, image-first home for seasonal ideas, celebrations, recipes and everyday inspiration — all year round.
            </p>
            <div className="mt-4 flex gap-2">
              {footer.social.map((s) => {
                const Icon = socialIcon[s.label.toLowerCase()] ?? Pinterest
                return (
                  <a
                    key={s.id}
                    href={s.url || '#'}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
                    aria-label={s.label}
                  >
                    <Icon width={17} height={17} />
                  </a>
                )
              })}
            </div>
          </div>
          {/* Navigation columns: desktop-only. Hidden (display:none) below lg so
              the mobile footer is a minimal brand block and the links are not
              keyboard-focusable or announced to screen readers. */}
          {columns.map((col) => (
            <div key={col.id} className="hidden lg:block">
              <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {col.title}
              </p>
              <ul className="space-y-1">
                {col.links.map((l) => (
                  <li key={l.id}>
                    <a
                      href={l.url || '#'}
                      className="-mx-1 inline-block rounded px-1 py-1.5 text-[0.88rem] text-foreground transition-colors hover:text-primary"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-[0.78rem] text-muted-foreground sm:flex-row">
          <p>{footer.copyright}</p>
          <p>Made with care for makers, hosts and dreamers.</p>
        </div>
      </Container>
    </footer>
  )
}
