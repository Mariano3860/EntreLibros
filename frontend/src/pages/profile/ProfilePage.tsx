import { fetchProfile, updateProfile } from '@api/user/profile.service'
import type {
  LocationVisibility,
  ProfileCountry,
  ProfileInterest,
  ProfileVisibility,
  UserProfile,
} from '@api/user/profile.types'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  PROFILE_COUNTRIES,
  PROFILE_INTERESTS,
  PROFILE_LOCATIONS,
} from '@src/constants/profileCatalog'
import { usePrototype } from '@src/features/prototype/PrototypeContext'
import {
  Avatar,
  Panel,
  PrototypeButton,
  PrototypePage,
  SectionHeading,
} from '@src/features/prototype/PrototypeUI'
import { toPrototypeProfile } from '@src/features/prototype/realData.adapters'
import { isApiMockMode } from '@src/utils/runtimeEnv'

import styles from './ProfilePage.module.scss'

type ProfileStateProps = { text: string; error?: boolean }
type ProfileCity = keyof typeof PROFILE_LOCATIONS

const PROFILE_QUERY_KEY = ['prototype', 'profile'] as const
const LOCATION_VISIBILITY_OPTIONS: readonly LocationVisibility[] = [
  'none',
  'country',
  'city',
  'neighborhood',
]
const PROFILE_VISIBILITY_OPTIONS: readonly ProfileVisibility[] = [
  'public',
  'private',
]
const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024
const PROFILE_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const mockInterests: ProfileInterest[] = PROFILE_INTERESTS.slice(0, 5)

const isProfileCity = (value: string): value is ProfileCity =>
  value in PROFILE_LOCATIONS

const ProfileState = ({ text, error = false }: ProfileStateProps) => (
  <BaseLayout id="profile-page">
    <PrototypePage>
      <Panel className={styles.loading} {...(error ? { role: 'alert' } : {})}>
        {text}
      </Panel>
    </PrototypePage>
  </BaseLayout>
)

