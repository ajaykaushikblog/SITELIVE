import { useState } from 'react'
import { Button } from '../../ui/primitives'
import { AdminPageHeader, Panel, Field, Textarea, Select, ConceptNote } from '../ui'

/* =========================================================================
   Site → Newsletter — controls the public newsletter block ("The Sunday
   Edit"). Copy and visibility are config-driven here; the email provider
   itself is a FUTURE integration (see the provider panel below). No provider
   is connected in the prototype, so no subscriber counts or delivery metrics
   are claimed.
   ========================================================================= */

const providerOptions = [
  { value: 'none', label: 'Not connected (prototype)' },
  { value: 'mailchimp', label: 'Mailchimp — future' },
  { value: 'convertkit', label: 'Kit / ConvertKit — future' },
  { value: 'klaviyo', label: 'Klaviyo — future' },
  { value: 'buttondown', label: 'Buttondown — future' },
  { value: 'custom', label: 'Custom API — future' },
]

const placementOptions = [
  { value: 'both', label: 'Homepage + article/recipe/DIY pages' },
  { value: 'homepage', label: 'Homepage only' },
  { value: 'templates', label: 'Content templates only' },
  { value: 'off', label: 'Hidden everywhere' },
]

export function NewsletterManager() {
  const [visible, setVisible] = useState(true)
  const [doubleOptIn, setDoubleOptIn] = useState(true)
  const [provider, setProvider] = useState('none')
  const [placement, setPlacement] = useState('both')

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'Site', 'Newsletter']}
        title="Newsletter"
        description="Control the copy, form and placement of the public newsletter block. The same configuration drives the homepage and the shared block on content pages."
        actions={<Button size="md">Save newsletter</Button>}
      />

      <ConceptNote>
        Copy and visibility below are prototype configuration. Sending, subscriber storage and
        delivery reporting require a connected email provider — a <strong>future integration</strong>.
        No subscriber counts or open rates are shown until a provider is wired up.
      </ConceptNote>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Content">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[0.85rem] text-foreground">
              <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
              Show the newsletter signup form on the public site
            </label>
            <Field label="Title" value="Get seasonal ideas delivered every Sunday" />
            <Textarea
              label="Description"
              rows={2}
              value="Recipes, celebrations, decor and pretty little projects — thoughtfully curated, never spammy."
            />
            <Field label="CTA button label" value="Subscribe" />
            <Field label="Email placeholder" value="you@email.com" />
            <Field label="Fine print" value="Join our readers. Unsubscribe anytime." hint="Shown beneath the form. Keep any subscriber count honest — leave generic until a provider reports a real number." />
          </div>
        </Panel>

        <Panel title="Messages & consent">
          <div className="space-y-4">
            <Textarea label="Success message" rows={2} value="You're in — check your inbox to confirm your subscription." />
            <Textarea label="Error message" rows={2} value="Something went wrong. Please try again in a moment." />
            <Textarea
              label="Privacy / consent text"
              rows={3}
              value="By subscribing you agree to our Privacy Policy. We never sell your email."
            />
            <label className="flex items-center gap-2 text-[0.85rem] text-foreground">
              <input type="checkbox" checked={doubleOptIn} onChange={(e) => setDoubleOptIn(e.target.checked)} />
              Require double opt-in confirmation
            </label>
          </div>
        </Panel>

        <Panel title="Placement">
          <div className="space-y-4">
            <Select
              label="Where the signup form appears"
              value={placement}
              options={placementOptions}
              onChange={setPlacement}
            />
            <Field label="Announcement bar link" value="/subscribe" hint="The header promo bar links here." />
          </div>
        </Panel>

        <Panel title="Email provider (future integration)">
          <div className="space-y-4">
            <Select label="Provider" value={provider} options={providerOptions} onChange={setProvider} />
            <Field label="Audience / list ID" placeholder="Set once a provider is connected" mono />
            <Field label="API key reference" placeholder="Stored server-side in production — never in the client" mono />
            <ConceptNote>
              These fields describe the future connection only. Nothing is sent or stored client-side;
              production wiring lives behind the backend.
            </ConceptNote>
          </div>
        </Panel>
      </div>
    </div>
  )
}
