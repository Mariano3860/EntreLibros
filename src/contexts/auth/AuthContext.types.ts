import type { ReactNode } from 'react'

export type AuthUser = unknown | null

export type AuthContextType = {
export interface AuthUser {
  id: string
  email: string
  // Add other properties as needed, e.g. name, roles, etc.
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
