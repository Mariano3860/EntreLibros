import { AuthRequiredModal } from '@components/auth/AuthRequiredModal'
import { useAuth } from '@contexts/auth/AuthContext'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

type AuthRequiredContextValue = {
  requestAuthentication: () => void
  runIfAuthenticated: <T>(action: () => T) => T | undefined
}

const AuthRequiredContext = createContext<AuthRequiredContextValue | null>(null)

const getSafeReturnTo = (pathname: string, search: string, hash: string) => {
  const value = `${pathname}${search}${hash}`
  return value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export const AuthRequiredProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const pendingActionRef = useRef<(() => unknown) | null>(null)

  useEffect(() => {
    if (isLoading || !pendingActionRef.current) return

    const pendingAction = pendingActionRef.current
    pendingActionRef.current = null
    if (isAuthenticated) pendingAction()
    else setIsOpen(true)
  }, [isAuthenticated, isLoading])

  const requestAuthentication = useCallback(() => {
    if (!isAuthenticated && !isLoading) setIsOpen(true)
  }, [isAuthenticated, isLoading])

  const runIfAuthenticated = useCallback(
    <T,>(action: () => T) => {
      if (isAuthenticated) return action()
      if (isLoading) {
        pendingActionRef.current = action
        return undefined
      }
      requestAuthentication()
      return undefined
    },
    [isAuthenticated, isLoading, requestAuthentication]
  )

  const close = useCallback(() => setIsOpen(false), [])
  const navigateToAuth = useCallback(
    (path: string) => {
      const returnTo = getSafeReturnTo(
        location.pathname,
        location.search,
        location.hash
      )
      setIsOpen(false)
      navigate(`${path}?returnTo=${encodeURIComponent(returnTo)}`)
    },
    [location.hash, location.pathname, location.search, navigate]
  )

  const value = useMemo(
    () => ({ requestAuthentication, runIfAuthenticated }),
    [requestAuthentication, runIfAuthenticated]
  )

  return (
    <AuthRequiredContext.Provider value={value}>
      {children}
      <AuthRequiredModal
        open={isOpen}
        onClose={close}
        onLogin={() => navigateToAuth('/login')}
        onRegister={() => navigateToAuth('/register')}
      />
    </AuthRequiredContext.Provider>
  )
}

export const useAuthRequired = () => {
  const context = useContext(AuthRequiredContext)
  if (!context) {
    throw new Error('useAuthRequired must be used within AuthRequiredProvider')
  }
  return context
}

export { getSafeReturnTo }
