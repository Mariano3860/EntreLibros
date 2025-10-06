import React from 'react'

import { cx } from '@src/utils/cx'

import styles from './PublishModalActions.module.scss'

export type PublishModalAction = {
  label: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: React.ReactNode
  ariaLabel?: string
  dataTestId?: string
}

type PublishModalActionsProps = {
  leftActions?: PublishModalAction[]
  rightActions?: PublishModalAction[]
}

const getVariantClass = (variant: PublishModalAction['variant']) => {
  switch (variant) {
    case 'primary':
      return styles.primary
    case 'ghost':
      return styles.ghost
    case 'secondary':
    default:
      return styles.secondary
  }
}

export const PublishModalActions: React.FC<PublishModalActionsProps> = ({
  leftActions,
  rightActions,
}) => {
  const renderActions = (actions?: PublishModalAction[]) =>
    actions?.map((action) => (
      <button
        key={action.label}
        type={action.type ?? 'button'}
        className={cx(styles.button, getVariantClass(action.variant))}
        onClick={action.onClick}
        disabled={action.disabled}
        aria-label={action.ariaLabel}
        data-testid={action.dataTestId}
      >
        {action.icon}
        {action.label}
      </button>
    ))

  return (
    <div className={styles.actions}>
      <div className={styles.group}>{renderActions(leftActions)}</div>
      <div className={styles.group}>{renderActions(rightActions)}</div>
    </div>
  )
}
