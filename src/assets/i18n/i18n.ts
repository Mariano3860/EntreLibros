import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslations from './locales/en/common.json'
import esTranslations from './locales/es/common.json'

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
  lng: 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
