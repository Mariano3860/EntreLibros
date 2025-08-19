import i18n from '@src/assets/i18n/i18n'

describe('i18n language persistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test('saves selected language to localStorage', async () => {
    await i18n.changeLanguage('en')
    expect(window.localStorage.getItem('language')).toBe('en')
  })
})
