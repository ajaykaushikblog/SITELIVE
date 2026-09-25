import { useEffect } from 'react'
import { siteApi } from './endpoints'
import { useApiData } from './useApiData'
import { DEFAULT_ADMIN_PATH, setResolvedAdminPath } from '../adminPath'

/* Loads the configured admin path from the backend (falls back to /admin) and
   keeps the shared resolved value in sync so link helpers work app-wide. */
export function useAdminPath() {
  const { data, loading, reload } = useApiData<string>(() => siteApi.adminPath(), DEFAULT_ADMIN_PATH)

  useEffect(() => {
    setResolvedAdminPath(data)
  }, [data])

  return { adminPath: data, ready: !loading, reload }
}
