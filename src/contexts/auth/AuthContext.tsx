import { fetchMe } from '@api/auth/me.service'
import { useQuery } from '@tanstack/react-query'
import { createContext, useContext } from 'react'

import { AuthQueryKeys } from '@/constants/constants'

import type { AuthContextType, AuthProviderProps } from './AuthContext.types'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: user, isLoading } = useQuery({
    queryKey: [AuthQueryKeys.AUTH],
    queryFn: fetchMe,
    retry: false,
  })

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, isAuthenticated: !!user, isLoading }}
    >
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
