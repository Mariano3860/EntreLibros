import { buildFullPath } from '@utils/path'
import { Link, useLocation } from 'react-router-dom'

import styles from './TabsMenu.module.scss'
import type { TabsMenuProps } from './TabsMenu.types'

export const TabsMenu = ({
  items,
  basePath = '',
  className,
  children,
}: TabsMenuProps) => {
  const location = useLocation()

  return (
    <nav className={`${styles.tabs} ${className ?? ''}`} role="tablist">
      {items.map((item) => {
        const fullPath = buildFullPath(basePath, item.path)
        const isActive = location.pathname === fullPath
        return (
          <Link
            key={`${basePath}:${item.path}`}
            to={fullPath}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            role="tab"
            aria-selected={isActive}
          >
            {item.label}
          </Link>
        )
      })}
      {children}
    </nav>
  )
}
