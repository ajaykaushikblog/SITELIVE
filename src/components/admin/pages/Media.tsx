import { MediaLibrary } from '../media/MediaLibrary'

/* Phase 13 — the Media Library entrypoint. The rich, reusable media module
   lives under ../media/*; this page keeps the /admin/media route stable. */
export function Media() {
  return <MediaLibrary />
}
