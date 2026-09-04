import { createConversation } from '@api/messages/messages'
import { fetchPublicProfile } from '@api/user/profile.service'
import type { PublicProfile } from '@api/user/profile.types'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { ReportModal } from '@components/reports/ReportModal'
import { useAuth } from '@contexts/auth/AuthContext'
import { useAuthRequired } from '@contexts/auth/AuthRequiredContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { usePrototype } from '@src/features/prototype/PrototypeContext'
import {
  Avatar,
  Panel,
  PrototypeButton,
  PrototypePage,
  SectionHeading,
} from '@src/features/prototype/PrototypeUI'
import { isApiMockMode } from '@src/utils/runtimeEnv'

import styles from './PublicProfilePage.module.scss'

const toProfileId = (value: string | undefined) => {
  if (!value || !/^\d+$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

const profileInitials = (profile: PublicProfile) =>
  profile.alias.slice(0, 2).toUpperCase()

export const PublicProfilePage = () => {
  const { id: rawId } = useParams<{ id: string }>()
  const profileId = toProfileId(rawId)
  const mockMode = isApiMockMode()
  const { catalog } = usePrototype()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isAuthenticated, user } = useAuth()
  const { runIfAuthenticated } = useAuthRequired()
  const [reportOpen, setReportOpen] = useState(false)
  const profileQuery = useQuery({
    queryKey: ['prototype', 'public-profile', profileId],
    queryFn: () => fetchPublicProfile(profileId ?? 0),
    enabled: !mockMode && profileId !== null,
  })
  const contactMutation = useMutation({
    mutationFn: () => createConversation(profileId ?? 0),
    onSuccess: (conversation) => {
      navigate('/messages', { state: { conversationId: conversation.id } })
    },
  })

  const mockProfile: PublicProfile = {
    id: profileId ?? 1,
    alias: 'Lucía Fernández',
    profileDescription: 'Lectora y anfitriona de rincones de lectura.',
    profilePhoto: null,
    language: 'es',
    location: null,
    interests: ['fiction', 'poetry'],
    country: 'Argentina',
    city: 'Buenos Aires',
    publicationCount: catalog.communityPosts.length,
    exchangeCount: 12,
    publications: [],
  }

  const renderState = (text: string, error = false) => (
    <BaseLayout id="public-profile-page">
      <PrototypePage>
        <Panel
          as="article"
          className={styles.state}
          aria-label={error ? t('publicProfile.notFound') : text}
        >
          {text}
        </Panel>
      </PrototypePage>
    </BaseLayout>
  )

  if (profileId === null || (!mockMode && profileQuery.isError)) {
    return renderState(t('publicProfile.notFound'), true)
  }
  if (!mockMode && (profileQuery.isLoading || !profileQuery.data)) {
    return renderState(t('publicProfile.loading'))
  }

  const profile = mockMode ? mockProfile : profileQuery.data!
  const location = [profile.neighborhood, profile.city, profile.country]
    .filter(Boolean)
    .join(' · ')

  return (
    <BaseLayout id="public-profile-page">
      <PrototypePage>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{t('publicProfile.member')}</span>
            <h1>{profile.alias}</h1>
            {location ? <p>{location}</p> : null}
          </div>
          <div className={styles.actions}>
            <PrototypeButton
              tone="primary"
              onClick={() => runIfAuthenticated(() => contactMutation.mutate())}
              disabled={user?.id === profile.id || contactMutation.isPending}
            >
              {contactMutation.isPending
                ? t('publicProfile.contacting')
                : isAuthenticated
                  ? t('publicProfile.contact')
                  : t('auth.required.loginContact')}
            </PrototypeButton>
            <PrototypeButton
              onClick={() => runIfAuthenticated(() => setReportOpen(true))}
            >
              {t('reports.report', { defaultValue: 'Reportar' })}
            </PrototypeButton>
          </div>
        </header>

        {contactMutation.isError ? (
          <Panel as="article" className={styles.error}>
            {t('publicProfile.contactError')}
          </Panel>
        ) : null}

        <div className={styles.grid}>
          <Panel as="article" className={styles.identity}>
            <Avatar
              initials={profileInitials(profile)}
              imageUrl={profile.profilePhoto}
              accent="#42d7c7"
              size="hero"
            />
            <div>
              <h2>{profile.alias}</h2>
              <p>{t('publicProfile.member')}</p>
            </div>
          </Panel>

          <Panel as="article" className={styles.details}>
            <SectionHeading title={t('profile.about')} />
            <p className={styles.description}>
              {profile.profileDescription || '—'}
            </p>
            {profile.interests.length ? (
              <>
                <span className={styles.label}>{t('profile.interests')}</span>
                <div className={styles.interests}>
                  {profile.interests.map((interest) => (
                    <span key={interest}>
                      {t(`profile.interestOptions.${interest}`, {
                        defaultValue: interest,
                      })}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
            <div className={styles.stats}>
              <span>
                <strong>{profile.publicationCount ?? 0}</strong>
                {t('publicProfile.publications')}
              </span>
              <span>
                <strong>{profile.exchangeCount ?? 0}</strong>
                {t('publicProfile.exchanges')}
              </span>
            </div>
          </Panel>
        </div>
        {profile.publications?.length ? (
          <section className={styles.publications}>
            <SectionHeading title={t('publicProfile.publicationsTitle')} />
            <div className={styles.publicationList}>
              {profile.publications.map((publication) => (
                <button
                  type="button"
                  key={publication.id}
                  onClick={() => navigate(`/books/${publication.id}`)}
                >
                  {publication.coverUrl ? (
                    <img src={publication.coverUrl} alt="" />
                  ) : null}
                  <span>
                    <strong>{publication.title}</strong>
                    <small>
                      {publication.author || t('publicProfile.unknownAuthor')}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </PrototypePage>
      <ReportModal
        isOpen={reportOpen}
        targetType="conduct"
        targetId={String(profile.id)}
        onClose={() => setReportOpen(false)}
      />
    </BaseLayout>
  )
}
