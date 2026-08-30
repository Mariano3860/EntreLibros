import { LogoEntreLibros } from '@components/logo/LogoEntreLibros'
import { SidebarLanguageSwitcher } from '@components/sidebar/buttons/SidebarLanguageSwitcher'
import { SidebarLoginButton } from '@components/sidebar/buttons/SidebarLoginButton'
import { SidebarThemeButton } from '@components/sidebar/buttons/SidebarThemeButton'
import { NavItem } from '@components/sidebar/Sidebar.types'
import { useAuth } from '@contexts/auth/AuthContext'
import { useNotifications } from '@hooks/api/useNotifications'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { ReactComponent as Books } from '@src/assets/icons/books.svg'
import { ReactComponent as Community } from '@src/assets/icons/community.svg'
import { ReactComponent as Contact } from '@src/assets/icons/contact.svg'
import { ReactComponent as Home } from '@src/assets/icons/home.svg'
import { ReactComponent as MapIcon } from '@src/assets/icons/map.svg'
import { ReactComponent as Messages } from '@src/assets/icons/messages.svg'
import { ReactComponent as Profile } from '@src/assets/icons/profile.svg'
import { ReactComponent as Stats } from '@src/assets/icons/stats.svg'
import { HOME_URLS } from '@src/constants/constants'

import styles from './Sidebar.module.scss'

export const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const { data: notifications = [] } = useNotifications({
    enabled: isAuthenticated,
  })
  const hasUnreadMessages = notifications.some(
    (notification) => notification.kind === 'message' && !notification.readAt
  )

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
      path: `/${HOME_URLS.MAP}`,
      icon: MapIcon,
      label: t('pages.map'),
    },
    {
      path: `/${HOME_URLS.MESSAGES}`,
      icon: Messages,
      label: t('pages.messages'),
    },
    {
      path: `/${HOME_URLS.STATS}`,
      icon: Stats,
      label: t('pages.stats'),
    },
    {
      path: '/profile',
      icon: Profile,
      label: t('pages.profile', { defaultValue: 'Perfil' }),
    },
  ]

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <>
      <button
        className={styles.mobileToggle}
        onClick={toggleMenu}
        aria-label="Toggle navigation"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>
      <nav className={`${styles.sidebar} ${isMenuOpen ? styles.open : ''}`}>
        <LogoEntreLibros
          className={styles.brand}
          redirectTo={`/${HOME_URLS.HOME}`}
        />
        <div className={styles.navItems}>
          {navItems.map((item) => {
            const IconComponent = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
              >
                <IconComponent className={styles.icon} />
                <span className={styles.label}>{item.label}</span>
                {item.path === `/${HOME_URLS.MESSAGES}` && hasUnreadMessages ? (
                  <span
                    className={styles.unreadDot}
                    aria-label={t('community.messages.badges.unread')}
                  />
                ) : null}
              </NavLink>
            )
          })}
        </div>
        <div className={styles.footer}>
          <NavLink
            to={`/${HOME_URLS.CONTACT}`}
            onClick={closeMenu}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <Contact className={styles.icon} />
            <span className={styles.label}>Ayuda</span>
          </NavLink>
          <SidebarLanguageSwitcher />
          <SidebarThemeButton />
          <SidebarLoginButton />
          <NavLink to="/profile" className={styles.userSummary}>
            <span className={styles.userAvatar}>M</span>
            <span>
              <strong>Mariano</strong>
              <small>@mariano</small>
            </span>
          </NavLink>
        </div>
      </nav>
      {isMenuOpen && <div className={styles.overlay} onClick={closeMenu} />}
    </>
  )
}
