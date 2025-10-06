import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, test, vi } from 'vitest'

import type { PublishCornerFormState } from '@components/publish/PublishCornerModal/PublishCornerModal.types'
import { LocationPhotoUpload } from '@components/publish/PublishCornerModal/components/LocationPhotoUpload'
import type { LocationStepErrors } from '@components/publish/PublishCornerModal/components/LocationStep.types'

type MockFileUploadProps = {
  previews?: Array<{ id: string; url: string; alt?: string }>
  hint?: string
  removeLabel?: string
  onFilesSelected?: (files: FileList | null) => void
  onDropFiles?: (files: FileList) => void
  onRemoveFile?: (id: string) => void
}

const renderMock = vi.fn<(props: MockFileUploadProps) => void>()

vi.mock('@components/publish/shared', () => ({
  PublishFileUpload: (props: MockFileUploadProps) => {
    renderMock(props)
    return (
      <div data-testid="mock-file-upload">
        {(props.previews?.length ?? 0) > 0 ? (
          <span data-testid="preview-present">preview</span>
        ) : null}
        {props.hint ? <span data-testid="hint">{props.hint}</span> : null}
        <span data-testid="remove-label">{props.removeLabel}</span>
      </div>
    )
  },
}))

type Props = {
  state?: Partial<PublishCornerFormState>
  errors?: LocationStepErrors
  onPhotoSelect?: (files: FileList | null) => void
  onRemovePhoto?: () => void
  t?: (key: string) => string
}

const baseState: PublishCornerFormState = {
  step: 'location',
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
  addressSearch: '',
  latitude: '',
  longitude: '',
  visibilityPreference: 'exact',
  photo: null,
  consent: false,
  status: 'active',
}

const setup = ({
  state,
  errors,
  onPhotoSelect = vi.fn(),
  onRemovePhoto = vi.fn(),
  t = (key: string) => key,
}: Props = {}) => {
  renderMock.mockReset()

  const mergedState = { ...baseState, ...state }
  const mergedErrors: LocationStepErrors = { ...errors }

  render(
    <LocationPhotoUpload
      t={t}
      state={mergedState}
      errors={mergedErrors}
      onPhotoSelect={onPhotoSelect}
      onRemovePhoto={onRemovePhoto}
    />
  )

  const lastCall = renderMock.mock.calls.at(-1)
  const props = lastCall ? lastCall[0] : {}

  return { onPhotoSelect, onRemovePhoto, mergedState, props }
}

describe('LocationPhotoUpload', () => {
  test('renders uploader without preview and handles selection flows', () => {
    const selectFiles = { length: 1 } as unknown as FileList
    const dropFiles = { length: 2 } as unknown as FileList

    const onPhotoSelect = vi.fn()
    const { props } = setup({ onPhotoSelect })
    expect(props.previews).toHaveLength(0)

    props.onFilesSelected?.(selectFiles)
    props.onDropFiles?.(dropFiles)

    expect(onPhotoSelect).toHaveBeenNthCalledWith(1, selectFiles)
    expect(onPhotoSelect).toHaveBeenNthCalledWith(2, dropFiles)
    expect(screen.getByTestId('hint')).toHaveTextContent(
      'publishCorner.fields.photoHint'
    )
    expect(screen.getByTestId('remove-label')).toHaveTextContent(
      'publishCorner.fields.photoRemove'
    )
  })

  test('shows preview, handles removal and falls back on optional translations', () => {
    const onRemovePhoto = vi.fn()
    const photo = { id: '1', url: 'photo.jpg', alt: 'alt' }
    const t = (key: string) => {
      if (
        key === 'publishCorner.fields.photoHint' ||
        key === 'publishCorner.fields.photoRemove'
      ) {
        return undefined as unknown as string
      }
      return key
    }

    const setupResult = setup({
      state: { photo },
      onRemovePhoto,
      t,
    })
    const { props } = setupResult
    expect(props.previews).toEqual([photo])

    expect(screen.getByTestId('preview-present')).toBeInTheDocument()
    props.onRemoveFile?.(photo.id)
    expect(onRemovePhoto).toHaveBeenCalled()
    expect(screen.queryByTestId('hint')).not.toBeInTheDocument()
    expect(screen.getByTestId('remove-label')).toHaveTextContent('')
  })
})
