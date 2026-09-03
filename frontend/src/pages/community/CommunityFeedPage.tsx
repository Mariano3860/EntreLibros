import { fetchUserBooks } from '@api/books/userBooks.service'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { fetchActivityItems } from '@src/api/community/activity.service'
import { fetchCommunityFeed } from '@src/api/community/communityFeed.service'
import { fetchCommunityStats } from '@src/api/community/communityStats.service'
import { fetchNearbyCorners } from '@src/api/community/corners.service'
import {
  fetchCommunityDiscovery,
  followCommunityUser,
  unfollowCommunityUser,
} from '@src/api/community/discovery.service'
import type { CommunityDiscovery } from '@src/api/community/discovery.types'
import { fetchSuggestions } from '@src/api/community/suggestions.service'
import { CommunityStoryModal } from '@src/components/community/CommunityStoryModal'
import {
  buildCommunityMapPath,
  CornersMiniMap,
} from '@src/components/community/corners/CornersMiniMap'
import { FeedActions } from '@src/components/feed/FeedActions'
import type { FeedItem } from '@src/components/feed/FeedItem.types'
import { useAuth } from '@src/contexts/auth/AuthContext'
import { usePrototype } from '@src/features/prototype/PrototypeContext'
import {
  Avatar,
  FixtureState,
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

  const storyChips = catalog.stories.filter((story) => story.id !== 'mine')

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
              <button
                className={styles.createStory}
                type="button"
                onClick={() => setComposerOpen(true)}
              >
                <Avatar initials="+" accent="#42d7c7" size="large" />
                <span>Tu historia</span>
              </button>
              {storyChips.map((story) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => setSelectedStory(story.name)}
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
                    <FeedActions
                      initialCommentsCount={0}
                      initialLikes={0}
                      post={{ type: 'story', id: post.id }}
                    />
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
                    <FeedActions
                      initialCommentsCount={parseMockCount(post.comments)}
                      initialLikes={parseMockCount(post.likes)}
                      post={{ type: 'listing', id: post.id }}
                    />
                  </Panel>
                ))}
              </div>
            </FixtureState>
          </main>

          <aside className={styles.aside}>
            <Panel className={styles.sidePanel}>
              <CommunityCornersPanel
                navigate={navigate}
                corners={catalog.corners.slice(0, 2).map((corner) => ({
                  id: corner.id,
                  name: corner.name,
                  meta: `${corner.distance} · ${corner.activity}`,
                }))}
              />
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

type CommunityCornerListItem = {
  id: string
  name: string
  meta: string
}

