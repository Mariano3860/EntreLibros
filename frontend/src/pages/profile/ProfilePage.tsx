import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useAuth } from '@contexts/auth/AuthContext'
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
      </main>
    </BaseLayout>
  )
}
