import { LogoutConfirmModal } from '@components/auth/LogoutConfirmModal'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ReactComponent as LogoutIcon } from '@src/assets/icons/logout.svg'
import { AuthQueryKeys, HOME_URLS } from '@src/constants/constants'
import { useLogout } from '@src/hooks/api/useLogout'

import styles from '../Sidebar.module.scss'

export const SidebarLoginButton = () => {
  const { t } = useTranslation()
  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { mutate: logout, isPending } = useLogout()

  const authData = queryClient.getQueryData([AuthQueryKeys.AUTH])
  const isLoggedIn = Boolean(authData)

  return (
    <>
      {isLoggedIn ? (
        <button
          onClick={() => setConfirmOpen(true)}
          className={styles.logoutButton}
          aria-label={t('auth.logout.open', { defaultValue: 'Logout' })}
        >
          <LogoutIcon className={styles.icon} />
          <span className={styles.label}>
            {t('auth.logout.open', { defaultValue: 'Logout' })}
          </span>
        </button>
      ) : (
        <button
          onClick={() => navigate(`/${HOME_URLS.LOGIN}`)}
          className={styles.logoutButton}
          aria-label={t('auth.logout.login', { defaultValue: 'Login' })}
        >
          <LogoutIcon className={styles.icon} />
          <span className={styles.label}>
            {t('auth.logout.login', { defaultValue: 'Login' })}
          </span>
        </button>
      )}
      <LogoutConfirmModal
        open={isConfirmOpen}
        pending={isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          logout(undefined, { onSuccess: () => setConfirmOpen(false) })
        }
      />
    </>
  )
}
