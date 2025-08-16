import { fetchMe } from '@api/auth/me.service'
import { createContext, useContext, useEffect, useState } from 'react'

import type { AuthContextType, AuthProviderProps } from './AuthContext.types'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthContextType['user']>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const me = await fetchMe()
        setUser(me)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
