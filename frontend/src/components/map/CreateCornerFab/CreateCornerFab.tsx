import { useTranslation } from 'react-i18next'

import styles from './CreateCornerFab.module.scss'

type CreateCornerFabProps = {
  onClick: () => void
  className?: string
  placement?: 'viewport' | 'map' | 'inline'
}

export const CreateCornerFab = ({
  onClick,
  className = '',
  placement = 'viewport',
}: CreateCornerFabProps) => {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      className={`${styles.fab} ${styles[placement]} ${className}`}
      onClick={onClick}
    >
      ✨ {t('map.cta.createCorner')}
    </button>
  )
}
