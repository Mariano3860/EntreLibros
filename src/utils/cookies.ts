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

export default clearAllCookies
