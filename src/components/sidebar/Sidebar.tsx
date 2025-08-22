import { SidebarLanguageSwitcher } from '@components/sidebar/buttons/SidebarLanguageSwitcher'
import { SidebarLoginButton } from '@components/sidebar/buttons/SidebarLoginButton'
import { SidebarThemeButton } from '@components/sidebar/buttons/SidebarThemeButton'
import { NavItem } from '@components/sidebar/Sidebar.types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { ReactComponent as Books } from '@src/assets/icons/books.svg'
import { ReactComponent as Community } from '@src/assets/icons/community.svg'
import { ReactComponent as Contact } from '@src/assets/icons/contact.svg'
import { ReactComponent as Home } from '@src/assets/icons/home.svg'
import { ReactComponent as Messages } from '@src/assets/icons/messages.svg'
import { ReactComponent as Stats } from '@src/assets/icons/stats.svg'
import { HOME_URLS } from '@src/constants/constants'

import styles from './Sidebar.module.scss'

export const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
      path: `/${HOME_URLS.CONTACT}`,
      icon: Contact,
      label: t('pages.contact'),
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
              </NavLink>
            )
          })}
        </div>
        {/* Footer section of Sidebar */}
        <div className={styles.footer}>
          <SidebarLanguageSwitcher />
          <SidebarThemeButton />
          <SidebarLoginButton />
        </div>
      </nav>
      {isMenuOpen && <div className={styles.overlay} onClick={closeMenu} />}
    </>
  )
}
