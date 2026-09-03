import { fetchProfile, updateProfile } from '@api/user/profile.service'
import type {
  LocationVisibility,
  ProfileCountry,
  ProfileInterest,
  ProfileVisibility,
  UserProfile,
} from '@api/user/profile.types'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useNotificationPreference } from '@hooks/api/useNotifications'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
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
import {
  cropProfilePhotoToSquare,
  defaultProfilePhotoFocus,
  isSupportedProfilePhoto,
  readProfilePhotoFile,
  type ProfilePhotoFocus,
} from './profilePhoto'
import { ProfilePhotoCropper } from './ProfilePhotoCropper'

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
  const notificationPreference = useNotificationPreference({
    enabled: !mockMode,
  })
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
  const [photoCropSource, setPhotoCropSource] = useState<string | null>(null)
  const [photoCropFocus, setPhotoCropFocus] = useState<ProfilePhotoFocus>(
    defaultProfilePhotoFocus()
  )
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [readingPhoto, setReadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const photoSelectionId = useRef(0)
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
    setPhotoCropSource(null)
    setPhotoCropFocus(defaultProfilePhotoFocus())
    setProfileVisibility(profile.profileVisibility)
    setLocationVisibility(profile.locationVisibility)
    setInterests(profile.interests)
    setCountry(profile.country ?? 'Argentina')
    setCity(profile.city ?? '')
    setNeighborhood(profile.neighborhood)
    setStreet(profile.street ?? '')
  }, [profile])

  const resetEditorDraft = () => {
    photoSelectionId.current += 1
    setReadingPhoto(false)
    if (profile) {
      const next = toPrototypeProfile(profile)
      setName(next.name)
      setBio(next.bio)
      setProfileVisibility(profile.profileVisibility)
      setLocationVisibility(profile.locationVisibility)
      setInterests(profile.interests)
      setCountry(profile.country ?? 'Argentina')
      setCity(profile.city ?? '')
      setNeighborhood(profile.neighborhood)
      setStreet(profile.street ?? '')
      setProfilePhoto(profile.profilePhoto)
    } else {
      setName(catalog.user.name)
      setBio(catalog.user.bio)
      setProfileVisibility('public')
      setLocationVisibility('city')
      setInterests(mockInterests)
      setCountry('Argentina')
      setCity('Buenos Aires')
      setNeighborhood(null)
      setStreet('')
      setProfilePhoto(null)
    }
    setPhotoCropSource(null)
    setPhotoCropFocus(defaultProfilePhotoFocus())
    setPhotoError(null)
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (saving) return

    setSaveError(null)
    setSaving(true)
    let photoToSave = profilePhoto
    if (photoCropSource) {
      try {
        photoToSave = await cropProfilePhotoToSquare(
          photoCropSource,
          photoCropFocus
        )
      } catch (error) {
        const errorKey =
          error instanceof Error && error.message === 'profile.photo.too_large'
            ? 'profile.photoInvalid'
            : 'profile.photoReadError'
        setPhotoError(
          t(errorKey, {
            defaultValue: 'No pudimos leer la imagen. Intentá nuevamente.',
          })
        )
        setSaving(false)
        return
      }
    }

    if (!mockMode && profile) {
      try {
        const updated = await updateProfile({
          alias: name.trim(),
          description: bio.trim() || null,
          profilePhoto: photoToSave,
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
    }

    setProfilePhoto(photoToSave)
    setPhotoCropSource(null)
    setPhotoCropFocus(defaultProfilePhotoFocus())
    setSaving(false)
    setSaved(true)
    setEditing(false)
  }

  const openEditor = () => {
    resetEditorDraft()
    setSaved(false)
    setSaveError(null)
    setEditing(true)
  }

  const closeEditor = () => {
    resetEditorDraft()
    setEditing(false)
  }

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const selectionId = photoSelectionId.current + 1
    photoSelectionId.current = selectionId
    event.target.value = ''
    if (photoInputRef.current) photoInputRef.current.value = ''
    setReadingPhoto(true)
    setPhotoCropSource(null)
    setPhotoCropFocus(defaultProfilePhotoFocus())

    if (!isSupportedProfilePhoto(file)) {
      setPhotoError(
        t('profile.photoInvalid', {
          defaultValue: 'Elegí una imagen JPG, PNG o WebP de hasta 5 MB.',
        })
      )
      setReadingPhoto(false)
      return
    }

    try {
      const source = await readProfilePhotoFile(file)
      if (selectionId !== photoSelectionId.current) return
      setPhotoCropSource(source)
      setPhotoCropFocus(defaultProfilePhotoFocus())
      setPhotoError(null)
    } catch {
      setPhotoError(
        t('profile.photoReadError', {
          defaultValue: 'No pudimos leer la imagen. Intentá nuevamente.',
        })
      )
    } finally {
      if (selectionId === photoSelectionId.current) setReadingPhoto(false)
    }
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
              {t('profile.edit', { defaultValue: 'Editar perfil' })}
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
            <Panel
              className={`${styles.modal} ${
                photoCropSource ? styles.modalCropping : ''
              }`}
              as="div"
              role="dialog"
              aria-modal={true}
              aria-labelledby="profile-edit-title"
            >
              <header className={styles.modalHeader}>
                <h2 id="profile-edit-title">
                  {t('profile.edit', { defaultValue: 'Editar perfil' })}
                </h2>
                <p className={styles.modalSubtitle}>
                  {t('profile.editDescription', {
                    defaultValue:
                      'Actualizá la información pública y personalizá cómo te ven otros lectores.',
                  })}
                </p>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={closeEditor}
                  aria-label={t('profile.close', { defaultValue: 'Cerrar' })}
                >
                  ×
                </button>
              </header>
              <form onSubmit={save}>
                <div className={styles.photoField}>
                  <span>{t('profile.photo')}</span>
                  <div
                    className={`${styles.photoControls} ${
                      photoCropSource ? styles.photoControlsCropping : ''
                    }`}
                  >
                    {photoCropSource ? (
                      <ProfilePhotoCropper
                        source={photoCropSource}
                        focus={photoCropFocus}
                        onFocusChange={setPhotoCropFocus}
                        onReset={() =>
                          setPhotoCropFocus(defaultProfilePhotoFocus())
                        }
                        onCancel={() => {
                          setPhotoCropSource(null)
                          setPhotoCropFocus(defaultProfilePhotoFocus())
                        }}
                        labels={{
                          title: t('profile.photoCropTitle', {
                            defaultValue: 'Ajustá el encuadre',
                          }),
                          hint: t('profile.photoCropHint', {
                            defaultValue:
                              'Arrastrá la imagen o usá los controles para centrarla.',
                          }),
                          horizontal: t('profile.photoCropHorizontal', {
                            defaultValue: 'Horizontal',
                          }),
                          vertical: t('profile.photoCropVertical', {
                            defaultValue: 'Vertical',
                          }),
                          focus: t('profile.photoCropFocus', {
                            defaultValue: 'Foco del recorte',
                          }),
                          reset: t('profile.photoCropReset', {
                            defaultValue: 'Restablecer encuadre',
                          }),
                          cancel: t('profile.photoCropCancel', {
                            defaultValue: 'Descartar foto nueva',
                          }),
                        }}
                      />
                    ) : (
                      <Avatar
                        initials={name.slice(0, 1).toUpperCase() || '?'}
                        imageUrl={profilePhoto}
                        accent="#ff8b4c"
                        size="hero"
                      />
                    )}
                    <div className={styles.photoActions}>
                      <label className={styles.fileButton}>
                        {profilePhoto
                          ? t('profile.changePhoto', {
                              defaultValue: 'Cambiar foto',
                            })
                          : t('profile.photo')}
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          aria-label={t('profile.photo')}
                          onClick={(event) => {
                            event.currentTarget.value = ''
                          }}
                          onChange={handlePhotoChange}
                        />
                      </label>
                      {profilePhoto || photoCropSource ? (
                        <button
                          type="button"
                          className={styles.removePhoto}
                          onClick={() => {
                            photoSelectionId.current += 1
                            setReadingPhoto(false)
                            setProfilePhoto(null)
                            setPhotoCropSource(null)
                            setPhotoCropFocus(defaultProfilePhotoFocus())
                          }}
                        >
                          {t('profile.removePhoto')}
                        </button>
                      ) : null}
                      <small>{t('profile.photoHint')}</small>
                    </div>
                  </div>
                  {photoError ? <p role="alert">{photoError}</p> : null}
                </div>
                <div className={styles.modalMainGrid}>
                  <section
                    className={styles.basicInfoField}
                    aria-labelledby="profile-basic-info-title"
                  >
                    <h3 id="profile-basic-info-title">
                      <span aria-hidden="true">◈</span>
                      {t('profile.basicInfo', {
                        defaultValue: 'Información básica',
                      })}
                    </h3>
                    <label>
                      {t('profile.name', { defaultValue: 'Nombre' })}
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                      />
                    </label>
                    <label>
                      {t('profile.about', { defaultValue: 'Sobre vos' })}
                      <textarea
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        maxLength={500}
                      />
                    </label>
                  </section>
                  <fieldset className={styles.interestField}>
                    <legend>{t('profile.interests')}</legend>
                    <p>{t('profile.interestsDescription')}</p>
                    <div className={styles.interestOptions}>
                      {PROFILE_INTERESTS.map((interest) => (
                        <label
                          className={
                            interests.includes(interest)
                              ? styles.interestOptionSelected
                              : ''
                          }
                          key={interest}
                        >
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
                </div>
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
                  <label className={styles.locationVisibilityControl}>
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
                  <label className={styles.streetControl}>
                    {t('profile.street')}
                    <input
                      value={street}
                      maxLength={160}
                      onChange={(event) => setStreet(event.target.value)}
                    />
                    <small>{t('profile.streetPrivate')}</small>
                  </label>
                  <p className={styles.privacyHint}>
                    {t('profile.publicPreviewDescription')}
                  </p>
                </fieldset>
                <section
                  className={styles.preferencesField}
                  aria-labelledby="profile-preferences-title"
                >
                  <h3 id="profile-preferences-title">
                    <span aria-hidden="true">☷</span>
                    {t('profile.preferences', { defaultValue: 'Preferencias' })}
                  </h3>
                  <div className={styles.preferencesGrid}>
                    <label className={styles.preferenceControl}>
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
                    <label
                      className={`${styles.notificationPreference} ${styles.preferenceControl}`}
                    >
                      <input
                        type="checkbox"
                        checked={
                          mockMode || notificationPreference.data !== false
                        }
                        disabled={
                          mockMode || notificationPreference.update.isPending
                        }
                        onChange={(event) =>
                          notificationPreference.update.mutate(
                            event.target.checked
                          )
                        }
                      />
                      {t('profile.inAppNotifications')}
                    </label>
                  </div>
                </section>
                <div className={styles.modalActions}>
                  <PrototypeButton type="button" onClick={closeEditor}>
                    {t('profile.cancel', { defaultValue: 'Cancelar' })}
                  </PrototypeButton>
                  <PrototypeButton
                    tone="primary"
                    type="submit"
                    disabled={
                      saving ||
                      readingPhoto ||
                      Boolean(photoError && !profilePhoto && !photoCropSource)
                    }
                  >
                    {saving
                      ? t('profile.saving', { defaultValue: 'Guardando...' })
                      : t('profile.save', { defaultValue: 'Guardar cambios' })}
                  </PrototypeButton>
                </div>
              </form>
              {saveError ? (
                <p className={styles.modalError} role="alert">
                  {saveError}
                </p>
              ) : null}
            </Panel>
          </div>
        ) : null}
      </PrototypePage>
    </BaseLayout>
  )
}
