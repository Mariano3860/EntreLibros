import { Link } from 'react-router-dom'
import { Logo } from '@/assets'
import { ThemeToggle } from '@components/theme/ThemeToggle'
import { LanguageSelector } from '@components/language-selector/LanguageSelector'
import styles from './Header.module.scss'

export const Header = () => {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logoLink}>
        <Logo className={styles.logo} />
      </Link>
      <div className={styles.controls}>
        <ThemeToggle />
        <LanguageSelector />
      </div>
    </header>
  )
}
