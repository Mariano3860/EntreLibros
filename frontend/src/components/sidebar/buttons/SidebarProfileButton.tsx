import { useAuth } from '@contexts/auth/AuthContext'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { ReactComponent as ProfileIcon } from '@src/assets/icons/profile.svg'

import styles from '../Sidebar.module.scss'

type SidebarProfileButtonProps = {
  onNavigate: () => void
}

export const SidebarProfileButton = ({
  onNavigate,
}: SidebarProfileButtonProps) => {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()

  if (!isAuthenticated) return null

  return (
    <NavLink
      to="/profile"
      onClick={onNavigate}
      className={({ isActive }) =>
        `${styles.profileLink} ${isActive ? styles.active : ''}`
      }
      aria-label={t('profile.open')}
    >
      <ProfileIcon className={styles.icon} />
      <span className={styles.label}>{t('profile.open')}</span>
    </NavLink>
  )
}
