import { LanguageSelector } from '@components/language-selector/LanguageSelector'
import { LogoEntreLibros } from '@components/logo/LogoEntreLibros'
import { ThemeToggle } from '@components/theme/ThemeToggle'

import styles from './Header.module.scss'

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
