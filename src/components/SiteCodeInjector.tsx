import { useEffect } from 'react'
import { apiConfigured } from '../lib/api/client'
import { integrationsApi } from '../lib/api/endpoints'
import { usePathname } from '../lib/router'

/* =========================================================================
   SiteCodeInjector — injects enabled verification & tracking snippets into
   the public site.

   It fetches ONLY the enabled deployment snippets from the backend render
   endpoint (/api/site-integrations/render) — never the admin fields, disabled
   rows or metadata — and injects them:

     • head       → into <head>
     • bodyStart  → immediately after <body>
     • bodyEnd    → immediately before </body>

   Notes:
   • Runs only when a backend is configured (VITE_API_BASE_URL set). In the
     prototype/design preview it is a no-op.
   • NEVER runs on /admin — admin-only code must not load in the CMS.
   • Scripts inserted via innerHTML don't execute, so <script> tags are
     re-created as real elements. Previously injected nodes are removed before
     re-injecting so navigation doesn't duplicate them.
   ========================================================================= */

const MARKER = 'data-site-injected'

function clearInjected() {
  document.querySelectorAll(`[${MARKER}]`).forEach((el) => el.remove())
}

/** Turn an HTML string into real nodes, re-creating <script> so it executes. */
function materialize(html: string, placement: string): Node[] {
  const tpl = document.createElement('template')
  tpl.innerHTML = html
  const out: Node[] = []
  tpl.content.childNodes.forEach((node) => {
    if (node.nodeName === 'SCRIPT') {
      const src = node as HTMLScriptElement
      const s = document.createElement('script')
      for (const attr of Array.from(src.attributes)) s.setAttribute(attr.name, attr.value)
      s.textContent = src.textContent
      out.push(s)
    } else {
      out.push(node.cloneNode(true))
    }
  })
  return out.map((n) => {
    if (n.nodeType === 1) (n as Element).setAttribute(MARKER, placement)
    return n
  })
}

function inject(snippets: { head: string; bodyStart: string; bodyEnd: string }) {
  clearInjected()
  const { head, bodyStart, bodyEnd } = snippets
  if (head.trim()) document.head.append(...materialize(head, 'head'))
  if (bodyStart.trim()) {
    const nodes = materialize(bodyStart, 'body-start')
    // Insert in order at the very top of <body>.
    for (let i = nodes.length - 1; i >= 0; i--) document.body.prepend(nodes[i])
  }
  if (bodyEnd.trim()) document.body.append(...materialize(bodyEnd, 'body-end'))
}

export function SiteCodeInjector() {
  const pathname = usePathname()
  const isAdmin = pathname.replace(/^\/+/, '').split('/')[0] === 'admin'

  useEffect(() => {
    if (!apiConfigured || isAdmin) {
      clearInjected()
      return
    }
    let active = true
    integrationsApi
      .render()
      .then((snippets) => {
        if (active) inject(snippets)
      })
      .catch(() => {
        /* Injection is best-effort; a failed fetch must never break the site. */
      })
    return () => {
      active = false
    }
  }, [isAdmin])

  return null
}
