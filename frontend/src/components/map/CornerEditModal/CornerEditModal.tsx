import {
  PublishModal,
  PublishModalActions,
  PublishSegmentedControl,
  PublishTextField,
  PublishTextareaField,
} from '@components/publish/shared'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type {
  CommunityCornerDetail,
  UpdateCornerPayload,
} from '@src/api/community/corners.types'

import styles from './CornerEditModal.module.scss'

type CornerEditModalProps = {
  corner: CommunityCornerDetail
  isSaving?: boolean
  onClose: () => void
  onSave: (payload: UpdateCornerPayload) => Promise<void>
}

export const CornerEditModal = ({
  corner,
  isSaving = false,
  onClose,
  onSave,
}: CornerEditModalProps) => {
  const { t } = useTranslation()
  const [name, setName] = useState(corner.name)
  const [rules, setRules] = useState(corner.rules ?? '')
  const [schedule, setSchedule] = useState(corner.schedule ?? '')
  const [status, setStatus] = useState(corner.status)
  const [visibilityPreference, setVisibilityPreference] = useState<
    NonNullable<UpdateCornerPayload['visibilityPreference']>
  >(corner.visibilityPreference)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    if (!name.trim()) {
      setError(t('map.cornerDetail.nameRequired'))
      return
    }
    setError(null)
    try {
      await onSave({
        name: name.trim(),
        rules: rules.trim() || null,
        schedule: schedule.trim() || null,
        status,
        visibilityPreference,
      })
    } catch {
      setError(t('map.cornerDetail.updateError'))
    }
  }

  return (
    <PublishModal
      isOpen
      title={t('map.cornerDetail.editTitle')}
      subtitle={corner.name}
      onClose={onClose}
      closeLabel={t('map.cornerDetail.cancel')}
      className={styles.modal}
      footer={
        <PublishModalActions
          leftActions={[
            {
              label: t('map.cornerDetail.cancel'),
              onClick: onClose,
              disabled: isSaving,
              variant: 'ghost',
            },
          ]}
          rightActions={[
            {
              label: isSaving
                ? t('map.cornerDetail.saving')
                : t('map.cornerDetail.save'),
              onClick: () => void save(),
              disabled: isSaving,
              variant: 'primary',
              dataTestId: 'corner-save-button',
            },
          ]}
        />
      }
    >
      <div className={styles.form}>
        <PublishTextField
          id="corner-edit-name"
          label={t('publishCorner.fields.name')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={error ?? undefined}
          required
        />
        <PublishTextareaField
          id="corner-edit-rules"
          label={t('publishCorner.fields.rules')}
          value={rules}
          onChange={(event) => setRules(event.target.value)}
        />
        <PublishTextareaField
          id="corner-edit-schedule"
          label={t('publishCorner.fields.schedule')}
          value={schedule}
          onChange={(event) => setSchedule(event.target.value)}
        />
        <PublishSegmentedControl
          id="corner-edit-status"
          label={t('publishCorner.fields.status')}
          value={status}
          options={[
            {
              value: 'active' as const,
              label: t('publishCorner.status.active'),
            },
            {
              value: 'paused' as const,
              label: t('publishCorner.status.paused'),
            },
          ]}
          onChange={setStatus}
        />
        <PublishSegmentedControl
          id="corner-edit-visibility"
          label={t('publishCorner.fields.visibilityPreference')}
          value={visibilityPreference}
          options={[
            {
              value: 'exact' as const,
              label: t('publishCorner.visibilityPreference.exact'),
            },
            {
              value: 'approximate' as const,
              label: t('publishCorner.visibilityPreference.approximate'),
            },
          ]}
          onChange={setVisibilityPreference}
        />
        <p className={styles.notice}>{t('map.cornerDetail.privacyNote')}</p>
      </div>
    </PublishModal>
  )
}
