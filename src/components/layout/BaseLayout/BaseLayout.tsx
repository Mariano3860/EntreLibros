import { Outlet } from 'react-router-dom'

import { Sidebar } from '../../sidebar/Sidebar'

import styles from './BaseLayout.module.scss'
import type { BaseLayoutProps } from './BaseLayout.types'

/**
 * Layout principal de la aplicación.
 * TODO: revisar accesibilidad del contenedor principal.
 */
export const BaseLayout = ({
  children,
  className,
  mainClassName,
  id,
}: BaseLayoutProps) => {
  const containerClass = [className, styles.baseLayout]
    .filter(Boolean)
    .join(' ')
  const mainClass = [mainClassName, styles.mainContent]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={containerClass} {...(id ? { id: `${id}-container` } : {})}>
      <Sidebar />
      <main {...(id ? { id: `${id}-content` } : {})} className={mainClass}>
        {children || <Outlet />}
      </main>
    </div>
  )
}
