import React from 'react'
import styles from './LogoEntreLibros.module.scss'
import { Logo } from '@/assets'
import { Link } from 'react-router-dom'
import { useTheme } from '@hooks/theme/useTheme'

type LogoEntreLibrosProps = {
  withText?: boolean
  className?: string
}

export const LogoEntreLibros: React.FC<LogoEntreLibrosProps> = ({
  withText = true,
  className = '',
}) => {
  const { theme } = useTheme()

  return (
    <div className={`${styles.logoWrapper} ${className}`}>
      <Link to="/" className={styles.logoLink}>
        <Logo className={styles.icon} />
        {withText && <span className={styles.text}>EntreLibros</span>}
      </Link>
    </div>
  )
}
