import i18n from '@src/assets/i18n/i18n'

describe('i18n language persistence', () => {
  beforeEach(() => {
    document.cookie = 'language=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
  })

  test('saves selected language to cookies', async () => {
    await i18n.changeLanguage('en')
    expect(document.cookie).toContain('language=en')
  })
})
