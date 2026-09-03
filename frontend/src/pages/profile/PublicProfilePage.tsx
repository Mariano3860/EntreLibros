import { createConversation } from '@api/messages/messages'
import { fetchPublicProfile } from '@api/user/profile.service'
import type { PublicProfile } from '@api/user/profile.types'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { ReportModal } from '@components/reports/ReportModal'
import { useAuth } from '@contexts/auth/AuthContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

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
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isAuthenticated, user } = useAuth()
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

  if (mockMode || profileId === null || profileQuery.isError) {
    return renderState(t('publicProfile.notFound'), true)
  }
  if (profileQuery.isLoading || !profileQuery.data) {
    return renderState(t('publicProfile.loading'))
  }

  const profile = profileQuery.data
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
              onClick={() => contactMutation.mutate()}
              disabled={
                !isAuthenticated ||
                user?.id === profile.id ||
                contactMutation.isPending
              }
            >
              {contactMutation.isPending
                ? t('publicProfile.contacting')
                : t('publicProfile.contact')}
            </PrototypeButton>
            <PrototypeButton onClick={() => setReportOpen(true)}>
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
          </Panel>
        </div>
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
