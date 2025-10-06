import { PublishFileUpload } from '@components/publish/shared'
import React from 'react'

import type { PublishCornerFormState } from '../PublishCornerModal.types'

import type { LocationStepErrors } from './LocationStep.types'

type LocationPhotoUploadProps = {
  t: (key: string) => string
  state: PublishCornerFormState
  errors: LocationStepErrors
  onPhotoSelect: (files: FileList | null) => void
  onRemovePhoto: () => void
}

export const LocationPhotoUpload: React.FC<LocationPhotoUploadProps> = ({
  t,
  state,
  errors,
  onPhotoSelect,
  onRemovePhoto,
}) => {
  return (
    <PublishFileUpload
      id="corner-photo"
      label={t('publishCorner.fields.photo')}
      buttonLabel={t('publishCorner.fields.photoCta')}
      hint={t('publishCorner.fields.photoHint') ?? undefined}
      accept="image/*"
      multiple={false}
      previews={state.photo ? [state.photo] : []}
      onFilesSelected={onPhotoSelect}
      onDropFiles={(files) => onPhotoSelect(files)}
      onRemoveFile={() => onRemovePhoto()}
      removeLabel={t('publishCorner.fields.photoRemove') ?? ''}
      error={errors.photo}
    />
  )
}
