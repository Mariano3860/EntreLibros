import { useTranslation } from 'react-i18next'

import styles from './CreateCornerFab.module.scss'

type CreateCornerFabProps = {
  onClick: () => void
}

export const CreateCornerFab = ({ onClick }: CreateCornerFabProps) => {
  const { t } = useTranslation()

  return (
    <button type="button" className={styles.fab} onClick={onClick}>
      ✨ {t('map.cta.createCorner')}
    </button>
  )
}
