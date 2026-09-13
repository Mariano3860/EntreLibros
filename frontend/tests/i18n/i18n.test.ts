import i18n from '@src/assets/i18n/i18n'
import en from '@src/assets/i18n/locales/en/common.json'
import es from '@src/assets/i18n/locales/es/common.json'

describe('i18n language persistence', () => {
  beforeEach(() => {
    document.cookie = 'language=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
  })

  test('saves selected language to cookies', async () => {
    await i18n.changeLanguage('en')
    expect(document.cookie).toContain('language=en')
  })

  test('uses the approved interest language in both supported locales', () => {
    expect(es.booksPage.tabs.seeking).toBe('Me interesa')
    expect(es.booksPage.want.subtitle).toContain('comunidad')
    expect(es.booksPage.empty.seeking).not.toMatch(/buscando/i)
    expect(en.booksPage.tabs.seeking).toBe("I'm interested")
    expect(en.booksPage.want.subtitle).toContain('community')
    expect(en.booksPage.empty.seeking).not.toMatch(/seeking/i)
  })
})
