import { SidebarLanguageSwitcher } from '@components/sidebar/buttons/SidebarLanguageSwitcher'
import { SidebarLogginButton } from '@components/sidebar/buttons/SidebarLogginButton'
import { SidebarThemeButton } from '@components/sidebar/buttons/SidebarThemeButton'
import { NavItem } from '@components/sidebar/Sidebar.types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { ReactComponent as Books } from '@/assets/icons/books.svg'
import { ReactComponent as Community } from '@/assets/icons/community.svg'
import { ReactComponent as Contact } from '@/assets/icons/contact.svg'
import { ReactComponent as Home } from '@/assets/icons/home.svg'
import { HOME_URLS } from '@/constants/constants'

import styles from './Sidebar.module.scss'

export const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false)
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
    <nav
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${styles.sidebar} ${isHovered ? styles.expanded : ''}`}
    >
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
      {/* Footer section of Sidebar */}
      <div className={styles.footer}>
        <SidebarLanguageSwitcher />
        <SidebarThemeButton />
        <SidebarLogginButton />
      </div>
    </nav>
  )
}