const CommunityCornersPanel = ({
  corners,
  navigate,
}: {
  corners: CommunityCornerListItem[]
  navigate: ReturnType<typeof useNavigate>
}) => {
  const [selectedCornerId, setSelectedCornerId] = useState<string | null>(null)

  return (
    <>
      <SectionHeading
        title="Rincones cerca de vos"
        action={
          <button
            type="button"
            onClick={() => navigate(buildCommunityMapPath(selectedCornerId))}
          >
            Ver mapa →
          </button>
        }
      />
      <CornersMiniMap
        embedded
        selectedPinId={selectedCornerId}
        onSelectionChange={setSelectedCornerId}
      />
      <div className={styles.cornerList}>
        {corners.map((corner) => (
          <button
            type="button"
            key={corner.id}
            onClick={() => navigate(buildCommunityMapPath(corner.id))}
          >
            <span aria-hidden="true">⌖</span>
            <span>
              <strong>{corner.name}</strong>
              <small>{corner.meta}</small>
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

const RealCommunityPage = ({
  navigate,
}: {
  navigate: ReturnType<typeof useNavigate>
}) => {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()
  const { t } = useTranslation()
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
  const discovery = useQuery({
    queryKey: ['community', 'discovery'],
    queryFn: fetchCommunityDiscovery,
    enabled: !isAuthLoading && isAuthenticated,
    retry: false,
  })
  const followMutation = useMutation({
    mutationFn: ({
      userId,
      following,
    }: {
      userId: string
      following: boolean
    }) =>
      following ? unfollowCommunityUser(userId) : followCommunityUser(userId),
    onSuccess: (result) => {
      queryClient.setQueryData<CommunityDiscovery>(
        ['community', 'discovery'],
        (current) => {
          if (!current) return current
          return {
            ...current,
            stories: current.stories.map((story) =>
              story.id === result.userId
                ? { ...story, isFollowing: result.following }
                : story
            ),
            suggestions: current.suggestions.map((suggestion) =>
              suggestion.id === result.userId
                ? { ...suggestion, isFollowing: result.following }
                : suggestion
            ),
            recommendedBooks: current.recommendedBooks.map((book) =>
              book.owner.id === result.userId
                ? { ...book, isFollowing: result.following }
                : book
            ),
          }
        }
      )
    },
  })
  const books = useQuery({
    queryKey: ['userBooks'],
    queryFn: fetchUserBooks,
    enabled: composerOpen,
  })

  const realCorners = corners.data?.slice(0, 3) ?? []
  const realSuggestions =
    suggestions.data?.slice(0, 3).map((suggestion) => ({
      ...suggestion,
      isFollowing: false,
      reason: 'active_reader' as const,
      commonInterests: [],
    })) ?? []
  const displayedSuggestions = discovery.data
    ? discovery.data.suggestions.slice(0, 3)
    : realSuggestions
  const storyChips =
    discovery.data?.stories
      .filter((story) => String(user?.id) !== story.id)
      .map((story) => ({
        id: story.id,
        name: story.user,
        initials: story.user.slice(0, 2).toUpperCase(),
        imageUrl: story.avatar,
        accent: '#42d7c7',
      })) ?? []

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
              <button
                className={styles.createStory}
                type="button"
                onClick={() => setComposerOpen(true)}
              >
                <Avatar initials="+" accent="#42d7c7" size="large" />
                <span>
                  {t('community.discovery.yourStory', {
                    defaultValue: 'Tu historia',
                  })}
                </span>
              </button>
              {storyChips.map((story) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => setSelectedStory(story.name)}
                >
                  <Avatar
                    initials={story.initials}
                    imageUrl={story.imageUrl}
                    accent={story.accent}
                    size="large"
                  />
                  <span>{story.name}</span>
                </button>
              ))}
              {discovery.data && storyChips.length === 0 ? (
                <p className={styles.emptyStories}>
                  {t('community.discovery.emptyStories', {
                    defaultValue:
                      'Todavía no hay historias relevantes para vos.',
                  })}
                </p>
              ) : null}
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
            {discovery.data?.recommendedBooks.length ? (
              <Panel className={styles.recommendations}>
                <SectionHeading
                  title={t('community.discovery.booksTitle', {
                    defaultValue: 'Libros que podrían gustarte',
                  })}
                />
                <div className={styles.recommendationList}>
                  {discovery.data.recommendedBooks.map((book) => (
                    <Link
                      className={styles.recommendation}
                      key={book.id}
                      to={`/books/${book.id}`}
                    >
                      {book.cover ? (
                        <img src={book.cover} alt="" />
                      ) : (
                        <div
                          className={styles.recommendationCover}
                          aria-hidden="true"
                        />
                      )}
                      <div>
                        <strong>{book.title}</strong>
                        <small>
                          {book.author ||
                            t('community.discovery.unknownAuthor', {
                              defaultValue: 'Autor no informado',
                            })}
                        </small>
                        <small>
                          {t('community.discovery.bookFrom', {
                            defaultValue: 'De {{user}}',
                            user: book.owner.user,
                          })}
                        </small>
                      </div>
                    </Link>
                  ))}
                </div>
              </Panel>
            ) : null}
            {activity.data?.length ? (
              <div className={styles.storyNotice} role="status">
                {activity.data.length} movimientos recientes en tu comunidad
              </div>
            ) : null}
            <div className={styles.feed}>
              {feed.isLoading ? (
                <Panel className={styles.post} as="article">
                  Cargando la actividad de la comunidad...
                </Panel>
              ) : feed.isError ? (
                <Panel className={styles.post} as="article">
                  <p>No pudimos cargar la actividad de la comunidad.</p>
                  <PrototypeButton
                    size="small"
                    onClick={() => void feed.refetch()}
                  >
                    Reintentar
                  </PrototypeButton>
                </Panel>
              ) : feed.data?.length ? (
                feed.data?.map((item) => (
                  <RealFeedCard item={item} key={item.id} />
                ))
              ) : (
                <Panel className={styles.post} as="article">
                  No hay actividad para mostrar todavía.
                </Panel>
              )}
            </div>
          </main>
          <aside className={styles.aside}>
            <Panel className={styles.sidePanel}>
              <CommunityCornersPanel
                navigate={navigate}
                corners={realCorners.map((corner) => ({
                  id: corner.id,
                  name: corner.name,
                  meta: `${corner.distanceKm} km · ${corner.activityLabel ?? 'Sin actividad'}`,
                }))}
              />
            </Panel>
            <Panel className={styles.sidePanel}>
              <SectionHeading
                title={t('community.discovery.suggestionsTitle', {
                  defaultValue: 'Sugerencias para vos',
                })}
              />
              {displayedSuggestions.map((person) => (
                <article className={styles.suggestion} key={person.id}>
                  <Avatar
                    initials={person.user.slice(0, 2).toUpperCase()}
                    imageUrl={person.avatar}
                    accent="#ff8b4c"
                    size="small"
                  />
                  <div>
                    <strong>
                      <Link to={`/profile/${person.id}`}>{person.user}</Link>
                    </strong>
                    <small>
                      {person.reason === 'nearby'
                        ? t('community.discovery.nearby', {
                            defaultValue: 'Cerca de vos',
                          })
                        : person.reason === 'similar_interests'
                          ? t('community.discovery.similarInterests', {
                              defaultValue: 'Intereses en común',
                            })
                          : t('community.discovery.activeReader', {
                              defaultValue: 'Lector activo',
                            })}
                    </small>
                  </div>
                  <button
                    type="button"
                    disabled={!isAuthenticated || followMutation.isPending}
                    onClick={() =>
                      followMutation.mutate({
                        userId: person.id,
                        following: person.isFollowing,
                      })
                    }
                  >
                    {person.isFollowing
                      ? t('community.discovery.following', {
                          defaultValue: 'Siguiendo',
                        })
                      : t('community.discovery.follow', {
                          defaultValue: 'Seguir',
                        })}
                  </button>
                </article>
              ))}
              {discovery.data && displayedSuggestions.length === 0 ? (
                <p className={styles.emptyDiscovery}>
                  {t('community.discovery.emptySuggestions', {
                    defaultValue:
                      'Completá tus intereses o ubicación para encontrar lectores afines.',
                  })}
                </p>
              ) : null}
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
            void queryClient.invalidateQueries({
              queryKey: ['community', 'discovery'],
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
          imageUrl={item.avatar}
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
      <FeedActions
        initialCommentsCount={item.commentsCount ?? 0}
        initialLiked={item.likedByMe}
        initialLikes={item.likes}
        post={{
          type: item.type === 'story' ? 'story' : 'listing',
          id: item.id,
        }}
      />
    </Panel>
  )
}

const parseMockCount = (value: string): number => {
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : 0
}
