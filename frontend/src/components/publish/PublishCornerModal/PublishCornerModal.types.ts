import {
  PublishCornerPayload,
  PublishCornerScope,
  PublishCornerStatus,
  PublishCornerVisibility,
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
  country: string
  province: string
  city: string
  neighborhood: string
  reference: string
  visibility: PublishCornerVisibility
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
