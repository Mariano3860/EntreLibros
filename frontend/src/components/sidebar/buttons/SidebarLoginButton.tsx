import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { ReactComponent as LogoutIcon } from '@src/assets/icons/logout.svg'
import { AuthQueryKeys, HOME_URLS } from '@src/constants/constants'
import { useLogout } from '@src/hooks/api/useLogout'

import styles from '../Sidebar.module.scss'

export const SidebarLoginButton = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { mutate: logout } = useLogout()

  const authData = queryClient.getQueryData([AuthQueryKeys.AUTH])
  const isLoggedIn = Boolean(authData)

  return isLoggedIn ? (
    <button
      onClick={() => logout()}
      className={styles.logoutButton}
      aria-label="Logout"
    >
      <LogoutIcon className={styles.icon} />
      <span className={styles.label}>Logout</span>
    </button>
  ) : (
    <button
      onClick={() => navigate(`/${HOME_URLS.LOGIN}`)}
      className={styles.logoutButton}
      aria-label="Login"
    >
      <LogoutIcon className={styles.icon} />
      <span className={styles.label}>Login</span>
    </button>
  )
}
