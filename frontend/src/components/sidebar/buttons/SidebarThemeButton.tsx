import { useTheme } from '@hooks/theme/useTheme'
import { useTranslation } from 'react-i18next'

import { ReactComponent as MoonIcon } from '@src/assets/icons/moon.svg'

import styles from '../Sidebar.module.scss'

export const SidebarThemeButton = () => {
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()

  return (
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
  )
}
