import { useUserLanguage } from '@hooks/language/useUserLanguage'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ReactComponent as Globe } from '@src/assets/icons/globe.svg'

import styles from '../Sidebar.module.scss'

export const SidebarLanguageSwitcher = () => {
  const { t } = useTranslation()
  const { changeLanguage } = useUserLanguage()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = () => setOpen((prev) => !prev)
  const handleChange = (lng: string) => {
    changeLanguage(lng)
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
          <button onClick={() => handleChange('es')}>{t('language.es')}</button>
          <button onClick={() => handleChange('en')}>{t('language.en')}</button>
        </div>
      )}
    </div>
  )
}
