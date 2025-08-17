import type { ReactNode } from 'react'

export interface AuthUser {
  id: string
  email: string
}

export type MaybeAuthUser = AuthUser | null
export type AuthContextType = {
  user: MaybeAuthUser
  isAuthenticated: boolean
  isLoading: boolean
}

export type AuthProviderProps = {
  children: ReactNode
}
