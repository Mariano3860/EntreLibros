import type { TFunction } from 'i18next'

export type HelpFaq = { id: string; question: string; answer: string }

export const getHelpContent = (t: TFunction) => ({
  helpCategories: [
    {
      icon: '♙',
      title: t('localizedUi.help.account.title'),
      text: t('localizedUi.help.account.text'),
    },
    {
      icon: '▤',
      title: t('localizedUi.help.listings.title'),
      text: t('localizedUi.help.listings.text'),
    },
    {
      icon: '↔',
      title: t('localizedUi.help.trades.title'),
      text: t('localizedUi.help.trades.text'),
    },
    {
      icon: '✉',
      title: t('localizedUi.help.messages.title'),
      text: t('localizedUi.help.messages.text'),
    },
    {
      icon: '⌂',
      title: t('localizedUi.help.corners.title'),
      text: t('localizedUi.help.corners.text'),
    },
    {
      icon: '◇',
      title: t('localizedUi.help.safety.title'),
      text: t('localizedUi.help.safety.text'),
    },
  ],
  faqs: [
    {
      id: 'publish',
      question: t('localizedUi.help.faq.publish.question'),
      answer: t('localizedUi.help.faq.publish.answer'),
    },
    {
      id: 'trade',
      question: t('localizedUi.help.faq.trade.question'),
      answer: t('localizedUi.help.faq.trade.answer'),
    },
    {
      id: 'corner',
      question: t('localizedUi.help.faq.corner.question'),
      answer: t('localizedUi.help.faq.corner.answer'),
    },
    {
      id: 'safety',
      question: t('localizedUi.help.faq.safety.question'),
      answer: t('localizedUi.help.faq.safety.answer'),
    },
  ] as HelpFaq[],
})
