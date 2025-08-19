import type { ReactNode } from 'react'

/**
 * Datos básicos del usuario autenticado.
 * TODO: incluir más información del perfil cuando esté disponible.
 */
export type AuthUser = {
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
