import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ReactComponent as Globe } from '@/assets/icons/globe.svg'

import styles from '../Sidebar.module.scss'

export const SidebarLanguageSwitcher = () => {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = () => setOpen((prev) => !prev)
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={styles.languageButtonWrapper} ref={dropdownRef}>
      <button onClick={toggleDropdown} className={styles.languageButton}>
        <Globe className={styles.icon} />
        <span className={styles.label}>{t('language.label')}</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <button onClick={() => changeLanguage('es')}>
            {t('language.es')}
          </button>
          <button onClick={() => changeLanguage('en')}>
            {t('language.en')}
          </button>
        </div>
      )}
    </div>
  )
}
