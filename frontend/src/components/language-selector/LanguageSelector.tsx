import { useUserLanguage } from '@hooks/language/useUserLanguage'

import styles from './LanguageSelector.module.scss'

export const LanguageSelector = () => {
  const { language, changeLanguage } = useUserLanguage()

  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      className={styles.select}
    >
      <option value="en">EN</option>
      <option value="es">ES</option>
    </select>
  )
}
