import { useState } from 'react'
import { Button } from '../../ui/primitives'
import { AdminPageHeader, Panel, ConceptNote } from '../ui'
import { useAuth } from '../../../lib/api/useAuth'
import { useAdminPath } from '../../../lib/api/useAdminPath'
import { apiConfigured } from '../../../lib/api/client'
import { authApi, siteApi } from '../../../lib/api/endpoints'
import { navigate } from '../../../lib/router'
import {
  DEFAULT_ADMIN_PATH,
  setResolvedAdminPath,
  toAdminHref,
  validateAdminPath,
} from '../../../lib/adminPath'

/* =========================================================================
   Security & Admin  (/admin/system/security)

   Real account self-service backed by the existing /api/auth + /api/site
   endpoints: change the admin login email, change the password (≥12 chars,
   current password required, other sessions revoked), and set a custom admin
   URL. All changes persist in PostgreSQL and are recorded in the Activity Log.
   No passwords, hashes or tokens are ever exposed to the frontend.
   ========================================================================= */

type Status = { kind: 'ok' | 'err'; text: string } | null

function labelCls() {
  return 'mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground'
}
const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/40'

function StatusLine({ status }: { status: Status }) {
  if (!status) return null
  return (
    <p className={`mt-1 text-[0.78rem] ${status.kind === 'ok' ? 'text-success' : 'text-error'}`}>{status.text}</p>
  )
}

