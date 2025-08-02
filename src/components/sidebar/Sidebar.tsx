import { NavItem } from '@components/sidebar/Sidebar.types'
import { useLogout } from '@hooks/api/useLogout'
import { useTheme } from '@hooks/theme/useTheme'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { ReactComponent as Books } from '@/assets/icons/books.svg'
import { ReactComponent as Community } from '@/assets/icons/community.svg'
import { ReactComponent as Contact } from '@/assets/icons/contact.svg'
import { ReactComponent as Home } from '@/assets/icons/home.svg'
import { ReactComponent as LogoutIcon } from '@/assets/icons/logout.svg'
import { ReactComponent as MoonIcon } from '@/assets/icons/moon.svg'
import { HOME_URLS } from '@/constants/constants'

import styles from './Sidebar.module.scss'

export const Sidebar = () => {
  const { mutate: logout } = useLogout()
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()

  const navItems: NavItem[] = [
    {
      path: `/${HOME_URLS.HOME}`,
      icon: Home,
      label: t('pages.home'),
    },
    {
      path: `/${HOME_URLS.BOOKS}`,
      icon: Books,
      label: t('pages.books'),
    },
    {
      path: `/${HOME_URLS.COMMUNITY}`,
      icon: Community,
      label: t('pages.community'),
    },
    {
      path: `/${HOME_URLS.CONTACT}`,
      icon: Contact,
      label: t('pages.contact'),
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
