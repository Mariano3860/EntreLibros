import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { usePrototype } from '@src/features/prototype/PrototypeContext'
import {
  Avatar,
  FixtureState,
  MiniMap,
  Panel,
  PrototypeButton,
  PrototypePage,
  SectionHeading,
} from '@src/features/prototype/PrototypeUI'

import styles from './CommunityFeedPage.module.scss'

export const CommunityFeedPage = () => {
  const { catalog, socialPosts, publishStory } = usePrototype()
  const [composerOpen, setComposerOpen] = useState(false)
  const [storyText, setStoryText] = useState('')
  const [selectedStory, setSelectedStory] = useState<string | null>(null)
  const navigate = useNavigate()

  const submitStory = (event: FormEvent) => {
    event.preventDefault()
    if (!storyText.trim()) return
    publishStory(storyText.trim())
    setStoryText('')
    setComposerOpen(false)
  }

  return (
    <BaseLayout id="community-page">
      <PrototypePage>
        <header className={styles.header}>
          <div>
            <h1>Comunidad</h1>
            <p>Historias, recomendaciones y encuentros cerca tuyo.</p>
          </div>
          <PrototypeButton tone="primary" onClick={() => setComposerOpen(true)}>
            ＋ Publicar
          </PrototypeButton>
        </header>

        <div className={styles.layout}>
          <main className={styles.main}>
            <Panel className={styles.stories}>
              {catalog.stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() =>
                    story.id === 'mine'
                      ? setComposerOpen(true)
                      : setSelectedStory(story.name)
                  }
                >
                  <Avatar
                    initials={story.initials}
                    accent={story.accent}
                    size="large"
                  />
                  <span>{story.name}</span>
                </button>
              ))}
            </Panel>

            {selectedStory ? (
              <div className={styles.storyNotice} role="status">
                Historia de {selectedStory} abierta ·{' '}
                <button onClick={() => setSelectedStory(null)}>Cerrar</button>
              </div>
            ) : null}

            <Panel className={styles.composer}>
              <div className={styles.composerTop}>
                <Avatar initials="M" accent="#ff8b4c" />
                <button onClick={() => setComposerOpen(true)}>
                  ¿Qué estás leyendo, Mariano?
                </button>
              </div>
              <div className={styles.composerActions}>
                <button onClick={() => setComposerOpen(true)}>
                  ▧ Foto/Video
                </button>
                <button onClick={() => setComposerOpen(true)}>
                  ▤ Ofrecer libro
                </button>
                <button onClick={() => setComposerOpen(true)}>
                  ↔ Proponer intercambio
                </button>
                <button onClick={() => setComposerOpen(true)}>
                  ☷ Encuesta
                </button>
                <PrototypeButton
                  tone="primary"
                  size="small"
                  onClick={() => setComposerOpen(true)}
                >
                  Publicar
                </PrototypeButton>
              </div>
            </Panel>

            <FixtureState region="feed">
              <div className={styles.feed}>
                {socialPosts.map((post) => (
                  <Panel as="article" className={styles.post} key={post.id}>
                    <div className={styles.postHeader}>
                      <Avatar initials="M" accent="#ff8b4c" />
                      <div>
                        <strong>{post.author}</strong>
                        <small>{post.createdAt} · Buenos Aires</small>
                      </div>
                      <button aria-label="Más opciones">•••</button>
                    </div>
                    <p>{post.text}</p>
                    <div className={styles.postActions}>
                      <button>♡ Me gusta</button>
                      <button>◯ Comentar</button>
                      <button>↗ Compartir</button>
                    </div>
                  </Panel>
                ))}
                {catalog.communityPosts.map((post) => (
                  <Panel as="article" className={styles.post} key={post.id}>
                    <div className={styles.postHeader}>
                      <Avatar
                        initials={post.initials}
                        accent={post.accent}
                        online={post.online}
                      />
                      <div>
                        <strong>{post.author}</strong>
                        <small>{post.meta}</small>
                      </div>
                      <button aria-label="Más opciones">•••</button>
                    </div>
                    <p>{post.text}</p>
                    <img src={post.image} alt={post.imageAlt} />
                    <div className={styles.postStats}>
                      <span>{post.likes}</span>
                      <span>{post.comments}</span>
                    </div>
                    <div className={styles.postActions}>
                      <button>♡ Me gusta</button>
                      <button>◯ Comentar</button>
                      <button>↗ Compartir</button>
                    </div>
                  </Panel>
                ))}
              </div>
            </FixtureState>
          </main>

          <aside className={styles.aside}>
            <Panel className={styles.sidePanel}>
              <SectionHeading
                title="Rincones cerca de vos"
                action={
                  <button onClick={() => navigate('/map')}>Ver mapa →</button>
                }
              />
              <MiniMap />
              <div className={styles.cornerList}>
                {catalog.corners.slice(0, 2).map((corner) => (
                  <article key={corner.id}>
                    <span>⌖</span>
                    <div>
                      <strong>{corner.name}</strong>
                      <small>
                        {corner.distance} · {corner.activity}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
            <Panel className={styles.sidePanel}>
              <SectionHeading title="Sugerencias para vos" />
              {catalog.stats.contributors.slice(0, 3).map((person) => (
                <article className={styles.suggestion} key={person.name}>
                  <Avatar
                    initials={person.initials}
                    accent={person.accent}
                    size="small"
                  />
                  <div>
                    <strong>{person.name}</strong>
                    <small>Lecturas en común</small>
                  </div>
                  <button>Seguir</button>
                </article>
              ))}
            </Panel>
          </aside>
        </div>

        {composerOpen ? (
          <div className={styles.modalBackdrop}>
            <Panel className={styles.modal} as="div">
              <div className={styles.modalHeader}>
                <h2>Crear una historia</h2>
                <button
                  onClick={() => setComposerOpen(false)}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
              <form onSubmit={submitStory}>
                <label>
                  Contanos qué estás leyendo
                  <textarea
                    autoFocus
                    value={storyText}
                    onChange={(event) => setStoryText(event.target.value)}
                    placeholder="Compartí una idea, una recomendación o un encuentro…"
                  />
                </label>
                <div className={styles.attachments}>
                  <button type="button">▧ Agregar foto</button>
                  <button type="button">▤ Linkear libro</button>
                  <button type="button">↔ Intercambio</button>
                </div>
                <PrototypeButton
                  tone="primary"
                  type="submit"
                  disabled={!storyText.trim()}
                >
                  Publicar historia
                </PrototypeButton>
              </form>
            </Panel>
          </div>
        ) : null}
      </PrototypePage>
    </BaseLayout>
  )
}
