import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Panel,
  ActionButton,
  PageFrame,
  SectionHeading,
} from '@src/components/ui/presentation/Presentation'
import { useContactForm } from '@src/hooks/api/useContactForm'
import { getHelpContent, type HelpFaq } from '@src/shared/content/help'
import { isApiMockMode } from '@src/utils/runtimeEnv'

import styles from './ContactPage.module.scss'

export const ContactPage = () => {
  const { t } = useTranslation()
  const { faqs, helpCategories } = getHelpContent(t)
  const mockMode = isApiMockMode()
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [openFaq, setOpenFaq] = useState<string | null>('publish')
  const [supportSent, setSupportSent] = useState(false)
  const filteredFaqs = useMemo(
    () =>
      faqs.filter((faq) =>
        `${faq.question} ${faq.answer}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [faqs, search]
  )

  if (!mockMode)
    return (
      <RealContactPage
        openFaq={openFaq}
        setOpenFaq={setOpenFaq}
        search={search}
        setSearch={setSearch}
        filteredFaqs={filteredFaqs}
      />
    )

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!message.trim()) return
    setSupportSent(true)
    setMessage('')
  }

  return (
    <BaseLayout id="contact-page">
      <PageFrame>
        <section className={styles.hero}>
          <div>
            <h1>{t('localizedUi.contact.hero')}</h1>
            <p>{t('localizedUi.contact.intro')}</p>
            <label>
              <b>⌕</b>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('localizedUi.contact.search')}
              />
              <kbd>⌘ K</kbd>
            </label>
          </div>
          <img src="/illustrations/help.svg" alt="" />
        </section>

        <section
          className={styles.categories}
          aria-label={t('localizedUi.contact.categories')}
        >
          {helpCategories.map((category) => (
            <button
              key={category.title}
              onClick={() => setSearch(category.title)}
            >
              <span>{category.icon}</span>
              <strong>{category.title}</strong>
              <small>{category.text}</small>
              <b>→</b>
            </button>
          ))}
        </section>

        <div className={styles.content}>
          <Panel className={styles.faq}>
            <SectionHeading
              title={t('localizedUi.contact.faq')}
              action={
                <button onClick={() => setSearch('')}>
                  {t('localizedUi.contact.viewAll')}
                </button>
              }
            />
            <div className={styles.faqList}>
              {filteredFaqs.length ? (
                filteredFaqs.map((faq) => (
                  <article key={faq.id}>
                    <button
                      aria-expanded={openFaq === faq.id}
                      onClick={() =>
                        setOpenFaq(openFaq === faq.id ? null : faq.id)
                      }
                    >
                      <strong>{faq.question}</strong>
                      <span>{openFaq === faq.id ? '−' : '+'}</span>
                    </button>
                    {openFaq === faq.id ? <p>{faq.answer}</p> : null}
                  </article>
                ))
              ) : (
                <div className={styles.noResults}>
                  {t('localizedUi.contact.noResults')}
                </div>
              )}
            </div>
          </Panel>

          <aside className={styles.support}>
            <Panel className={styles.chatCard}>
              <span className={styles.supportIcon}>◯</span>
              <h2>{t('localizedUi.contact.moreHelp')}</h2>
              <p>{t('localizedUi.contact.supportHours')}</p>
              <div className={styles.online}>
                <span>●</span>
                <strong>{t('localizedUi.contact.online')}</strong>
                <small>{t('localizedUi.contact.responseTime')}</small>
              </div>
              <ActionButton
                tone="primary"
                onClick={() =>
                  document.getElementById('support-message')?.focus()
                }
              >
                {t('localizedUi.contact.startChat')}
              </ActionButton>
            </Panel>
            <Panel className={styles.contactCard}>
              <SectionHeading title={t('localizedUi.contact.writeToUs')} />
              <form onSubmit={submit}>
                <label>
                  {t('localizedUi.contact.inquiry')}
                  <textarea
                    id="support-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={t('localizedUi.contact.inquiryPlaceholder')}
                  />
                </label>
                <ActionButton type="submit" disabled={!message.trim()}>
                  {t('localizedUi.contact.sendInquiry')}
                </ActionButton>
              </form>
              {supportSent ? (
                <p className={styles.sent} role="status">
                  ✓ {t('localizedUi.contact.received')}
                </p>
              ) : null}
              <a href="mailto:ayuda@entrelibros.com">
                ✉ ayuda@entrelibros.com
              </a>
            </Panel>
          </aside>
        </div>
      </PageFrame>
    </BaseLayout>
  )
}

const RealContactPage = ({
  openFaq,
  setOpenFaq,
  search,
  setSearch,
  filteredFaqs,
}: {
  openFaq: string | null
  setOpenFaq: (id: string | null) => void
  search: string
  setSearch: (value: string) => void
  filteredFaqs: ReadonlyArray<HelpFaq>
}) => {
  const { t } = useTranslation()
  const { helpCategories } = getHelpContent(t)
  const [message, setMessage] = useState('')
  const mutation = useContactForm(() => setMessage(''))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!message.trim() || mutation.isPending) return
    mutation.mutate({
      name: 'Usuario EntreLibros',
      email: 'usuario@entrelibros.com',
      message: message.trim(),
    })
  }
  return (
    <BaseLayout id="contact-page">
      <PageFrame>
        <section className={styles.hero}>
          <div>
            <h1>{t('localizedUi.contact.hero')}</h1>
            <p>{t('localizedUi.contact.intro')}</p>
            <label>
              <b>⌕</b>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('localizedUi.contact.search')}
              />
              <kbd>⌘ K</kbd>
            </label>
          </div>
          <img src="/illustrations/help.svg" alt="" />
        </section>

        <section
          className={styles.categories}
          aria-label={t('localizedUi.contact.categories')}
        >
          {helpCategories.map((category) => (
            <button
              key={category.title}
              onClick={() => setSearch(category.title)}
            >
              <span>{category.icon}</span>
              <strong>{category.title}</strong>
              <small>{category.text}</small>
              <b>→</b>
            </button>
          ))}
        </section>

        <div className={styles.content}>
          <Panel className={styles.faq}>
            <SectionHeading
              title={t('localizedUi.contact.faq')}
              action={
                <button onClick={() => setSearch('')}>
                  {t('localizedUi.contact.viewAll')}
                </button>
              }
            />
            <div className={styles.faqList}>
              {filteredFaqs.length ? (
                filteredFaqs.map((faq) => (
                  <article key={faq.id}>
                    <button
                      aria-expanded={openFaq === faq.id}
                      onClick={() =>
                        setOpenFaq(openFaq === faq.id ? null : faq.id)
                      }
                    >
                      <strong>{faq.question}</strong>
                      <span>{openFaq === faq.id ? '−' : '+'}</span>
                    </button>
                    {openFaq === faq.id ? <p>{faq.answer}</p> : null}
                  </article>
                ))
              ) : (
                <div className={styles.noResults}>
                  {t('localizedUi.contact.noResults')}
                </div>
              )}
            </div>
          </Panel>

          <aside className={styles.support}>
            <Panel className={styles.chatCard}>
              <span className={styles.supportIcon}>◯</span>
              <h2>{t('localizedUi.contact.moreHelp')}</h2>
              <p>{t('localizedUi.contact.supportHours')}</p>
              <div className={styles.online}>
                <span>●</span>
                <strong>{t('localizedUi.contact.online')}</strong>
                <small>{t('localizedUi.contact.responseTime')}</small>
              </div>
              <ActionButton
                tone="primary"
                onClick={() =>
                  document.getElementById('support-message')?.focus()
                }
              >
                {t('localizedUi.contact.startChat')}
              </ActionButton>
            </Panel>
            <Panel className={styles.contactCard}>
              <SectionHeading title={t('localizedUi.contact.writeToUs')} />
              <form onSubmit={submit}>
                <label>
                  {t('localizedUi.contact.inquiry')}
                  <textarea
                    id="support-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={t('localizedUi.contact.inquiryPlaceholder')}
                  />
                </label>
                <ActionButton
                  type="submit"
                  disabled={!message.trim() || mutation.isPending}
                >
                  {mutation.isPending
                    ? t('localizedUi.contact.sending')
                    : t('localizedUi.contact.sendInquiry')}
                </ActionButton>
              </form>
              {mutation.isSuccess ? (
                <p className={styles.sent} role="status">
                  ✓ {t('localizedUi.contact.received')}
                </p>
              ) : null}
              <a href="mailto:ayuda@entrelibros.com">
                ✉ ayuda@entrelibros.com
              </a>
            </Panel>
          </aside>
        </div>
      </PageFrame>
    </BaseLayout>
  )
}