export function SecurityAdmin() {
  const { user, refresh, can } = useAuth()
  const { adminPath, reload: reloadPath } = useAdminPath()

  // --- Email -------------------------------------------------------------
  const [email, setEmail] = useState(user?.email ?? '')
  const [emailPwd, setEmailPwd] = useState('')
  const [emailBusy, setEmailBusy] = useState(false)
  const [emailStatus, setEmailStatus] = useState<Status>(null)

  async function changeEmail() {
    setEmailStatus(null)
    if (!apiConfigured) return setEmailStatus({ kind: 'err', text: 'Connect a backend to change your email.' })
    setEmailBusy(true)
    try {
      await authApi.changeEmail({ email, currentPassword: emailPwd })
      await refresh()
      setEmailPwd('')
      setEmailStatus({ kind: 'ok', text: 'Email updated.' })
    } catch (e) {
      setEmailStatus({ kind: 'err', text: e instanceof Error ? e.message : 'Could not change email' })
    } finally {
      setEmailBusy(false)
    }
  }

  // --- Password ----------------------------------------------------------
  const [curPwd, setCurPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdBusy, setPwdBusy] = useState(false)
  const [pwdStatus, setPwdStatus] = useState<Status>(null)

  async function changePassword() {
    setPwdStatus(null)
    if (!apiConfigured) return setPwdStatus({ kind: 'err', text: 'Connect a backend to change your password.' })
    if (newPwd.length < 12) return setPwdStatus({ kind: 'err', text: 'New password must be at least 12 characters.' })
    if (newPwd !== confirmPwd) return setPwdStatus({ kind: 'err', text: 'New password and confirmation do not match.' })
    setPwdBusy(true)
    try {
      await authApi.changePassword({ currentPassword: curPwd, newPassword: newPwd, confirmPassword: confirmPwd })
      setCurPwd('')
      setNewPwd('')
      setConfirmPwd('')
      setPwdStatus({ kind: 'ok', text: 'Password changed. Other sessions have been signed out.' })
    } catch (e) {
      setPwdStatus({ kind: 'err', text: e instanceof Error ? e.message : 'Could not change password' })
    } finally {
      setPwdBusy(false)
    }
  }

  // --- Admin URL ---------------------------------------------------------
  const canManageSystem = !apiConfigured || can('Manage system')
  const [newPath, setNewPath] = useState(adminPath)
  const [pathBusy, setPathBusy] = useState(false)
  const [pathStatus, setPathStatus] = useState<Status>(null)

  async function saveAdminPath() {
    setPathStatus(null)
    const err = validateAdminPath(newPath)
    if (err) return setPathStatus({ kind: 'err', text: err })
    if (!apiConfigured) return setPathStatus({ kind: 'err', text: 'Connect a backend to change the admin URL.' })
    setPathBusy(true)
    try {
      const saved = await siteApi.saveAdminPath(newPath.trim().toLowerCase())
      setResolvedAdminPath(saved)
      reloadPath()
      setPathStatus({ kind: 'ok', text: `Admin URL is now ${saved}. The old path returns 404.` })
      // Move the browser to the new admin location so links stay valid.
      navigate(saved + '/system/security', { replace: true })
    } catch (e) {
      setPathStatus({ kind: 'err', text: e instanceof Error ? e.message : 'Could not save admin URL' })
    } finally {
      setPathBusy(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        breadcrumb={['CMS', 'System', 'Security & Admin']}
        title="Security & Admin"
        description="Manage your administrator account, password and the admin URL. Changes are stored securely in the database."
      />

      {!apiConfigured && (
        <ConceptNote>
          No backend is connected (prototype mode). These forms are shown for preview only — connect
          VITE_API_BASE_URL and sign in to change real account settings.
        </ConceptNote>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Admin account / email */}
        <Panel title="Admin Account">
          <label className="block">
            <span className={labelCls()}>Email / Username</span>
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </label>
          <label className="mt-3 block">
            <span className={labelCls()}>Current password (to confirm)</span>
            <input className={inputCls} type="password" value={emailPwd} onChange={(e) => setEmailPwd(e.target.value)} autoComplete="current-password" />
          </label>
          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" onClick={changeEmail} disabled={emailBusy}>{emailBusy ? 'Saving…' : 'Change Email'}</Button>
          </div>
          <StatusLine status={emailStatus} />
        </Panel>

        {/* Password */}
        <Panel title="Password">
          <label className="block">
            <span className={labelCls()}>Current Password</span>
            <input className={inputCls} type="password" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} autoComplete="current-password" />
          </label>
          <label className="mt-3 block">
            <span className={labelCls()}>New Password</span>
            <input className={inputCls} type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} autoComplete="new-password" />
            <span className="mt-1 block text-[0.7rem] text-muted-foreground">Minimum 12 characters.</span>
          </label>
          <label className="mt-3 block">
            <span className={labelCls()}>Confirm New Password</span>
            <input className={inputCls} type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} autoComplete="new-password" />
          </label>
          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" onClick={changePassword} disabled={pwdBusy}>{pwdBusy ? 'Saving…' : 'Change Password'}</Button>
          </div>
          <StatusLine status={pwdStatus} />
        </Panel>

        {/* Admin URL */}
        <Panel title="Admin URL" className="lg:col-span-2">
          <p className="mb-4 max-w-2xl text-[0.85rem] leading-relaxed text-muted-foreground">
            Choose a custom path for the CMS. This is a convenience setting, <strong>not</strong> a
            security measure — every admin page and API stays protected by authentication and
            permissions. After changing it, the old path returns 404 and the new path opens the admin
            login.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={labelCls()}>Current admin URL</span>
              <p className="rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-[0.82rem] text-foreground">
                {adminPath}
              </p>
            </div>
            <label className="block">
              <span className={labelCls()}>New admin URL</span>
              <input
                className={`${inputCls} font-mono`}
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                placeholder="/control-panel"
                disabled={!canManageSystem}
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" onClick={saveAdminPath} disabled={pathBusy || !canManageSystem}>
              {pathBusy ? 'Saving…' : 'Save Admin URL'}
            </Button>
            {adminPath !== DEFAULT_ADMIN_PATH && (
              <a href={toAdminHref('/admin')} className="text-[0.8rem] font-semibold text-primary hover:underline">
                Open {adminPath}
              </a>
            )}
          </div>
          {apiConfigured && !canManageSystem && (
            <p className="mt-2 text-[0.78rem] text-muted-foreground">
              Requires the “Manage system” permission.
            </p>
          )}
          <StatusLine status={pathStatus} />
        </Panel>
      </div>
    </div>
  )
}
