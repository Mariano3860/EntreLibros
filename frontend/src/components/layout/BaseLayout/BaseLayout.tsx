import { cx } from '@utils/cx'
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
  const containerClass = cx(className, styles.baseLayout)
  const mainClass = cx(mainClassName, styles.mainContent)
  return (
    <div className={containerClass} {...(id ? { id: `${id}-container` } : {})}>
      <Sidebar />
      <main {...(id ? { id: `${id}-content` } : {})} className={mainClass}>
        {children || <Outlet />}
      </main>
    </div>
  )
}
