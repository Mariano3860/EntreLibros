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
import { PersonSearchModal } from '@src/components/people/PersonSearchModal/PersonSearchModal'
import {
  Avatar,
  FixtureState,
  Panel,
  ActionButton,
  PageFrame,
  SectionHeading,
} from '@src/components/ui/presentation/Presentation'
import { useAuth } from '@src/contexts/auth/AuthContext'
import { useAuthRequired } from '@src/contexts/auth/AuthRequiredContext'
import { useMockExperience } from '@src/contexts/mock/MockExperienceContext'
import { localizeLegacyRelativeTime } from '@src/shared/view-models/adapters'
import { isApiMockMode } from '@src/utils/runtimeEnv'

import styles from './CommunityFeedPage.module.scss'

const localizeCornerActivity = (
  value: string | null | undefined,
  t: ReturnType<typeof useTranslation>['t']
) => {
  const weeklyExchanges = /^(\d+) intercambios esta semana$/.exec(value ?? '')
  if (weeklyExchanges) {
    return t('community.ui.weeklyExchanges', {
      count: Number(weeklyExchanges[1]),
    })
  }
  return value ?? t('community.ui.noActivity')
}

export const CommunityFeedPage = () => {
  const { fixtures, socialPosts, publishStory } = useMockExperience()
  const { t } = useTranslation()
  const { runIfAuthenticated } = useAuthRequired()
  const mockMode = isApiMockMode()
  const [composerOpen, setComposerOpen] = useState(false)
  const [isPersonSearchOpen, setIsPersonSearchOpen] = useState(false)
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

  const storyChips = fixtures.stories.filter((story) => story.id !== 'mine')

  return (
    <BaseLayout id="community-page">
      <PageFrame>
        <header className={styles.header}>
          <div>
            <h1>{t('community.ui.title')}</h1>
            <p>{t('community.ui.subtitle')}</p>
          </div>
          <div className={styles.headerActions}>
            <ActionButton onClick={() => setIsPersonSearchOpen(true)}>
              {t('booksPage.personSearch.open')}
            </ActionButton>
            <ActionButton
              tone="primary"
              onClick={() => runIfAuthenticated(() => setComposerOpen(true))}
            >
              ＋ {t('community.ui.publish')}
            </ActionButton>
          </div>
        </header>

        <div className={styles.layout}>
          <main className={styles.main}>
            <Panel className={styles.stories}>
              <button
                className={styles.createStory}
                type="button"
                onClick={() => runIfAuthenticated(() => setComposerOpen(true))}
              >
                <Avatar initials="+" accent="#42d7c7" size="large" />
                <span>{t('community.ui.myStory')}</span>
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
                {t('community.ui.storyOpen', { name: selectedStory })} ·{' '}
                <button onClick={() => setSelectedStory(null)}>
                  {t('community.ui.close')}
                </button>
              </div>
            ) : null}

            <Panel className={styles.composer}>
              <div className={styles.composerTop}>
                <Avatar initials="M" accent="#ff8b4c" />
                <button
                  onClick={() =>
                    runIfAuthenticated(() => setComposerOpen(true))
                  }
                >
                  {t('community.ui.readingPrompt', { name: 'Mariano' })}
                </button>
              </div>
              <div className={styles.composerActions}>
                <button
                  onClick={() =>
                    runIfAuthenticated(() => setComposerOpen(true))
                  }
                >
                  ▧ {t('community.ui.photoVideo')}
                </button>
                <button
                  onClick={() =>
                    runIfAuthenticated(() => setComposerOpen(true))
                  }
                >
                  ▤ {t('community.ui.offerBook')}
                </button>
                <button
                  onClick={() =>
                    runIfAuthenticated(() => setComposerOpen(true))
                  }
                >
                  ↔ {t('community.ui.proposeTrade')}
                </button>
                <button
                  onClick={() =>
                    runIfAuthenticated(() => setComposerOpen(true))
                  }
                >
                  ☷ {t('community.ui.poll')}
                </button>
                <ActionButton
                  tone="primary"
                  size="small"
                  onClick={() =>
                    runIfAuthenticated(() => setComposerOpen(true))
                  }
                >
                  {t('community.ui.publish')}
                </ActionButton>
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
                      <button aria-label={t('community.ui.moreOptions')}>
                        •••
                      </button>
                    </div>
                    <p>{post.text}</p>
                    <FeedActions
                      initialCommentsCount={0}
                      initialLikes={0}
                      post={{ type: 'story', id: post.id }}
                    />
                  </Panel>
                ))}
                {fixtures.communityPosts.map((post) => (
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
                      <button aria-label={t('community.ui.moreOptions')}>
                        •••
                      </button>
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
                corners={fixtures.corners.slice(0, 2).map((corner) => ({
                  id: corner.id,
                  name: corner.name,
                  meta: `${corner.distance} · ${localizeCornerActivity(corner.activity, t)}`,
                }))}
              />
            </Panel>
            <Panel className={styles.sidePanel}>
              <SectionHeading title={t('community.ui.suggestions')} />
              {fixtures.stats.contributors.slice(0, 3).map((person) => (
                <article className={styles.suggestion} key={person.name}>
                  <Avatar
                    initials={person.initials}
                    accent={person.accent}
                    size="small"
                  />
                  <div>
                    <strong>{person.name}</strong>
                    <small>{t('community.ui.commonReads')}</small>
                  </div>
                  <button>{t('community.ui.follow')}</button>
                </article>
              ))}
            </Panel>
          </aside>
        </div>

        {composerOpen ? (
          <div className={styles.modalBackdrop}>
            <Panel className={styles.modal} as="div">
              <div className={styles.modalHeader}>
                <h2>{t('community.ui.createStory')}</h2>
                <button
                  onClick={() => setComposerOpen(false)}
                  aria-label={t('community.ui.close')}
                >
                  ×
                </button>
              </div>
              <form onSubmit={submitStory}>
                <label>
                  {t('community.ui.sharePrompt')}
                  <textarea
                    autoFocus
                    value={storyText}
                    onChange={(event) => setStoryText(event.target.value)}
                    placeholder={t('community.ui.sharePlaceholder')}
                  />
                </label>
                <div className={styles.attachments}>
                  <button type="button">▧ {t('community.ui.addPhoto')}</button>
                  <button type="button">▤ {t('community.ui.linkBook')}</button>
                  <button type="button">↔ {t('community.ui.trade')}</button>
                </div>
                <ActionButton
                  tone="primary"
                  type="submit"
                  disabled={!storyText.trim()}
                >
                  {t('community.ui.publishStory')}
                </ActionButton>
              </form>
            </Panel>
          </div>
        ) : null}
        <PersonSearchModal
          isOpen={isPersonSearchOpen}
          onClose={() => setIsPersonSearchOpen(false)}
        />
      </PageFrame>
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
  const { t } = useTranslation()

  return (
    <>
      <SectionHeading
        title={t('community.ui.nearbyCorners')}
        action={
          <button
            type="button"
            onClick={() => navigate(buildCommunityMapPath(selectedCornerId))}
          >
            {t('community.ui.viewMap')} →
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
  const { runIfAuthenticated } = useAuthRequired()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [composerOpen, setComposerOpen] = useState(false)
  const [isPersonSearchOpen, setIsPersonSearchOpen] = useState(false)
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
    enabled: composerOpen && isAuthenticated,
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
      <PageFrame>
        <header className={styles.header}>
          <div>
            <h1>{t('community.ui.title')}</h1>
            <p>{t('community.ui.subtitle')}</p>
          </div>
          <div className={styles.headerActions}>
            <ActionButton onClick={() => setIsPersonSearchOpen(true)}>
              {t('booksPage.personSearch.open')}
            </ActionButton>
            <ActionButton
              tone="primary"
              onClick={() => runIfAuthenticated(() => setComposerOpen(true))}
            >
              ＋ {t('community.ui.publish')}
            </ActionButton>
          </div>
        </header>
        <div className={styles.layout}>
          <main className={styles.main}>
            <Panel className={styles.stories}>
              <button
                className={styles.createStory}
                type="button"
                onClick={() => runIfAuthenticated(() => setComposerOpen(true))}
              >
                <Avatar initials="+" accent="#42d7c7" size="large" />
                <span>{t('community.ui.myStory')}</span>
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
                {t('community.ui.storyOpen', { name: selectedStory })} ·{' '}
                <button onClick={() => setSelectedStory(null)}>
                  {t('community.ui.close')}
                </button>
              </div>
            ) : null}
            <Panel className={styles.composer}>
              <div className={styles.composerTop}>
                <Avatar initials="M" accent="#ff8b4c" />
                <button
                  onClick={() =>
                    runIfAuthenticated(() => setComposerOpen(true))
                  }
                >
                  {t('community.ui.readingPrompt', {
                    name: user?.name ?? 'Mariano',
                  })}
                </button>
              </div>
              <div className={styles.composerActions}>
                <button
                  onClick={() =>
                    runIfAuthenticated(() => setComposerOpen(true))
                  }
                >
                  ▧ {t('community.ui.photoVideo')}
                </button>
                <button
                  onClick={() =>
                    runIfAuthenticated(() => setComposerOpen(true))
                  }
                >
                  ▤ {t('community.ui.offerBook')}
                </button>
                <button
                  onClick={() =>
                    runIfAuthenticated(() => setComposerOpen(true))
                  }
                >
                  ↔ {t('community.ui.proposeTrade')}
                </button>
                <button
                  onClick={() =>
                    runIfAuthenticated(() => setComposerOpen(true))
                  }
                >
                  ☷ {t('community.ui.poll')}
                </button>
                <ActionButton
                  tone="primary"
                  size="small"
                  onClick={() =>
                    runIfAuthenticated(() => setComposerOpen(true))
                  }
                >
                  {t('community.ui.publish')}
                </ActionButton>
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
                {t('community.ui.activityCount', {
                  count: activity.data.length,
                })}
              </div>
            ) : null}
            <div className={styles.feed}>
              {feed.isLoading ? (
                <Panel className={styles.post} as="article">
                  {t('community.ui.loadingActivity')}
                </Panel>
              ) : feed.isError ? (
                <Panel className={styles.post} as="article">
                  <p>{t('community.ui.activityError')}</p>
                  <ActionButton
                    size="small"
                    onClick={() => void feed.refetch()}
                  >
                    {t('localizedUi.common.retry')}
                  </ActionButton>
                </Panel>
              ) : feed.data?.length ? (
                feed.data?.map((item) => (
                  <RealFeedCard item={item} key={item.id} />
                ))
              ) : (
                <Panel className={styles.post} as="article">
                  {t('community.ui.emptyActivity')}
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
                  meta: `${corner.distanceKm} km · ${localizeCornerActivity(corner.activityLabel, t)}`,
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
                    disabled={followMutation.isPending}
                    onClick={() =>
                      runIfAuthenticated(() =>
                        followMutation.mutate({
                          userId: person.id,
                          following: person.isFollowing,
                        })
                      )
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
                <SectionHeading title={t('community.ui.summary')} />
                <p>
                  {stats.data.kpis.activeUsers}{' '}
                  {t('community.ui.activeReaders')} ·{' '}
                  {stats.data.kpis.booksPublished}{' '}
                  {t('community.ui.publishedBooks')}
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
        <PersonSearchModal
          isOpen={isPersonSearchOpen}
          onClose={() => setIsPersonSearchOpen(false)}
        />
      </PageFrame>
    </BaseLayout>
  )
}

const feedItemLabel = (
  item: import('@components/feed/FeedItem.types').FeedItem,
  t: ReturnType<typeof useTranslation>['t']
) => {
  if ('title' in item) return item.title
  if ('book' in item && typeof item.book === 'string')
    return t('community.ui.reviewed', { book: item.book })
  if ('quote' in item) return item.quote
  if ('name' in item) return item.name
  return t('community.ui.newActivity')
}

const RealFeedCard = ({ item }: { item: FeedItem }) => {
  const { t } = useTranslation()
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
          <small>{localizeLegacyRelativeTime(item.time)}</small>
        </div>
        <button aria-label={t('community.ui.moreOptions')}>•••</button>
      </div>
      {item.corner ? <small>⌖ {item.corner.name}</small> : null}
      {image ? <img src={image} alt="" /> : null}
      {item.type !== 'story' ? <p>{feedItemLabel(item, t)}</p> : null}
      {item.type === 'story' ? <p>{item.body}</p> : null}
      {item.type === 'book' ? <small>{item.author}</small> : null}
      {item.type === 'sale' ? (
        <small>
          ${item.price} · {item.condition}
        </small>
      ) : null}
      {item.type === 'seeking' ? (
        <small>{t('community.ui.seekingBook')}</small>
      ) : null}
      {item.type === 'house' ? (
        <small>{t('community.ui.distance', { count: item.distance })}</small>
      ) : null}
      {item.type === 'person' ? (
        <small>{t('community.ui.compatibility', { count: item.match })}</small>
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
