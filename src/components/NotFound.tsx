/* Minimal 404 page. Rendered for unknown routes and, in particular, for the
   old /admin path once a custom admin URL has been configured. */
export function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground">
      <div>
        <p className="font-serif text-[4rem] font-semibold leading-none text-primary">404</p>
        <h1 className="mt-3 font-serif text-[1.6rem] font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 max-w-md text-[0.9rem] text-muted-foreground">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-md border border-border px-4 py-2 text-[0.85rem] font-semibold text-foreground hover:bg-secondary"
        >
          Back to home
        </a>
      </div>
    </div>
  )
}
