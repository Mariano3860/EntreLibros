import { useEffect, useState } from 'react'

export const useThemeDetector = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false)

  useEffect(() => {
    const getCurrentTheme = () =>
      document.documentElement.getAttribute('data-theme') === 'dark'

    setIsDarkTheme(getCurrentTheme())

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setIsDarkTheme(getCurrentTheme())
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observer.disconnect()
  }, [])

  return isDarkTheme ? 'dark' : 'light'
}
