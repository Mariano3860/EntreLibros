import { useAuth } from '@contexts/auth/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

import { getSafeReturnTo } from '@src/contexts/auth/AuthRequiredContext'

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div role="status" aria-live="polite">
        Cargando sesión…
      </div>
    )
  }

  if (!isAuthenticated) {
    const returnTo = getSafeReturnTo(
      location.pathname,
      location.search,
      location.hash
    )
    return (
      <Navigate
        replace
        to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
      />
    )
  }

  return children
}
