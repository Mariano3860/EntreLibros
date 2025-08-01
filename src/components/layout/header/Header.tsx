import { Link } from 'react-router-dom'
import { Logo } from '@/assets'
import { ThemeToggle } from '@components/theme/ThemeToggle'
import { LanguageSelector } from '@components/language-selector/LanguageSelector'
import styles from './Header.module.scss'
import { LogoEntreLibros } from '@components/logo/LogoEntreLibros'

export const Header = () => {
  return (
    <header className={styles.header}>
        <LogoEntreLibros withText />
      <div className={styles.controls}>
        <ThemeToggle />
        <LanguageSelector />
      </div>
    </header>
  )
}
