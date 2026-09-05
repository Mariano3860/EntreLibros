import { fetchPeople, setPersonFollowing } from '@api/user/personSearch.service'
import type { PersonSearchResult } from '@api/user/personSearch.types'
import { PublishModal } from '@components/publish/shared'
import { useFocusTrap } from '@hooks/useFocusTrap'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useAuthRequired } from '@src/contexts/auth/AuthRequiredContext'
import { Avatar, PrototypeButton } from '@src/features/prototype/PrototypeUI'

import styles from './PersonSearchModal.module.scss'

const RECENT_SEARCHES_KEY = 'entrelibros.person-search.recent'
const MAX_RECENT_SEARCHES = 5
const DEBOUNCE_MS = 250

const canSearch = (value: string) => {
  const term = value.trim()
  return term.length >= 2 || /^\d+$/.test(term) || term.includes('@')
}

const initialsFor = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()

const readRecentSearches = (): string[] => {
  try {
    const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (term): term is string =>
          typeof term === 'string' &&
          term.trim().length > 0 &&
          !term.includes('@')
      )
      .slice(0, MAX_RECENT_SEARCHES)
  } catch {
    return []
  }
}

const saveRecentSearches = (searches: string[]) => {
  try {
    window.localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES))
    )
  } catch {
    // Local search history is optional and must not block the modal.
  }
}

