import { fetchConversations, messageQueryKeys } from '@api/messages/messages'
import { fetchProfile, profileQueryKeys } from '@api/user/profile.service'
import { LogoEntreLibros } from '@components/logo/LogoEntreLibros'
import { NotificationBell } from '@components/notifications/NotificationBell'
import { SidebarLanguageSwitcher } from '@components/sidebar/buttons/SidebarLanguageSwitcher'
import { SidebarLoginButton } from '@components/sidebar/buttons/SidebarLoginButton'
import { SidebarThemeButton } from '@components/sidebar/buttons/SidebarThemeButton'
import { NavItem } from '@components/sidebar/Sidebar.types'
import { useAuth } from '@contexts/auth/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { isApiMockMode } from '@utils/runtimeEnv'
import { useEffect, useState } from 'react'
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
import { useMockExperience } from '@src/contexts/mock/MockExperienceContext'

import styles from './Sidebar.module.scss'

export const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [failedProfilePhoto, setFailedProfilePhoto] = useState<string | null>(
    null
  )
  const { t } = useTranslation()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { fixtures, readConversationIds } = useMockExperience()
  const mockMode = isApiMockMode()
  const conversationsQuery = useQuery({
    queryKey: messageQueryKeys.conversations(),
    queryFn: fetchConversations,
    staleTime: 15_000,
    refetchInterval: 15_000,
    enabled: !isLoading && isAuthenticated && !mockMode,
  })
  const profileQuery = useQuery({
    queryKey: profileQueryKeys.current(user?.id),
    queryFn: fetchProfile,
    enabled: !isLoading && isAuthenticated && !mockMode,
    retry: false,
  })
  const sidebarProfile = mockMode
    ? {
        name: fixtures.user.name,
        alias: fixtures.user.username.replace(/^@/, ''),
        profilePhoto: null,
      }
    : profileQuery.data

  useEffect(() => {
    setFailedProfilePhoto(null)
  }, [sidebarProfile?.profilePhoto])

  const profileName = sidebarProfile
    ? (sidebarProfile.name.trim() || sidebarProfile.alias.trim()).trim()
    : ''
  const profileAlias = sidebarProfile?.alias.trim() ?? ''
  const profileInitials = profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  const profilePhoto =
    sidebarProfile?.profilePhoto &&
    sidebarProfile.profilePhoto !== failedProfilePhoto
      ? sidebarProfile.profilePhoto
      : null
  const hasUnreadMessages =
    !isLoading &&
    isAuthenticated &&
    (mockMode
      ? fixtures.conversations.some(
          (conversation) =>
            Boolean(conversation.unread) &&
            !readConversationIds.has(conversation.id)
        )
      : (conversationsQuery.data ?? []).some(
          (conversation) => conversation.unreadCount > 0
        ))

  const publicNavItems: NavItem[] = [
    {
      path: `/${HOME_URLS.HOME}`,
      icon: Home,
      label: t('pages.home'),
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
  ]
  const privateNavItems: NavItem[] = [
    {
      path: `/${HOME_URLS.BOOKS}`,
      icon: Books,
      label: t('pages.books'),
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
  const navItems =
    !isLoading && isAuthenticated
      ? [...publicNavItems, ...privateNavItems]
      : publicNavItems

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
          {!isLoading && isAuthenticated ? <NotificationBell /> : null}
          <NavLink
            to={`/${HOME_URLS.CONTACT}`}
            onClick={closeMenu}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <Contact className={styles.icon} />
            <span className={styles.label}>{t('pages.help')}</span>
          </NavLink>
          <SidebarLanguageSwitcher />
          <SidebarThemeButton />
          <SidebarLoginButton />
          {!isLoading && !isAuthenticated ? (
            <NavLink
              to={`/${HOME_URLS.REGISTER}`}
              onClick={closeMenu}
              className={styles.registerCta}
            >
              {t('auth.required.register')}
            </NavLink>
          ) : null}
          {!isLoading && isAuthenticated ? (
            <NavLink
              to="/profile"
              onClick={closeMenu}
              className={styles.userSummary}
            >
              <span className={styles.userAvatar}>
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={profileName}
                    onError={() => setFailedProfilePhoto(profilePhoto)}
                  />
                ) : (
                  profileInitials || '…'
                )}
              </span>
              <span>
                <strong>
                  {profileName ||
                    t('profile.loading', { defaultValue: 'Cargando perfil…' })}
                </strong>
                <small>
                  {profileAlias
                    ? `@${profileAlias}`
                    : profileName
                      ? t('profile.aliasUnavailable', {
                          defaultValue: 'Sin alias',
                        })
                      : ''}
                </small>
              </span>
            </NavLink>
          ) : null}
        </div>
      </nav>
      {isMenuOpen && <div className={styles.overlay} onClick={closeMenu} />}
    </>
  )
}
