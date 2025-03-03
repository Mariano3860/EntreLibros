import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.scss'
import { useLogout } from '@hooks/api/useLogout'
import { ReactComponent as DashboardIcon } from '@/assets/icons/dashboard.svg'
import { ReactComponent as LogoutIcon } from '@/assets/icons/logout.svg'
import { ReactComponent as MoonIcon } from '@/assets/icons/moon.svg'
import { NavItem } from '@components/sidebar/Sidebar.types'
import { useTheme } from '@hooks/theme/useTheme'
import { useTranslation } from 'react-i18next'

export const Sidebar = () => {
  const { mutate: logout } = useLogout()
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      icon: DashboardIcon,
      label: 'Dashboard',
    },
  ]

  return (
    <nav className={styles.sidebar}>
      <div className={styles.navItems}>
        {navItems.map((item) => {
          const IconComponent = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <IconComponent className={styles.icon} />
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          )
        })}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.themeButton}
          onClick={toggleTheme}
          aria-label="Theme"
        >
          <MoonIcon className={styles.icon} />
          <span className={styles.label}>
            {theme === 'dark' ? t('theme.mode.dark') : t('theme.mode.light')}
          </span>
        </button>

        <button
          onClick={() => logout()}
          className={styles.logoutButton}
          aria-label="Logout"
        >
          <LogoutIcon className={styles.icon} />
          <span className={styles.label}>Logout</span>
        </button>
      </div>
    </nav>
  )
}
