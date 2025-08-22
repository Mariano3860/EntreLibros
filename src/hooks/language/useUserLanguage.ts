import { useMutation } from '@tanstack/react-query'
import { getCookie, setCookie } from '@utils/cookies'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { updateLanguage } from '@src/api/language/language.service'

let languageInitialized = false

export const useUserLanguage = () => {
  const { i18n } = useTranslation()

  const mutation = useMutation({
    mutationFn: updateLanguage,
  })

  const changeLanguage = useCallback(
    (lng: string) => {
      if (i18n.language === lng) return
      i18n.changeLanguage(lng)
      setCookie('language', lng)
      mutation.mutate(lng)
    },
    [i18n, mutation]
  )

  useEffect(() => {
    if (languageInitialized) return
    languageInitialized = true

    const cookieLang = getCookie('language')
    const lang = cookieLang || i18n.language
    if (!cookieLang) {
      setCookie('language', lang)
    }
    mutation.mutate(lang)
  }, [i18n, mutation])

  return { language: i18n.language, changeLanguage }
}
