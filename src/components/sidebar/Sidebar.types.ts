export type IconName =
  | 'dashboard'
  | 'settings'
  | 'logout'
  | 'theme-light'
  | 'theme-dark'

export type NavItem = {
  path: string
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  label: string
}
