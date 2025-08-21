import { useMutation } from '@tanstack/react-query'
import { getCookie, setCookie } from '@utils/cookies'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { updateLanguage } from '@src/api/language/language.service'

export const useUserLanguage = () => {
  const { i18n } = useTranslation()

  const mutation = useMutation({
    mutationFn: updateLanguage,
  })

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setCookie('language', lng)
    mutation.mutate(lng)
  }

  useEffect(() => {
    const cookieLang = getCookie('language')
    const lang = cookieLang || i18n.language
    if (!cookieLang) {
      setCookie('language', lang)
    }
    mutation.mutate(lang)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { language: i18n.language, changeLanguage }
}
