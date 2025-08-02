import React from 'react'
import { Link } from 'react-router-dom'

import { Logo } from '@/assets'

import styles from './LogoEntreLibros.module.scss'

type LogoEntreLibrosProps = {
  withText?: boolean
  className?: string
}

export const LogoEntreLibros: React.FC<LogoEntreLibrosProps> = ({
  withText = true,
  className = '',
}) => {
  return (
    <div className={`${styles.logoWrapper} ${className}`}>
      <Link to="/" className={styles.logoLink}>
        <Logo className={styles.icon} />
        {withText && <span className={styles.text}>EntreLibros</span>}
      </Link>
    </div>
  )
}
