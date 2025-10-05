import {
  PublishCornerPayload,
  PublishCornerScope,
  PublishCornerStatus,
  PublishCornerVisibilityPreference,
} from '@api/community/corners.types'
import { PublishFilePreview } from '@components/publish/shared'

export type PublishCornerStep = 'details' | 'location' | 'review'

export type PublishCornerFormState = {
  step: PublishCornerStep
  name: string
  scope: PublishCornerScope
  hostAlias: string
  internalContact: string
  rules: string
  schedule: string
  street: string
  number: string
  unit: string
  postalCode: string
  latitude: string
  longitude: string
  visibilityPreference: PublishCornerVisibilityPreference
  consent: boolean
  photo: PublishFilePreview | null
  status: PublishCornerStatus
}

export type PublishCornerDraftState = PublishCornerFormState

export type PublishCornerReviewEntry = {
  label: string
  value: string
}

export type PublishCornerPayloadInput = PublishCornerPayload
