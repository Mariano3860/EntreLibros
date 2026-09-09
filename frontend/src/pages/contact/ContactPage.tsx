import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { FormEvent, useMemo, useState } from 'react'

import {
  Panel,
  ActionButton,
  PageFrame,
  SectionHeading,
} from '@src/components/ui/presentation/Presentation'
import { useContactForm } from '@src/hooks/api/useContactForm'
import { faqs, helpCategories } from '@src/shared/content/help'
import { isApiMockMode } from '@src/utils/runtimeEnv'

import styles from './ContactPage.module.scss'

export const ContactPage = () => {
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
    [search]
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
            <h1>¿Cómo podemos ayudarte?</h1>
            <p>
              Encontrá respuestas rápidas o escribinos. Tu próxima lectura no
              tiene que esperar.
            </p>
            <label>
              <b>⌕</b>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar en el centro de ayuda"
              />
              <kbd>⌘ K</kbd>
            </label>
          </div>
          <img src="/illustrations/help.svg" alt="" />
        </section>

        <section className={styles.categories} aria-label="Categorías de ayuda">
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
              title="Preguntas frecuentes"
              action={<button onClick={() => setSearch('')}>Ver todas</button>}
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
                  No encontramos resultados. Probá con otras palabras o
                  escribinos.
                </div>
              )}
            </div>
          </Panel>

          <aside className={styles.support}>
            <Panel className={styles.chatCard}>
              <span className={styles.supportIcon}>◯</span>
              <h2>¿Necesitás más ayuda?</h2>
              <p>Nuestro equipo responde de lunes a viernes, de 9 a 18 h.</p>
              <div className={styles.online}>
                <span>●</span>
                <strong>Estamos en línea</strong>
                <small>Respuesta en ~5 min</small>
              </div>
              <ActionButton
                tone="primary"
                onClick={() =>
                  document.getElementById('support-message')?.focus()
                }
              >
                Iniciar chat
              </ActionButton>
            </Panel>
            <Panel className={styles.contactCard}>
              <SectionHeading title="Escribinos" />
              <form onSubmit={submit}>
                <label>
                  Tu consulta
                  <textarea
                    id="support-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Contanos qué pasó…"
                  />
                </label>
                <ActionButton type="submit" disabled={!message.trim()}>
                  Enviar consulta
                </ActionButton>
              </form>
              {supportSent ? (
                <p className={styles.sent} role="status">
                  ✓ Recibimos tu consulta
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
  filteredFaqs: ReadonlyArray<(typeof faqs)[number]>
}) => {
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
            <h1>¿Cómo podemos ayudarte?</h1>
            <p>
              Encontrá respuestas rápidas o escribinos. Tu próxima lectura no
              tiene que esperar.
            </p>
            <label>
              <b>⌕</b>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar en el centro de ayuda"
              />
              <kbd>⌘ K</kbd>
            </label>
          </div>
          <img src="/illustrations/help.svg" alt="" />
        </section>

        <section className={styles.categories} aria-label="Categorías de ayuda">
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
              title="Preguntas frecuentes"
              action={<button onClick={() => setSearch('')}>Ver todas</button>}
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
                  No encontramos resultados. Probá con otras palabras o
                  escribinos.
                </div>
              )}
            </div>
          </Panel>

          <aside className={styles.support}>
            <Panel className={styles.chatCard}>
              <span className={styles.supportIcon}>◯</span>
              <h2>¿Necesitás más ayuda?</h2>
              <p>Nuestro equipo responde de lunes a viernes, de 9 a 18 h.</p>
              <div className={styles.online}>
                <span>●</span>
                <strong>Estamos en línea</strong>
                <small>Respuesta en ~5 min</small>
              </div>
              <ActionButton
                tone="primary"
                onClick={() =>
                  document.getElementById('support-message')?.focus()
                }
              >
                Iniciar chat
              </ActionButton>
            </Panel>
            <Panel className={styles.contactCard}>
              <SectionHeading title="Escribinos" />
              <form onSubmit={submit}>
                <label>
                  Tu consulta
                  <textarea
                    id="support-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Contanos qué pasó…"
                  />
                </label>
                <ActionButton
                  type="submit"
                  disabled={!message.trim() || mutation.isPending}
                >
                  {mutation.isPending ? 'Enviando…' : 'Enviar consulta'}
                </ActionButton>
              </form>
              {mutation.isSuccess ? (
                <p className={styles.sent} role="status">
                  ✓ Recibimos tu consulta
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
