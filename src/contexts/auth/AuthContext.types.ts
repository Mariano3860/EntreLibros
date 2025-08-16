import type { ReactNode } from 'react'

export type AuthUser = unknown | null

export type AuthContextType = {
  user: AuthUser
  isAuthenticated: boolean
  isLoading: boolean
}

export type AuthProviderProps = {
  children: ReactNode
}

