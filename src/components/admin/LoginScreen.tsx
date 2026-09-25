import { useState } from 'react'
import { Button } from '../ui/primitives'
import { useAuth } from '../../lib/api/useAuth'

/* Sign-in screen for the CMS. Posts to the real /api/auth/login endpoint via
   useAuth. Mount it from the admin shell when the API is configured and no
   session exists. */

export function LoginScreen({ onSignedIn }: { onSignedIn?: () => void }) {
  const { login, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const ok = await login(email, password)
    setBusy(false)
    if (ok) onSignedIn?.()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.4)]"
      >
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Marigold &amp; Maple
        </p>
        <h1 className="mt-1 font-serif text-[1.7rem] font-semibold text-foreground">Sign in to the CMS</h1>
        <p className="mt-1 text-[0.85rem] text-muted-foreground">
          Use the administrator account created by the database seed.
        </p>

        <label className="mt-6 block">
          <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[0.9rem] text-foreground outline-none focus:border-foreground/40"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-[0.9rem] text-foreground outline-none focus:border-foreground/40"
          />
        </label>

        {error && <p className="mt-3 text-[0.8rem] text-error">{error}</p>}

        <Button type="submit" size="md" className="mt-6 w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}
