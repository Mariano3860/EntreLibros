import { TFunction } from 'i18next'

import { PublishCornerFormState } from '../PublishCornerModal.types'

export type LocationStepErrors = Partial<
  Record<'addressSearch' | 'street' | 'number' | 'photo' | 'consent', string>
>

export type LocationStepProps = {
  t: TFunction
  state: PublishCornerFormState
  errors: LocationStepErrors
  onChange: (update: Partial<PublishCornerFormState>) => void
  onPhotoSelect: (files: FileList | null) => void
  onRemovePhoto: () => void
}
