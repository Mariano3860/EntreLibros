import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { FormEvent, useState } from 'react'

import { usePrototype } from '@src/features/prototype/PrototypeContext'
import {
  Avatar,
  Panel,
  PrototypeButton,
  PrototypePage,
  SectionHeading,
} from '@src/features/prototype/PrototypeUI'

import styles from './ProfilePage.module.scss'

export const ProfilePage = () => {
  const { catalog } = usePrototype()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState<string>(catalog.user.name)
  const [bio, setBio] = useState<string>(catalog.user.bio)
  const [saved, setSaved] = useState(false)

  const save = (event: FormEvent) => {
    event.preventDefault()
    setSaved(true)
    setEditing(false)
  }

  return (
    <BaseLayout id="profile-page">
      <PrototypePage>
        <section className={styles.profileHero}>
          <div className={styles.cover} />
          <div className={styles.identity}>
            <Avatar initials="M" accent="#ff8b4c" size="hero" />
            <div className={styles.identityCopy}>
              <h1>{name}</h1>
              <p>
                {catalog.user.username} · {catalog.user.city}
              </p>
              <small>◷ {catalog.user.joined}</small>
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
                {catalog.user.interests.map((interest) => (
                  <span key={interest}>{interest}</span>
                ))}
              </div>
            </div>
            <section className={styles.metrics} aria-label="Métricas de perfil">
              {catalog.profileMetrics.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
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
                {catalog.profile.preferences.map((preference) => (
                  <article key={preference.title}>
                    <span>{preference.icon}</span>
                    <div>
                      <strong>{preference.title}</strong>
                      <p>{preference.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>

            <Panel className={styles.achievements}>
              <SectionHeading
                title="Logros"
                action={<span>12 desbloqueados</span>}
              />
              <div>
                {catalog.profile.achievements.map((achievement) => (
                  <article key={achievement.title}>
                    <span>{achievement.icon}</span>
                    <strong>{achievement.title}</strong>
                    <small>{achievement.text}</small>
                  </article>
                ))}
              </div>
            </Panel>
          </div>

          <aside className={styles.secondaryColumn}>
            <Panel className={styles.goal}>
              <SectionHeading
                title="Objetivo de lectura"
                action={<span>{catalog.profile.goal.year}</span>}
              />
              <div className={styles.goalRing}>
                <strong>{catalog.profile.goal.read}</strong>
                <small>de {catalog.profile.goal.target} libros</small>
              </div>
              <div className={styles.progress}>
                <span />
              </div>
              <p>
                ¡Te faltan{' '}
                {catalog.profile.goal.target - catalog.profile.goal.read} libros
                para cumplir tu objetivo!
              </p>
            </Panel>
            <Panel className={styles.streak}>
              <div className={styles.flame}>♨</div>
              <div>
                <strong>{catalog.profile.streak.current} días de racha</strong>
                <p>Tu mejor racha: {catalog.profile.streak.best} días</p>
              </div>
              <div className={styles.week}>
                {catalog.profile.week.map((day, index) => (
                  <span
                    className={
                      index < catalog.profile.streak.completedDays
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
                  <select defaultValue="Buenos Aires">
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
            </Panel>
          </div>
        ) : null}
      </PrototypePage>
    </BaseLayout>
  )
}