export const PersonSearchModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { runIfAuthenticated } = useAuthRequired()
  const modalRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [followErrorId, setFollowErrorId] = useState<number | null>(null)

  useFocusTrap({
    containerRef: modalRef,
    active: isOpen,
    onEscape: onClose,
  })

  useEffect(() => {
    if (isOpen) searchInputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setSearch('')
      setDebouncedSearch('')
      setFollowErrorId(null)
      return
    }
    setRecentSearches(readRecentSearches())
  }, [isOpen])

  const normalizedSearch = search.trim()
  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(normalizedSearch),
      DEBOUNCE_MS
    )
    return () => window.clearTimeout(timeout)
  }, [normalizedSearch])

  const peopleQuery = useQuery({
    queryKey: ['user', 'person-search', debouncedSearch],
    queryFn: () => fetchPeople(debouncedSearch),
    enabled: isOpen && canSearch(debouncedSearch),
    retry: false,
  })

  const followMutation = useMutation({
    mutationFn: (person: PersonSearchResult) =>
      setPersonFollowing(person.id, !person.isFollowing),
    onMutate: (person) => {
      setFollowErrorId(null)
      return person
    },
    onSuccess: (response, person) => {
      queryClient.setQueryData<PersonSearchResult[]>(
        ['user', 'person-search', debouncedSearch],
        (current) =>
          current?.map((item) =>
            item.id === person.id
              ? { ...item, isFollowing: response.following }
              : item
          )
      )
    },
    onError: (_error, person) => setFollowErrorId(person.id),
  })

  const isDebouncing = normalizedSearch !== debouncedSearch
  const showSearchState = Boolean(normalizedSearch)
  const searchIsReady = canSearch(normalizedSearch) && !isDebouncing
  const displayedPeople = searchIsReady ? (peopleQuery.data ?? []) : []
  const isSearching =
    isDebouncing ||
    (searchIsReady && peopleQuery.isPending && !peopleQuery.data)

  useEffect(() => {
    if (
      !isOpen ||
      !searchIsReady ||
      !peopleQuery.isSuccess ||
      peopleQuery.isError
    ) {
      return
    }
    const term = normalizedSearch
    if (!term || term.includes('@')) return
    setRecentSearches((current) => {
      const next = [term, ...current.filter((item) => item !== term)].slice(
        0,
        MAX_RECENT_SEARCHES
      )
      saveRecentSearches(next)
      return next
    })
  }, [
    isOpen,
    normalizedSearch,
    peopleQuery.isError,
    peopleQuery.isSuccess,
    searchIsReady,
  ])

  const clearRecentSearch = useCallback((term: string) => {
    setRecentSearches((current) => {
      const next = current.filter((item) => item !== term)
      saveRecentSearches(next)
      return next
    })
  }, [])

  const hasRecentSearches = recentSearches.length > 0
  const handleViewProfile = (personId: number) => {
    onClose()
    navigate(`/profile/${personId}`)
  }

  return (
    <PublishModal
      ref={modalRef}
      isOpen={isOpen}
      title={t('booksPage.personSearch.title')}
      subtitle={t('booksPage.personSearch.subtitle')}
      onClose={onClose}
      closeLabel={t('booksPage.personSearch.close')}
      className={styles.modal}
    >
      <div className={styles.searchPanel}>
        <label className={styles.searchField} htmlFor="person-search-input">
          <span>{t('booksPage.personSearch.fieldLabel')}</span>
          <span className={styles.searchInputWrap}>
            <span className={styles.searchIcon} aria-hidden="true">
              ⌕
            </span>
            <input
              ref={searchInputRef}
              id="person-search-input"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setFollowErrorId(null)
              }}
              placeholder={t('booksPage.personSearch.placeholder')}
              aria-describedby="person-search-hint"
            />
          </span>
        </label>
        <p id="person-search-hint" className={styles.hint}>
          {t('booksPage.personSearch.hint')}
        </p>
      </div>

      {!showSearchState && hasRecentSearches ? (
        <section
          className={styles.recentSection}
          aria-labelledby="recent-searches-title"
        >
          <div className={styles.sectionHeading}>
            <h3 id="recent-searches-title">
              {t('booksPage.personSearch.recentTitle')}
            </h3>
            <button
              type="button"
              className={styles.clearRecent}
              onClick={() => {
                setRecentSearches([])
                saveRecentSearches([])
              }}
            >
              {t('booksPage.personSearch.clearRecent')}
            </button>
          </div>
          <div className={styles.recentList}>
            {recentSearches.map((term) => (
              <span className={styles.recentChip} key={term}>
                <button type="button" onClick={() => setSearch(term)}>
                  {term}
                </button>
                <button
                  type="button"
                  className={styles.removeRecent}
                  onClick={() => clearRecentSearch(term)}
                  aria-label={t('booksPage.personSearch.removeRecent', {
                    term,
                  })}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.resultsSection} aria-live="polite">
        {isSearching ? (
          <div className={styles.state} role="status">
            <span className={styles.spinner} aria-hidden="true" />
            {t('booksPage.personSearch.loading')}
          </div>
        ) : peopleQuery.isError && searchIsReady ? (
          <div className={styles.state} role="alert">
            <p>{t('booksPage.personSearch.error')}</p>
            <button type="button" onClick={() => void peopleQuery.refetch()}>
              {t('booksPage.personSearch.retry')}
            </button>
          </div>
        ) : !showSearchState ? (
          <div className={styles.state}>
            {hasRecentSearches
              ? t('booksPage.personSearch.recentHint')
              : t('booksPage.personSearch.emptyPrompt')}
          </div>
        ) : !canSearch(normalizedSearch) ? (
          <div className={styles.state}>
            {t('booksPage.personSearch.tooShort')}
          </div>
        ) : displayedPeople.length === 0 ? (
          <div className={styles.state}>
            {t('booksPage.personSearch.empty')}
          </div>
        ) : (
          <ul className={styles.peopleList}>
            {displayedPeople.map((person) => {
              const isPending =
                followMutation.isPending &&
                followMutation.variables?.id === person.id
              const followError = followErrorId === person.id
              return (
                <li className={styles.personRow} key={person.id}>
                  <div className={styles.personMain}>
                    <Avatar
                      initials={initialsFor(person.name)}
                      imageUrl={person.profilePhoto}
                      size="large"
                    />
                    <div className={styles.personCopy}>
                      <strong>{person.name}</strong>
                      <span>@{person.alias}</span>
                      <small>
                        {t('booksPage.personSearch.activity', {
                          books: person.booksCount,
                          exchanges: person.exchangeCount,
                        })}
                      </small>
                      {followError ? (
                        <em role="alert">
                          {t('booksPage.personSearch.followError')}
                        </em>
                      ) : null}
                    </div>
                  </div>
                  <div className={styles.personActions}>
                    <button
                      type="button"
                      className={styles.profileButton}
                      onClick={() => handleViewProfile(person.id)}
                    >
                      {t('booksPage.personSearch.viewProfile')}
                    </button>
                    <PrototypeButton
                      type="button"
                      size="small"
                      tone={person.isFollowing ? 'ghost' : 'primary'}
                      className={styles.followButton}
                      disabled={followMutation.isPending}
                      onClick={() =>
                        runIfAuthenticated(() => followMutation.mutate(person))
                      }
                      aria-pressed={person.isFollowing}
                    >
                      {isPending
                        ? t('booksPage.personSearch.followingPending')
                        : person.isFollowing
                          ? t('booksPage.personSearch.following')
                          : t('booksPage.personSearch.follow')}
                    </PrototypeButton>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </PublishModal>
  )
}
