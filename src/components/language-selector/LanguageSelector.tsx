import { useTranslation } from 'react-i18next'

import styles from './LanguageSelector.module.scss'

export const LanguageSelector = () => {
  const { i18n } = useTranslation()

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className={styles.select}
    >
      <option value="en">EN</option>
      <option value="es">ES</option>
    </select>
  )
}
