import { fireEvent, screen, waitFor } from '@testing-library/react'
import { server } from '@mocks/server'
import { createCornerValidationHandler } from '@mocks/handlers/community/corners.handler'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { PublishCornerModal } from '@components/publish/PublishCornerModal'
import { PublishCornerDraftState } from '@components/publish/PublishCornerModal/PublishCornerModal.types'
import { DraftWithMeta } from '@utils/drafts'

import { renderWithProviders } from '../../test-utils'

type MockDraftApi = {
  draft: DraftWithMeta<PublishCornerDraftState> | null
  saveNow: ReturnType<typeof vi.fn>
  scheduleSave: ReturnType<typeof vi.fn>
  clear: ReturnType<typeof vi.fn>
}

const { mockUseFocusTrap } = vi.hoisted(() => ({
  mockUseFocusTrap: vi.fn(),
}))
vi.mock('@hooks/useFocusTrap', () => ({
  useFocusTrap: mockUseFocusTrap,
}))

const { mockUsePublishDraft } = vi.hoisted(() => ({
  mockUsePublishDraft: vi.fn(),
}))
let draftApi: MockDraftApi
vi.mock('@hooks/usePublishDraft', () => ({
  usePublishDraft: (...args: unknown[]) => mockUsePublishDraft(...args),
}))

