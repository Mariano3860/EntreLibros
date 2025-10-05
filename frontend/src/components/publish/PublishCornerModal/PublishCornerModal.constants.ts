import {
  PublishCornerDraftState,
  PublishCornerFormState,
  PublishCornerStep,
} from './PublishCornerModal.types'

export const STORAGE_KEY = 'entrelibros.publish.corner.draft'

export const stepOrder: PublishCornerStep[] = ['details', 'location', 'review']

export const initialState: PublishCornerFormState = {
  step: 'details',
  name: '',
  scope: 'public',
  hostAlias: '',
  internalContact: '',
  rules: '',
  schedule: '',
  street: '',
  number: '',
  unit: '',
  postalCode: '',
  latitude: '',
  longitude: '',
  visibilityPreference: 'exact',
  consent: false,
  photo: null,
  status: 'active',
}

export const toSerializableDraft = (
  state: PublishCornerFormState
): PublishCornerDraftState => ({
  ...state,
  photo: state.photo ? { ...state.photo } : null,
})
