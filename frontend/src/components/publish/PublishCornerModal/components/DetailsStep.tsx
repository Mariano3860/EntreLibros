import {
  PublishSegmentedControl,
  PublishTextField,
  PublishTextareaField,
} from '@components/publish/shared'
import { TFunction } from 'i18next'
import React from 'react'

import styles from '../PublishCornerModal.module.scss'
import { PublishCornerFormState } from '../PublishCornerModal.types'

type DetailsStepErrors = Partial<
  Record<'name' | 'hostAlias' | 'internalContact', string>
>

type DetailsStepProps = {
  t: TFunction
  state: PublishCornerFormState
  errors: DetailsStepErrors
  onChange: (update: Partial<PublishCornerFormState>) => void
}

const scopeOptions = [
  { id: 'public', labelKey: 'publishCorner.scope.public' },
  { id: 'semiprivate', labelKey: 'publishCorner.scope.semiprivate' },
] as const

export const DetailsStep: React.FC<DetailsStepProps> = ({
  t,
  state,
  errors,
  onChange,
}) => {
  return (
    <div className={styles.stepLayout}>
      <PublishTextField
        id="corner-name"
        label={t('publishCorner.fields.name')}
        value={state.name}
        onChange={(event) => onChange({ name: event.target.value })}
        error={errors.name}
        required
      />

      <PublishSegmentedControl
        id="corner-scope"
        label={t('publishCorner.fields.scope')}
        value={state.scope}
        options={scopeOptions.map((option) => ({
          value: option.id,
          label: t(option.labelKey),
        }))}
        onChange={(value) =>
          onChange({ scope: value as PublishCornerFormState['scope'] })
        }
      />

      <PublishTextField
        id="corner-host"
        label={t('publishCorner.fields.hostAlias')}
        value={state.hostAlias}
        onChange={(event) => onChange({ hostAlias: event.target.value })}
        error={errors.hostAlias}
        required
      />

      <PublishTextField
        id="corner-contact"
        label={t('publishCorner.fields.internalContact')}
        value={state.internalContact}
        onChange={(event) => onChange({ internalContact: event.target.value })}
        error={errors.internalContact}
        required
      />

      <PublishTextareaField
        id="corner-rules"
        label={t('publishCorner.fields.rules')}
        value={state.rules}
        onChange={(event) => onChange({ rules: event.target.value })}
        hint={t('publishCorner.fields.rulesHint') ?? undefined}
      />

      <PublishTextareaField
        id="corner-schedule"
        label={t('publishCorner.fields.schedule')}
        value={state.schedule}
        onChange={(event) => onChange({ schedule: event.target.value })}
        hint={t('publishCorner.fields.scheduleHint') ?? undefined}
      />
    </div>
  )
}
