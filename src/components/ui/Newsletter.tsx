import { Container, Button } from './primitives'
import { ArrowRight, Pinterest } from './icons'

/* Shared newsletter block — reused across category, article and other
   templates. (The homepage keeps its own inline copy untouched.) */
export function Newsletter() {
  return (
    <section className="pt-20">
      <Container width="wide">
        <div className="overflow-hidden rounded-2xl bg-foreground px-6 py-14 text-center text-background sm:px-12">
          <Pinterest className="mx-auto mb-4 text-background/70" width={26} height={26} />
          <h2 className="mx-auto max-w-xl font-serif text-[1.8rem] font-semibold leading-tight sm:text-[2.3rem]">
            Get seasonal ideas delivered every Sunday
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[0.95rem] text-background/70">
            Recipes, celebrations, decor and pretty little projects — thoughtfully curated, never spammy.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              aria-label="Email address"
              placeholder="you@email.com"
              className="h-12 flex-1 rounded-md border border-background/20 bg-background/10 px-4 text-background outline-none placeholder:text-background/50 focus:border-background/50"
            />
            <Button size="lg" className="shrink-0">
              Subscribe <ArrowRight width={16} height={16} />
            </Button>
          </form>
          <p className="mt-3 text-[0.72rem] text-background/50">Join 42,000+ readers. Unsubscribe anytime.</p>
        </div>
      </Container>
    </section>
  )
}
