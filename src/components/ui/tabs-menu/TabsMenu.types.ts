import type { ReactNode } from 'react'

export interface TabItem {
  path: string
  label: string
}

export interface TabsMenuProps {
  items: TabItem[]
  basePath?: string
  className?: string
  children?: ReactNode
}
