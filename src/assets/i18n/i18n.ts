import { getCookie, setCookie } from '@utils/cookies'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslations from './locales/en/common.json'
import esTranslations from './locales/es/common.json'

const storedLanguage =
  typeof window !== 'undefined' ? getCookie('language') : null

declare module 'react-i18next' {
  // TODO: verificar si es necesario declarar recursos adicionales
  type Resources = {
    translation: typeof esTranslations
  }
}

// Configuración de internacionalización
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
    setCookie('language', lng)
  }
})

export default i18n
