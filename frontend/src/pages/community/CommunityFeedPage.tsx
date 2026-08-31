import { fetchUserBooks } from '@api/books/userBooks.service'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { fetchActivityItems } from '@src/api/community/activity.service'
import { fetchCommunityFeed } from '@src/api/community/communityFeed.service'
import { fetchCommunityStats } from '@src/api/community/communityStats.service'
import { fetchNearbyCorners } from '@src/api/community/corners.service'
import { fetchSuggestions } from '@src/api/community/suggestions.service'
import { CommunityStoryModal } from '@src/components/community/CommunityStoryModal'
import type { FeedItem } from '@src/components/feed/FeedItem.types'
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
import { isApiMockMode } from '@src/utils/runtimeEnv'

import styles from './CommunityFeedPage.module.scss'

export const CommunityFeedPage = () => {
  const { catalog, socialPosts, publishStory } = usePrototype()
  const mockMode = isApiMockMode()
  const [composerOpen, setComposerOpen] = useState(false)
  const [storyText, setStoryText] = useState('')
  const [selectedStory, setSelectedStory] = useState<string | null>(null)
  const navigate = useNavigate()

  if (!mockMode) return <RealCommunityPage navigate={navigate} />

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

const RealCommunityPage = ({
  navigate,
}: {
  navigate: ReturnType<typeof useNavigate>
}) => {
  const { catalog } = usePrototype()
  const queryClient = useQueryClient()
  const [composerOpen, setComposerOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<string | null>(null)
  const feed = useQuery({
    queryKey: ['community', 'feed'],
    queryFn: () => fetchCommunityFeed(),
  })
  const corners = useQuery({
    queryKey: ['community', 'corners', 'nearby'],
    queryFn: fetchNearbyCorners,
  })
  const stats = useQuery({
    queryKey: ['community', 'stats'],
    queryFn: fetchCommunityStats,
  })
  const activity = useQuery({
    queryKey: ['community', 'activity'],
    queryFn: fetchActivityItems,
  })
  const suggestions = useQuery({
    queryKey: ['community', 'suggestions'],
    queryFn: fetchSuggestions,
  })
  const books = useQuery({
    queryKey: ['userBooks'],
    queryFn: fetchUserBooks,
    enabled: composerOpen,
  })

  const realCorners = corners.data?.length
    ? corners.data.slice(0, 3)
    : catalog.corners.slice(0, 3).map((corner) => ({
        id: corner.id,
        name: corner.name,
        imageUrl: '',
        distanceKm: Number.parseFloat(corner.distance),
        activityLabel: corner.activity,
      }))
  const realSuggestions = suggestions.data?.length
    ? suggestions.data.slice(0, 3)
    : catalog.stats.contributors.slice(0, 3).map((person, index) => ({
        id: `prototype-suggestion-${index}`,
        user: person.name,
        avatar: '',
      }))
  const hasApiFeed = Boolean(feed.data?.length)

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
            {activity.data?.length ? (
              <div className={styles.storyNotice} role="status">
                {activity.data.length} movimientos recientes en tu comunidad
              </div>
            ) : null}
            <div className={styles.feed}>
              {feed.isError ? (
                <Panel className={styles.post} as="article">
                  No pudimos cargar la actividad de la comunidad.
                </Panel>
              ) : hasApiFeed ? (
                feed.data?.map((item) => (
                  <RealFeedCard item={item} key={item.id} />
                ))
              ) : !feed.isLoading ? (
                <Panel className={styles.post} as="article">
                  {catalog.communityPosts.map((post) => (
                    <div key={post.id}>
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
                      </div>
                      <p>{post.text}</p>
                      <img src={post.image} alt={post.imageAlt} />
                      <div className={styles.postActions}>
                        <button>♡ Me gusta</button>
                        <button>◯ Comentar</button>
                        <button>↗ Compartir</button>
                      </div>
                    </div>
                  ))}
                  {!catalog.communityPosts.length
                    ? 'Todavía no hay actividad para mostrar.'
                    : null}
                </Panel>
              ) : null}
            </div>
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
                {realCorners.map((corner) => (
                  <article key={corner.id}>
                    <span>⌖</span>
                    <div>
                      <strong>{corner.name}</strong>
                      <small>
                        {corner.distanceKm} km ·{' '}
                        {corner.activityLabel ?? 'Sin actividad'}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
            <Panel className={styles.sidePanel}>
              <SectionHeading title="Sugerencias para vos" />
              {realSuggestions.map((person) => (
                <article className={styles.suggestion} key={person.id}>
                  <Avatar
                    initials={person.user.slice(0, 2).toUpperCase()}
                    accent="#ff8b4c"
                    size="small"
                  />
                  <div>
                    <strong>{person.user}</strong>
                    <small>Lecturas en común</small>
                  </div>
                  <button>Seguir</button>
                </article>
              ))}
            </Panel>
            {stats.data ? (
              <Panel className={styles.sidePanel}>
                <SectionHeading title="Resumen" />
                <p>
                  {stats.data.kpis.activeUsers} lectores activos ·{' '}
                  {stats.data.kpis.booksPublished} libros publicados
                </p>
              </Panel>
            ) : null}
          </aside>
        </div>
        <CommunityStoryModal
          isOpen={composerOpen}
          books={books.data ?? []}
          onClose={() => setComposerOpen(false)}
          onPublished={() => {
            setComposerOpen(false)
            void queryClient.invalidateQueries({
              queryKey: ['community', 'feed'],
            })
          }}
        />
      </PrototypePage>
    </BaseLayout>
  )
}

const feedItemLabel = (
  item: import('@components/feed/FeedItem.types').FeedItem
) => {
  if ('title' in item) return item.title
  if ('book' in item && typeof item.book === 'string')
    return `Reseñó ${item.book}`
  if ('quote' in item) return item.quote
  if ('name' in item) return item.name
  return 'Nueva actividad de la comunidad'
}

const RealFeedCard = ({ item }: { item: FeedItem }) => {
  const image =
    'cover' in item
      ? item.cover
      : item.type === 'story'
        ? item.image
        : undefined

  return (
    <Panel as="article" className={styles.post}>
      <div className={styles.postHeader}>
        <Avatar
          initials={item.user.slice(0, 2).toUpperCase()}
          accent="#42d7c7"
        />
        <div>
          <strong>{item.user}</strong>
          <small>{item.time}</small>
        </div>
        <button aria-label="Más opciones">•••</button>
      </div>
      {item.corner ? <small>⌖ {item.corner.name}</small> : null}
      {image ? <img src={image} alt="" /> : null}
      {item.type !== 'story' ? <p>{feedItemLabel(item)}</p> : null}
      {item.type === 'story' ? <p>{item.body}</p> : null}
      {item.type === 'book' ? <small>{item.author}</small> : null}
      {item.type === 'sale' ? (
        <small>
          ${item.price} · {item.condition}
        </small>
      ) : null}
      {item.type === 'seeking' ? <small>Buscando este libro</small> : null}
      {item.type === 'house' ? (
        <small>{item.distance} km de distancia</small>
      ) : null}
      {item.type === 'person' ? (
        <small>{item.match}% de compatibilidad</small>
      ) : null}
      {item.type === 'review' ? <p>“{item.quote}”</p> : null}
      {item.type === 'event' ? (
        <small>
          {item.date} · {item.location}
        </small>
      ) : null}
      {item.type === 'swap' ? (
        <small>
          {item.offered.title} ↔ {item.requested.title}
        </small>
      ) : null}
      <div className={styles.postStats}>
        <span>{item.likes} Me gusta</span>
      </div>
      <div className={styles.postActions}>
        <button>♡ Me gusta</button>
        <button>◯ Comentar</button>
        <button>↗ Compartir</button>
      </div>
    </Panel>
  )
}
