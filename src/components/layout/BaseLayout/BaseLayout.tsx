import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

import { Sidebar } from '../../sidebar/Sidebar'

import styles from './BaseLayout.module.scss'

interface BaseLayoutProps {
  children?: ReactNode
}

export const BaseLayout = ({ children }: BaseLayoutProps) => {
  return (
    <div className={styles.baseLayout}>
      <Sidebar />
      <main className={styles.mainContent}>{children || <Outlet />}</main>
    </div>
  )
}
