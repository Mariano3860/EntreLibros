import styles from './Toggle.module.scss'
import { ToggleProps } from './Toggle.types'

export const Toggle = ({
  isActive,
  onToggle,
  ariaLabel,
  className = '',
}: ToggleProps) => {
  return (
    <button
      role="switch"
      aria-checked={isActive}
      aria-label={ariaLabel}
      className={`${styles.toggle} ${className} ${isActive ? styles.active : ''}`}
      onClick={onToggle}
    >
      <span className={styles.thumb} />
    </button>
  )
}
