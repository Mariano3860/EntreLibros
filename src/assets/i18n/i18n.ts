import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslations from './locales/en/common.json'
import esTranslations from './locales/es/common.json'

const storedLanguage =
  typeof window !== 'undefined' ? localStorage.getItem('language') : null

declare module 'react-i18next' {
  interface Resources {
    translation: typeof esTranslations
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    es: { translation: esTranslations },
  },
  lng: storedLanguage || 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng)
  }
})

export default i18n
