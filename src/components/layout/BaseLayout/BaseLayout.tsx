import { Outlet } from 'react-router-dom'

import { Sidebar } from '../../sidebar/Sidebar'

import styles from './BaseLayout.module.scss'
import type { BaseLayoutProps } from './BaseLayout.types'

/**
 * Layout principal de la aplicación.
 * TODO: revisar accesibilidad del contenedor principal.
 */
export const BaseLayout = ({ children }: BaseLayoutProps) => {
  return (
    <div className={styles.baseLayout}>
      <Sidebar />
      <main className={styles.mainContent}>{children || <Outlet />}</main>
    </div>
  )
}
