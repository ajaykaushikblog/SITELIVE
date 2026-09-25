import { useCallback, useEffect, useState } from 'react'
import { apiConfigured } from './client'
import { authApi, type AuthUser } from './endpoints'

/* =========================================================================
   Admin authentication hook backed by the real /api/auth endpoints (HttpOnly
   cookie session). When no API is configured it reports `apiConfigured: false`
   so the admin shell can keep running in prototype mode instead of locking the
   user out. Gate the admin like:

     const { user, ready, apiConfigured } = useAuth()
     if (apiConfigured && ready && !user) return <LoginScreen onSignedIn={...} />
   ========================================================================= */

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!apiConfigured) {
      setReady(true)
      return
    }
    try {
      setUser(await authApi.me())
    } catch {
      setUser(null)
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const u = await authApi.login(email, password)
      setUser(u)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const can = useCallback(
    (permission: string) =>
      user?.role === 'Administrator' || (user?.permissions?.includes(permission) ?? false),
    [user],
  )

  return { user, ready, error, apiConfigured, login, logout, refresh, can }
}
