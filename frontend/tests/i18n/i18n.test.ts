import i18n from '@src/assets/i18n/i18n'
import en from '@src/assets/i18n/locales/en/common.json'
import es from '@src/assets/i18n/locales/es/common.json'

const flattenLeafKeys = (value: unknown, prefix = ''): string[] => {
  if (!value || typeof value !== 'object') return [prefix]

  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => flattenLeafKeys(child, prefix ? `${prefix}.${key}` : key)
  )
}

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

  test('keeps English and Spanish resource trees in sync', () => {
    expect(flattenLeafKeys(en).sort()).toEqual(flattenLeafKeys(es).sort())
  })

  test('provides English copy for audited shell, map, message and profile surfaces', () => {
    expect(en.localizedUi.navigation.profile).toBe('Profile')
    expect(en.map.controls.label).toBe('Map controls')
    expect(en.community.messages.ui.messagePlaceholder).toBe(
      'Write a message...'
    )
    expect(en.profile.dashboard.readingGoal).toBe('Reading goal')
  })

  test('does not fall back to Spanish for required English interface copy', () => {
    const translateEnglish = i18n.getFixedT('en')
    const auditedCopy = [
      {
        key: 'localizedUi.navigation.profile',
        english: 'Profile',
        spanish: 'Perfil',
      },
      {
        key: 'map.controls.label',
        english: 'Map controls',
        spanish: 'Controles del mapa',
      },
      {
        key: 'community.messages.ui.messagePlaceholder',
        english: 'Write a message...',
        spanish: 'Escribe un mensaje...',
      },
      {
        key: 'profile.dashboard.readingGoal',
        english: 'Reading goal',
        spanish: 'Objetivo de lectura',
      },
    ] as const

    auditedCopy.forEach(({ key, english, spanish }) => {
      expect(translateEnglish(key)).toBe(english)
      expect(translateEnglish(key)).not.toBe(spanish)
    })
  })
})