const { toastInfo, toastSuccess, toastError } = vi.hoisted(() => ({
  toastInfo: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))
vi.mock('react-toastify', () => ({
  toast: {
    info: (...args: unknown[]) => toastInfo(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}))

const renderModal = () => {
  const onClose = vi.fn()
  const onCreated = vi.fn()
  const result = renderWithProviders(
    <PublishCornerModal isOpen onClose={onClose} onCreated={onCreated} />
  )
  return { ...result, onClose, onCreated }
}

const fillDetailsStep = () => {
  fireEvent.change(screen.getByLabelText('publishCorner.fields.name'), {
    target: { value: 'Rincón Central' },
  })
  fireEvent.change(screen.getByLabelText('publishCorner.fields.hostAlias'), {
    target: { value: 'Anfitriona' },
  })
  fireEvent.change(
    screen.getByLabelText('publishCorner.fields.internalContact'),
    { target: { value: 'contacto@entrelibros.org' } }
  )
}

const setupFileReaderMock = () => {
  const original = globalThis.FileReader
  class FileReaderMock {
    public result: string | ArrayBuffer | null = null
    public onload: null | ((event: ProgressEvent<FileReader>) => void) = null
    public onerror: null | ((event: ProgressEvent<FileReader>) => void) = null

    public readAsDataURL(file: File) {
      this.result = `data:mock/${file.name}`
      this.onload?.({} as ProgressEvent<FileReader>)
    }
  }
  globalThis.FileReader = FileReaderMock as unknown as typeof FileReader
  return () => {
    globalThis.FileReader = original
  }
}

const uploadPhoto = () => {
  const restore = setupFileReaderMock()
  const fileInput = screen.getByLabelText('publishCorner.fields.photoCta')
  const file = new File(['binary'], 'corner.jpg', { type: 'image/jpeg' })
  fireEvent.change(fileInput, { target: { files: [file] } })
  return restore
}

const fillLocationStep = (options?: { consent?: boolean }) => {
  fireEvent.change(screen.getByLabelText('publishCorner.fields.country'), {
    target: { value: 'Argentina' },
  })
  fireEvent.change(screen.getByLabelText('publishCorner.fields.province'), {
    target: { value: 'Buenos Aires' },
  })
  fireEvent.change(screen.getByLabelText('publishCorner.fields.city'), {
    target: { value: 'La Plata' },
  })
  fireEvent.change(screen.getByLabelText('publishCorner.fields.neighborhood'), {
    target: { value: 'Centro' },
  })
  fireEvent.change(screen.getByLabelText('publishCorner.fields.reference'), {
    target: { value: 'Frente a la plaza Moreno' },
  })

  if (options?.consent) {
    fireEvent.click(screen.getByLabelText('publishCorner.fields.consent'))
  }
}

describe('PublishCornerModal', () => {
  beforeEach(() => {
    toastInfo.mockReset()
    toastSuccess.mockReset()
    toastError.mockReset()
    mockUseFocusTrap.mockReset()
    draftApi = {
      draft: null,
      saveNow: vi.fn(),
      scheduleSave: vi.fn(),
      clear: vi.fn(),
    }
    mockUsePublishDraft.mockReturnValue(draftApi)
  })

  test('requires details before progressing to the next step', () => {
    renderModal()

    const nextButton = screen.getByRole('button', {
      name: 'publishCorner.actions.next',
    })
    expect(nextButton).toBeDisabled()
    expect(screen.getByText('publishCorner.errors.name')).toBeInTheDocument()

    fillDetailsStep()

    expect(
      screen.queryByText('publishCorner.errors.name')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('publishCorner.errors.hostAlias')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('publishCorner.errors.internalContact')
    ).not.toBeInTheDocument()

    expect(nextButton).not.toBeDisabled()

    fireEvent.click(nextButton)
    expect(
      screen.getByLabelText('publishCorner.fields.country')
    ).toBeInTheDocument()
  })

  test('validates location reference and keeps publish disabled without consent', () => {
    renderModal()
    fillDetailsStep()
    fireEvent.click(
      screen.getByRole('button', { name: 'publishCorner.actions.next' })
    )

    fireEvent.change(screen.getByLabelText('publishCorner.fields.reference'), {
      target: { value: 'Calle 123' },
    })
    expect(
      screen.getByText('publishCorner.errors.referenceDigits')
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('publishCorner.fields.reference'), {
      target: { value: 'Frente a la plaza Moreno' },
    })
    expect(
      screen.queryByText('publishCorner.errors.referenceDigits')
    ).not.toBeInTheDocument()

    const restoreFileReader = uploadPhoto()

    fillLocationStep()

    fireEvent.click(
      screen.getByRole('button', { name: 'publishCorner.actions.next' })
    )

    let publishButton = screen.getByRole('button', {
      name: 'publishCorner.actions.publish',
    })
    expect(publishButton).toBeDisabled()

    fireEvent.click(
      screen.getByRole('button', { name: 'publishCorner.actions.back' })
    )
    fireEvent.click(screen.getByLabelText('publishCorner.fields.consent'))
    fireEvent.click(
      screen.getByRole('button', { name: 'publishCorner.actions.next' })
    )

    publishButton = screen.getByRole('button', {
      name: 'publishCorner.actions.publish',
    })
    expect(publishButton).not.toBeDisabled()
    restoreFileReader()
  })

  test('publishes a corner successfully and clears the draft', async () => {
    const { onClose, onCreated } = renderModal()
    fillDetailsStep()
    fireEvent.click(
      screen.getByRole('button', { name: 'publishCorner.actions.next' })
    )

    const restoreFileReader = uploadPhoto()
    fillLocationStep({ consent: true })

    fireEvent.click(
      screen.getByRole('button', { name: 'publishCorner.actions.next' })
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'publishCorner.actions.publish' })
    )

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith('publishCorner.published')
    })

    expect(onCreated).toHaveBeenCalledWith(expect.any(String))
    expect(onClose).toHaveBeenCalled()
    expect(draftApi.clear).toHaveBeenCalled()
    restoreFileReader()
  })

  test('shows an error toast when the API returns validation errors', async () => {
    server.use(createCornerValidationHandler)

    const { onCreated } = renderModal()
    fillDetailsStep()
    fireEvent.click(
      screen.getByRole('button', { name: 'publishCorner.actions.next' })
    )

    const restoreFileReader = uploadPhoto()
    fillLocationStep({ consent: true })

    fireEvent.click(
      screen.getByRole('button', { name: 'publishCorner.actions.next' })
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'publishCorner.actions.publish' })
    )

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith('publishCorner.errors.publish')
    })

    expect(onCreated).not.toHaveBeenCalled()
    expect(toastSuccess).not.toHaveBeenCalled()
    restoreFileReader()
  })
})