export const ProfilePage = () => {
  const { catalog } = usePrototype()
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const mockMode = isApiMockMode()
  const profileQuery = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
    enabled: !mockMode,
  })
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState<string>(catalog.user.name)
  const [bio, setBio] = useState<string>(catalog.user.bio)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [profileVisibility, setProfileVisibility] =
    useState<ProfileVisibility>('public')
  const [locationVisibility, setLocationVisibility] =
    useState<LocationVisibility>('city')
  const [interests, setInterests] = useState<ProfileInterest[]>(mockInterests)
  const [country, setCountry] = useState<ProfileCountry>('Argentina')
  const [city, setCity] = useState<string>('Buenos Aires')
  const [neighborhood, setNeighborhood] = useState<string | null>(null)
  const [street, setStreet] = useState('')
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const profile = profileQuery.data
  const realProfile = profile ? toPrototypeProfile(profile) : null
  const availableNeighborhoods = isProfileCity(city)
    ? PROFILE_LOCATIONS[city]
    : []

  useEffect(() => {
    if (!profile) return
    const next = toPrototypeProfile(profile)
    setName(next.name)
    setBio(next.bio)
    setProfilePhoto(profile.profilePhoto)
    setProfileVisibility(profile.profileVisibility)
    setLocationVisibility(profile.locationVisibility)
    setInterests(profile.interests)
    setCountry(profile.country ?? 'Argentina')
    setCity(profile.city ?? '')
    setNeighborhood(profile.neighborhood)
    setStreet(profile.street ?? '')
  }, [profile])

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (saving) return
    if (!mockMode && profile) {
      setSaveError(null)
      setSaving(true)
      try {
        const updated = await updateProfile({
          alias: name.trim(),
          description: bio.trim() || null,
          profilePhoto,
          profileVisibility,
          locationVisibility,
          language: profile.language,
          interests,
          country,
          city: city || null,
          neighborhood,
          street: street.trim() || null,
        })
        queryClient.setQueryData<UserProfile>(PROFILE_QUERY_KEY, updated)
      } catch {
        setSaveError(
          t('profile.saveError', {
            defaultValue: 'No se pudieron guardar los cambios.',
          })
        )
        setSaving(false)
        return
      }
      setSaving(false)
    }
    setSaved(true)
    setEditing(false)
  }

  const openEditor = () => {
    setSaved(false)
    setSaveError(null)
    setPhotoError(null)
    setEditing(true)
  }

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (
      !PROFILE_PHOTO_TYPES.includes(file.type) ||
      file.size > MAX_PROFILE_PHOTO_BYTES
    ) {
      setPhotoError(
        t('profile.photoInvalid', {
          defaultValue: 'Elegí una imagen JPG, PNG o WebP de hasta 5 MB.',
        })
      )
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      if (!result) {
        setPhotoError(
          t('profile.photoInvalid', {
            defaultValue: 'Elegí una imagen JPG, PNG o WebP de hasta 5 MB.',
          })
        )
        return
      }
      setProfilePhoto(result)
      setPhotoError(null)
    }
    reader.onerror = () =>
      setPhotoError(
        t('profile.photoInvalid', {
          defaultValue: 'Elegí una imagen JPG, PNG o WebP de hasta 5 MB.',
        })
      )
    reader.readAsDataURL(file)
  }

  const toggleInterest = (interest: ProfileInterest) => {
    setInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((value) => value !== interest)
      }
      return current.length < 8 ? [...current, interest] : current
    })
  }

  if (!mockMode && profileQuery.isLoading)
    return <ProfileState text="Cargando perfil…" />
  if (!mockMode && (!realProfile || profileQuery.isError))
    return (
      <ProfileState
        text="No pudimos cargar el perfil. Intentá nuevamente."
        error
      />
    )

  const visible = realProfile ?? {
    name: catalog.user.name,
    username: catalog.user.username,
    initials: catalog.user.initials,
    city: catalog.user.city,
    bio: catalog.user.bio,
    profilePhoto: null,
    interests: interests.map((interest) =>
      t(`profile.interestOptions.${interest}`, { defaultValue: interest })
    ),
  }

  return (
    <BaseLayout id="profile-page">
      <PrototypePage>
        <section className={styles.profileHero}>
          <div className={styles.cover} />
          <div className={styles.identity}>
            <Avatar
              initials={visible.initials}
              imageUrl={profilePhoto}
              accent="#ff8b4c"
              size="hero"
            />
            <div className={styles.identityCopy}>
              <h1>{name}</h1>
              <p>
                {visible.username}
                {visible.city ? ` · ${visible.city}` : ''}
              </p>
              <small>◷ Miembro de EntreLibros</small>
            </div>
            <PrototypeButton onClick={openEditor}>
              ✎ Editar perfil
            </PrototypeButton>
          </div>
          <p className={styles.bio}>{bio}</p>
          <div className={styles.profileFooter}>
            <div className={styles.interestBlock}>
              <span className={styles.interestsLabel}>
                Intereses de lectura
              </span>
              <div className={styles.interests}>
                {visible.interests.map((interest) => (
                  <span key={interest}>{interest}</span>
                ))}
              </div>
            </div>
            <section className={styles.metrics} aria-label="Métricas de perfil">
              {mockMode ? (
                catalog.profileMetrics.map((metric) => (
                  <div key={metric.label}>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))
              ) : (
                <div className={styles.limitedMetric}>
                  <strong>—</strong>
                  <span>Métricas de lectura próximamente</span>
                </div>
              )}
            </section>
          </div>
          {saved ? (
            <div className={styles.saved} role="status">
              Perfil actualizado
            </div>
          ) : null}
        </section>

        <div className={styles.content}>
          <div className={styles.primaryColumn}>
            <Panel className={styles.preferences}>
              <SectionHeading
                title="Preferencias de lectura"
                action={<button onClick={openEditor}>Editar</button>}
              />
              <div className={styles.preferenceGrid}>
                {mockMode ? (
                  catalog.profile.preferences.map((preference) => (
                    <article key={preference.title}>
                      <span>{preference.icon}</span>
                      <div>
                        <strong>{preference.title}</strong>
                        <p>{preference.text}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <article>
                    <span>♡</span>
                    <div>
                      <strong>Géneros favoritos</strong>
                      <p>
                        {visible.interests.join(', ') ||
                          'Todavía no elegiste intereses.'}
                      </p>
                    </div>
                  </article>
                )}
              </div>
            </Panel>
            <Panel className={styles.achievements}>
              <SectionHeading
                title="Logros"
                action={
                  <span>{mockMode ? '12 desbloqueados' : 'Próximamente'}</span>
                }
              />
              <div>
                {mockMode ? (
                  catalog.profile.achievements.map((achievement) => (
                    <article key={achievement.title}>
                      <span>{achievement.icon}</span>
                      <strong>{achievement.title}</strong>
                      <small>{achievement.text}</small>
                    </article>
                  ))
                ) : (
                  <article>
                    <span>—</span>
                    <strong>Próximamente</strong>
                    <small>
                      Los logros se habilitarán con historial lector.
                    </small>
                  </article>
                )}
              </div>
            </Panel>
          </div>
          <aside className={styles.secondaryColumn}>
            <Panel className={styles.goal}>
              <SectionHeading
                title="Objetivo de lectura"
                action={
                  <span>{mockMode ? catalog.profile.goal.year : '—'}</span>
                }
              />
              <div className={styles.goalRing}>
                <strong>{mockMode ? catalog.profile.goal.read : '—'}</strong>
                <small>
                  {mockMode
                    ? `de ${catalog.profile.goal.target} libros`
                    : 'Objetivo próximamente'}
                </small>
              </div>
              <div className={styles.progress}>
                <span />
              </div>
              <p>
                {mockMode
                  ? `¡Te faltan ${catalog.profile.goal.target - catalog.profile.goal.read} libros para cumplir tu objetivo!`
                  : 'Se conectará al existir una fuente persistida.'}
              </p>
            </Panel>
            <Panel className={styles.streak}>
              <div className={styles.flame}>♨</div>
              <div>
                <strong>
                  {mockMode
                    ? `${catalog.profile.streak.current} días de racha`
                    : 'Racha próximamente'}
                </strong>
                <p>
                  {mockMode
                    ? `Tu mejor racha: ${catalog.profile.streak.best} días`
                    : 'No hay datos de racha persistidos.'}
                </p>
              </div>
              <div className={styles.week}>
                {(mockMode ? catalog.profile.week : ['—']).map((day, index) => (
                  <span
                    className={
                      mockMode && index < catalog.profile.streak.completedDays
                        ? styles.done
                        : ''
                    }
                    key={day}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </Panel>
          </aside>
        </div>

        {editing ? (
          <div className={styles.modalBackdrop}>
            <Panel className={styles.modal} as="div">
              <header>
                <h2>Editar perfil</h2>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </header>
              <form onSubmit={save}>
                <label>
                  Nombre
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <div className={styles.photoField}>
                  <span>{t('profile.photo')}</span>
                  <div className={styles.photoControls}>
                    <Avatar
                      initials={name.slice(0, 1).toUpperCase() || '?'}
                      imageUrl={profilePhoto}
                      accent="#ff8b4c"
                      size="large"
                    />
                    <div>
                      <label className={styles.fileButton}>
                        {t('profile.photo')}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoChange}
                        />
                      </label>
                      {profilePhoto ? (
                        <button
                          type="button"
                          className={styles.removePhoto}
                          onClick={() => setProfilePhoto(null)}
                        >
                          {t('profile.removePhoto')}
                        </button>
                      ) : null}
                      <small>{t('profile.photoHint')}</small>
                    </div>
                  </div>
                  {photoError ? <p role="alert">{photoError}</p> : null}
                </div>
                <label>
                  Sobre vos
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    maxLength={500}
                  />
                </label>
                <fieldset className={styles.interestField}>
                  <legend>{t('profile.interests')}</legend>
                  <p>{t('profile.interestsDescription')}</p>
                  <div className={styles.interestOptions}>
                    {PROFILE_INTERESTS.map((interest) => (
                      <label key={interest}>
                        <input
                          type="checkbox"
                          checked={interests.includes(interest)}
                          onChange={() => toggleInterest(interest)}
                        />
                        {t(`profile.interestOptions.${interest}`)}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className={styles.locationField}>
                  <legend>{t('profile.location')}</legend>
                  <label>
                    {t('profile.country')}
                    <select
                      value={country}
                      onChange={(event) =>
                        setCountry(event.target.value as ProfileCountry)
                      }
                    >
                      {PROFILE_COUNTRIES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t('profile.city')}
                    <select
                      value={city}
                      onChange={(event) => {
                        setCity(event.target.value)
                        setNeighborhood(null)
                      }}
                    >
                      <option value="">{t('profile.selectCity')}</option>
                      {Object.keys(PROFILE_LOCATIONS).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t('profile.neighborhood')}
                    <select
                      value={neighborhood ?? ''}
                      onChange={(event) =>
                        setNeighborhood(event.target.value || null)
                      }
                      disabled={availableNeighborhoods.length === 0}
                    >
                      <option value="">
                        {t('profile.selectNeighborhood')}
                      </option>
                      {availableNeighborhoods.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t('profile.street')}
                    <input
                      value={street}
                      maxLength={160}
                      onChange={(event) => setStreet(event.target.value)}
                    />
                    <small>{t('profile.streetPrivate')}</small>
                  </label>
                  <label>
                    {t('profile.locationVisibility')}
                    <select
                      value={locationVisibility}
                      onChange={(event) =>
                        setLocationVisibility(
                          event.target.value as LocationVisibility
                        )
                      }
                    >
                      {LOCATION_VISIBILITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {t(
                            `profile.location${option[0].toUpperCase()}${option.slice(1)}`
                          )}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className={styles.privacyHint}>
                    {t('profile.publicPreviewDescription')}
                  </p>
                </fieldset>
                <label>
                  {t('profile.visibility')}
                  <select
                    value={profileVisibility}
                    onChange={(event) =>
                      setProfileVisibility(
                        event.target.value as ProfileVisibility
                      )
                    }
                  >
                    {PROFILE_VISIBILITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {t(`profile.${option}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className={styles.publicPreview}>
                  <strong>{t('profile.publicPreview')}</strong>
                  <span>
                    {profileVisibility === 'private'
                      ? t('profile.previewPrivate')
                      : t(
                          `profile.previewLocation${locationVisibility
                            .slice(0, 1)
                            .toUpperCase()}${locationVisibility.slice(1)}`
                        )}
                  </span>
                </div>
                <div>
                  <PrototypeButton
                    type="button"
                    onClick={() => setEditing(false)}
                  >
                    Cancelar
                  </PrototypeButton>
                  <PrototypeButton
                    tone="primary"
                    type="submit"
                    disabled={saving || Boolean(photoError)}
                  >
                    {saving
                      ? t('profile.saving', { defaultValue: 'Guardando...' })
                      : t('profile.save', { defaultValue: 'Guardar cambios' })}
                  </PrototypeButton>
                </div>
              </form>
              {saveError ? <p role="alert">{saveError}</p> : null}
            </Panel>
          </div>
        ) : null}
      </PrototypePage>
    </BaseLayout>
  )
}
