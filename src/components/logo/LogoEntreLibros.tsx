import { ReactComponent as Logo } from '@assets/icons/logo.svg'
import React from 'react'
import { Link } from 'react-router-dom'

import styles from './LogoEntreLibros.module.scss'

type LogoEntreLibrosProps = {
  withText?: boolean
  className?: string
  redirectTo?: string
}

export const LogoEntreLibros: React.FC<LogoEntreLibrosProps> = ({
  withText = true,
  className = '',
  redirectTo,
}) => {
  const content = (
    <>
      <Logo className={styles.icon} />
      {withText && <span className={styles.text}>EntreLibros</span>}
    </>
  )

  return (
    <div className={`${styles.logoWrapper} ${className}`}>
      {redirectTo ? (
        <Link to={redirectTo} className={styles.logoLink}>
          {content}
        </Link>
      ) : (
        <span className={styles.logoLink}>{content}</span>
      )}
    </div>
  )
}
