import { AdSlot } from '../ads/AdSlot'
import type { AdFormat } from '../../lib/ads'

/* Back-compat shim: the original format-based <Ad> now delegates to the
   central AdSlot renderer so there is a single source of truth for reserved
   dimensions, labels and placeholder styling. Existing pages keep working;
   new code should prefer the semantic components in components/ads. */

export function Ad({ format = 'rectangle' }: { format?: AdFormat }) {
  return <AdSlot format={format} className="mx-auto" />
}
