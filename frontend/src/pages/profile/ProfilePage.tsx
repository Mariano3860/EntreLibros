import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useAuth } from '@contexts/auth/AuthContext'
import { useNotificationPreference } from '@hooks/api/useNotifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { fetchProfile, updateProfile } from '@src/api/user/profile.service'
import type {
  LocationVisibility,
  ProfileVisibility,
  UpdateProfileRequest,
} from '@src/api/user/profile.types'
import { AuthQueryKeys } from '@src/constants/constants'
import {
  PROFILE_INTERESTS,
  PROFILE_LOCATIONS,
  type ProfileCity,
} from '@src/constants/profileCatalog'

import styles from './ProfilePage.module.scss'

const profileQueryKey = ['user-profile'] as const

export const ProfilePage = () => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    queryFn: fetchProfile,
    enabled: isAuthenticated,
  })
  const notificationPreference = useNotificationPreference({
    enabled: isAuthenticated,
  })
  const [form, setForm] = useState<UpdateProfileRequest | null>(null)
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKey, profile)
      queryClient.setQueryData([AuthQueryKeys.AUTH], profile)
    },
  })

  useEffect(() => {
    if (profileQuery.data) {
      setForm({
        alias: profileQuery.data.alias,
        description: profileQuery.data.profileDescription,
        profileVisibility: profileQuery.data.profileVisibility,
        locationVisibility: profileQuery.data.locationVisibility,
        language: profileQuery.data.language,
        interests: profileQuery.data.interests,
        city: profileQuery.data.city ?? '',
        neighborhood: profileQuery.data.neighborhood,
      })
    }
  }, [profileQuery.data])

  if (!isAuthenticated) return null
  if (profileQuery.isLoading || !form) {
    return <BaseLayout id="profile-page">{t('profile.loading')}</BaseLayout>
  }
  if (profileQuery.isError) {
    return <BaseLayout id="profile-page">{t('profile.error')}</BaseLayout>
  }

  const updateField = <K extends keyof UpdateProfileRequest>(
    field: K,
    value: UpdateProfileRequest[K]
  ) =>
    setForm((current) => (current ? { ...current, [field]: value } : current))

  return (
    <BaseLayout id="profile-page">
      <main className={styles.page}>
        <h1>{t('profile.title')}</h1>
        <p>{t('profile.description')}</p>
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault()
            mutation.mutate(form)
          }}
        >
          <label>
            {t('profile.alias')}
            <input
              value={form.alias}
              maxLength={80}
              onChange={(event) => updateField('alias', event.target.value)}
              required
            />
          </label>
          <label>
            {t('profile.about')}
            <textarea
              value={form.description ?? ''}
              maxLength={500}
              onChange={(event) =>
                updateField('description', event.target.value || null)
              }
            />
          </label>
          <label>
            {t('profile.language')}
            <select
              value={form.language}
              onChange={(event) => updateField('language', event.target.value)}
            >
              <option value="es">{t('language.es')}</option>
              <option value="en">{t('language.en')}</option>
            </select>
          </label>
          <fieldset className={styles.fieldset}>
            <legend>{t('profile.interests')}</legend>
            <p className={styles.hint}>{t('profile.interestsDescription')}</p>
            <div className={styles.checkboxGrid}>
              {PROFILE_INTERESTS.map((interest) => (
                <label key={interest} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.interests.includes(interest)}
                    onChange={(event) =>
                      updateField(
                        'interests',
                        event.target.checked
                          ? [...form.interests, interest]
                          : form.interests.filter((item) => item !== interest)
                      )
                    }
                  />
                  {t(`profile.interestOptions.${interest}`)}
                </label>
              ))}
            </div>
            {form.interests.length < 3 && (
              <p className={styles.hint} role="status">
                {t('profile.interestsRecommendation')}
              </p>
            )}
          </fieldset>
          <label>
            {t('profile.city')}
            <select
              value={form.city}
              required
              onChange={(event) => {
                const city = event.target.value as ProfileCity | ''
                updateField('city', city)
                updateField('neighborhood', null)
              }}
            >
              <option value="">{t('profile.selectCity')}</option>
              {Object.keys(PROFILE_LOCATIONS).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('profile.neighborhood')}
            <select
              value={form.neighborhood ?? ''}
              disabled={!form.city}
              onChange={(event) =>
                updateField('neighborhood', event.target.value || null)
              }
            >
              <option value="">{t('profile.selectNeighborhood')}</option>
              {(PROFILE_LOCATIONS[form.city as ProfileCity] ?? []).map(
                (neighborhood) => (
                  <option key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </option>
                )
              )}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={notificationPreference.data ?? true}
              disabled={notificationPreference.update.isPending}
              onChange={(event) =>
                notificationPreference.update.mutate(event.target.checked)
              }
            />
            {t('profile.inAppNotifications')}
          </label>
          <label>
            {t('profile.visibility')}
            <select
              value={form.profileVisibility}
              onChange={(event) =>
                updateField(
                  'profileVisibility',
                  event.target.value as ProfileVisibility
                )
              }
            >
              <option value="public">{t('profile.public')}</option>
              <option value="private">{t('profile.private')}</option>
            </select>
          </label>
          <label>
            {t('profile.locationVisibility')}
            <select
              value={form.locationVisibility}
              onChange={(event) =>
                updateField(
                  'locationVisibility',
                  event.target.value as LocationVisibility
                )
              }
            >
              <option value="private">{t('profile.locationPrivate')}</option>
              <option value="city">{t('profile.locationCity')}</option>
              <option value="neighborhood">
                {t('profile.locationNeighborhood')}
              </option>
            </select>
          </label>
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t('profile.saving') : t('profile.save')}
          </button>
          {mutation.isSuccess && <p role="status">{t('profile.saved')}</p>}
          {mutation.isError && <p role="alert">{t('profile.saveError')}</p>}
        </form>
        <section
          className={styles.preview}
          aria-labelledby="profile-preview-title"
        >
          <h2 id="profile-preview-title">{t('profile.publicPreview')}</h2>
          <p>{t('profile.publicPreviewDescription')}</p>
          {form.interests.length > 0 && (
            <p>
              <strong>{t('profile.interests')}:</strong>{' '}
              {form.interests
                .map((interest) => t(`profile.interestOptions.${interest}`))
                .join(', ')}
            </p>
          )}
          {form.locationVisibility !== 'private' && form.city && (
            <p>
              <strong>{t('profile.location')}:</strong> {form.city}
              {form.locationVisibility === 'neighborhood' && form.neighborhood
                ? `, ${form.neighborhood}`
                : ''}
            </p>
          )}
        </section>
      </main>
    </BaseLayout>
  )
}
