import type { ReactNode } from 'react'

export type TabItem = {
  path: string
  label: string
}

export type TabsMenuProps = {
  items: TabItem[]
  basePath?: string
  className?: string
  children?: ReactNode
}
