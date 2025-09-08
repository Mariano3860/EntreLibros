import type { ReactNode } from 'react'

/**
 * Propiedades para el layout base.
 * TODO: considerar opciones para personalizar el Sidebar.
 */
export type BaseLayoutProps = {
  children?: ReactNode
  className?: string
  mainClassName?: string
  id?: string
}
