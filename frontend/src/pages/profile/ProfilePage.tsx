import { fetchProfile, updateProfile } from '@api/user/profile.service'
import type { UserProfile } from '@api/user/profile.types'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FormEvent, useEffect, useState } from 'react'

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
  const mockMode = isApiMockMode()
  const profileQuery = useQuery({
    queryKey: ['prototype', 'profile'],
    queryFn: fetchProfile,
    enabled: !mockMode,
  })
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState<string>(catalog.user.name)
  const [bio, setBio] = useState<string>(catalog.user.bio)
  const [city, setCity] = useState('Buenos Aires')
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const profile = profileQuery.data
  const realProfile = profile ? toPrototypeProfile(profile) : null

  useEffect(() => {
    if (!profile) return
    const next = toPrototypeProfile(profile)
    setName(next.name)
    setBio(next.bio)
    setCity(profile.city ?? 'Buenos Aires')
  }, [profile])

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (!mockMode && profile) {
      setSaveError(null)
      try {
        const updated = await updateProfile({
          alias: name.trim(),
          description: bio.trim() || null,
          profileVisibility: profile.profileVisibility,
          locationVisibility: profile.locationVisibility,
          language: profile.language,
          interests: profile.interests,
          city,
          neighborhood: profile.neighborhood,
        })
        queryClient.setQueryData<UserProfile>(['prototype', 'profile'], updated)
      } catch {
        setSaveError('No pudimos actualizar el perfil. Intentá nuevamente.')
        return
      }
    }
    setSaved(true)
    setEditing(false)
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
    interests: [...catalog.user.interests],
  }

  return (
    <BaseLayout id="profile-page">
      <PrototypePage>
        <section className={styles.profileHero}>
          <div className={styles.cover} />
          <div className={styles.identity}>
            <Avatar initials={visible.initials} accent="#ff8b4c" size="hero" />
            <div className={styles.identityCopy}>
              <h1>{name}</h1>
              <p>
                {visible.username}
                {visible.city ? ` · ${visible.city}` : ''}
              </p>
              <small>◷ Miembro de EntreLibros</small>
            </div>
            <PrototypeButton onClick={() => setEditing(true)}>
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
                action={
                  <button onClick={() => setEditing(true)}>Editar</button>
                }
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
                <button onClick={() => setEditing(false)} aria-label="Cerrar">
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
                <label>
                  Sobre vos
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    maxLength={500}
                  />
                </label>
                <label>
                  Ciudad
                  <select
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                  >
                    <option>Buenos Aires</option>
                    <option>La Plata</option>
                    <option>Córdoba</option>
                  </select>
                </label>
                <div>
                  <PrototypeButton
                    type="button"
                    onClick={() => setEditing(false)}
                  >
                    Cancelar
                  </PrototypeButton>
                  <PrototypeButton tone="primary" type="submit">
                    Guardar cambios
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
