import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'

import type { PrototypeBook } from './catalog'
import styles from './PrototypeUI.module.scss'

export const PrototypePage = ({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) => <div className={`${styles.page} ${className}`}>{children}</div>

export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) => (
  <header className={styles.pageHeader}>
    <div>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </div>
    {actions ? <div className={styles.headerActions}>{actions}</div> : null}
  </header>
)

export const Panel = ({
  children,
  className = '',
  as: Element = 'section',
}: {
  children: ReactNode
  className?: string
  as?: 'section' | 'article' | 'div' | 'aside'
}) => <Element className={`${styles.panel} ${className}`}>{children}</Element>

export const SectionHeading = ({
  title,
  action,
}: {
  title: string
  action?: ReactNode
}) => (
  <div className={styles.sectionHeading}>
    <h2>{title}</h2>
    {action}
  </div>
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'small' | 'medium'
}

export const PrototypeButton = ({
  tone = 'secondary',
  size = 'medium',
  className = '',
  ...props
}: ButtonProps) => (
  <button
    {...props}
    className={`${styles.button} ${styles[tone]} ${styles[size]} ${className}`}
  />
)

export const Avatar = ({
  initials,
  imageUrl,
  accent = '#42d7c7',
  size = 'medium',
  online = false,
}: {
  initials: string
  imageUrl?: string | null
  accent?: string
  size?: 'small' | 'medium' | 'large' | 'hero'
  online?: boolean
}) => {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(imageUrl?.trim() && !imageFailed)

  useEffect(() => {
    setImageFailed(false)
  }, [imageUrl])

  return (
    <span
      className={`${styles.avatar} ${styles[`avatar${size}`]} ${online ? styles.online : ''}`}
      style={{ '--avatar-accent': accent } as React.CSSProperties}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={imageUrl ?? undefined}
          alt=""
          className={styles.avatarImage}
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  )
}

export const BookCover = ({
  book,
  compact = false,
}: {
  book: PrototypeBook
  compact?: boolean
}) => {
  const [coverFailed, setCoverFailed] = useState(false)
  const coverUrl = book.coverUrl?.trim()
  const showCover = Boolean(coverUrl && !coverFailed)

  useEffect(() => {
    setCoverFailed(false)
  }, [coverUrl])

  return (
    <div
      className={`${styles.bookCover} ${compact ? styles.bookCoverCompact : ''}`}
      style={{ '--book-accent': book.accent } as React.CSSProperties}
    >
      {showCover ? (
        <img
          src={coverUrl}
          alt=""
          className={styles.bookCoverImage}
          onError={() => setCoverFailed(true)}
        />
      ) : (
        <>
          <span>{book.genre}</span>
          <strong>{book.title}</strong>
          <small>{book.author}</small>
        </>
      )}
    </div>
  )
}

export const PrototypeBookCard = ({
  book,
  decorative = false,
  onClick,
}: {
  book: PrototypeBook
  decorative?: boolean
  onClick?: () => void
}) => (
  <article className={styles.bookCard}>
    <button
      onClick={onClick}
      className={styles.bookCardButton}
      aria-label={`Ver ${book.title}`}
      disabled={decorative}
      tabIndex={decorative ? -1 : undefined}
    >
      <BookCover book={book} />
      <div className={styles.bookCardBody}>
        <span className={styles.bookMode}>
          {book.mode === 'Buscado' ? 'Lista de deseos' : book.mode}
        </span>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
        <div className={styles.bookMeta}>
          <span>{book.owner}</span>
          <span>{book.distance}</span>
        </div>
        <div className={styles.bookFooter}>
          <strong>
            {book.mode === 'Buscado'
              ? 'Buscando'
              : (book.price ?? 'Disponible')}
          </strong>
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </button>
  </article>
)

export const KpiCard = ({
  icon,
  value,
  label,
  tone,
  change,
}: {
  icon: string
  value: string
  label: string
  tone: string
  change?: string
}) => (
  <Panel className={styles.kpiCard}>
    <span
      className={`${styles.kpiIcon} ${styles[`tone${tone}`]}`}
      aria-hidden="true"
    >
      {icon}
    </span>
    <div>
      <strong>{value}</strong>
      <p>{label}</p>
    </div>
    {change ? <span className={styles.kpiChange}>{change}</span> : null}
  </Panel>
)

export const Chip = ({
  children,
  active = false,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}) => (
  <button
    className={`${styles.chip} ${active ? styles.chipActive : ''}`}
    onClick={onClick}
    aria-pressed={active}
  >
    {children}
  </button>
)

export const FixtureState = ({
  region,
  children,
}: {
  region: string
  children: ReactNode
}) => {
  const [fixture, setFixture] = useState(() =>
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('fixture')
  )
  const [target, state] = fixture?.includes(':')
    ? fixture.split(':')
    : ['all', fixture]
  const applies = target === 'all' || target === region
  if (!applies || !state) return children
  if (state === 'loading')
    return (
      <Panel className={styles.state}>
        <span className={styles.spinner} />
        Cargando {region}…
      </Panel>
    )
  if (state === 'empty')
    return (
      <Panel className={styles.state}>
        <strong>Todavía no hay contenido</strong>
        <span>Cuando haya novedades aparecerán en esta sección.</span>
      </Panel>
    )
  if (state === 'error')
    return (
      <div className={`${styles.panel} ${styles.state}`} role="alert">
        <strong>No pudimos cargar esta sección</strong>
        <span>El resto de la pantalla sigue disponible.</span>
        <PrototypeButton
          onClick={() => {
            const url = new URL(window.location.href)
            url.searchParams.delete('fixture')
            window.history.replaceState({}, '', `${url.pathname}${url.search}`)
            setFixture(null)
          }}
        >
          Reintentar
        </PrototypeButton>
      </div>
    )
  return children
}

export const UnavailableState = ({
  title = 'Esta sección todavía no está disponible',
  description = 'Estamos conectando esta experiencia con datos reales.',
}: {
  title?: string
  description?: string
}) => (
  <Panel className={styles.state}>
    <strong>{title}</strong>
    <span>{description}</span>
  </Panel>
)

export const MiniMap = ({ large = false }: { large?: boolean }) => (
  <div
    className={`${styles.miniMap} ${large ? styles.miniMapLarge : ''}`}
    aria-label="Mapa de rincones cercanos"
    role="img"
  >
    <span className={styles.roadA} />
    <span className={styles.roadB} />
    <span className={`${styles.mapPin} ${styles.pinA}`}>⌖</span>
    <span className={`${styles.mapPin} ${styles.pinB}`}>⌖</span>
    <span className={`${styles.mapPin} ${styles.pinC}`}>⌖</span>
    <span className={styles.userPin}>
      <span>●</span>
    </span>
  </div>
)
