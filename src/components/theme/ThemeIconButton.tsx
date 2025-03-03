import { useTheme } from '@hooks/theme/useTheme'
import { ReactComponent as MoonIcon } from '@/assets/icons/moon.svg'
import styles from './ThemeIconButton.module.scss'

export const ThemeIconButton = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeButton}
      aria-label="Toggle theme"
    >
      <div className={styles.buttonContent}>
        <MoonIcon className={styles.icon} />
        <span className={styles.label}>
          {theme === 'dark' ? 'Dark mode' : 'Light mode'}
        </span>
      </div>
    </button>
  )
}
