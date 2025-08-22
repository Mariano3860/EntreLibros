// Utilidad pensada solo para entornos de desarrollo. Al estar aislada detrás de
// condiciones de `import.meta.env.PROD`, los empaquetadores deberían excluirla
// del build de producción.
export const clearAllCookies = () => {
  if (typeof document === 'undefined') return

  const cookies = document.cookie ? document.cookie.split(';') : []
  cookies.forEach((cookie) => {
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim()
    if (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    }
  })
}

export const setCookie = (name: string, value: string, days = 365) => {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/`
}

export const getCookie = (name: string): string | undefined => {
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1]
  return value === undefined ? undefined : decodeURIComponent(value)
}

export default clearAllCookies
