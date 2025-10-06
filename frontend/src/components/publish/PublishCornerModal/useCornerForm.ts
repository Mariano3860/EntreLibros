import { PublishCornerPayload } from '@api/community/corners.types'
import { PublishModalAction } from '@components/publish/shared'
import { useCreateCorner } from '@hooks/api/useCreateCorner'
import { useFocusTrap } from '@hooks/useFocusTrap'
import { usePublishDraft } from '@hooks/usePublishDraft'
import { stripDraftMeta } from '@utils/drafts'
import type { TFunction } from 'i18next'
import isEqual from 'lodash/isEqual'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'

import {
  STORAGE_KEY,
  initialState,
  stepOrder,
  toSerializableDraft,
} from './PublishCornerModal.constants'
import type {
  PublishCornerDraftState,
  PublishCornerFormState,
} from './PublishCornerModal.types'

const sanitizeDraft = (
  draft: PublishCornerDraftState | null
): PublishCornerFormState => {
  if (!draft) return initialState
  return {
    ...initialState,
    ...draft,
    photo: draft.photo ? { ...draft.photo } : null,
  }
}

const useBodyScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])
}

const useCornerDraft = () =>
  usePublishDraft<PublishCornerDraftState>({ storageKey: STORAGE_KEY })

type UseCornerFormParams = {
  isOpen: boolean
  onClose: () => void
  onCreated: (cornerId: string) => void
  t: TFunction
}

export const useCornerForm = ({
  isOpen,
  onClose,
  onCreated,
  t,
}: UseCornerFormParams) => {
  const { draft: storedDraft, saveNow, scheduleSave, clear } = useCornerDraft()
  const draft = useMemo(() => stripDraftMeta(storedDraft), [storedDraft])
  const [state, setState] = useState<PublishCornerFormState>(initialState)
  const [autosaveEnabled, setAutosaveEnabled] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const { mutateAsync, isPending } = useCreateCorner()

  const baselineDraft = useMemo(
    () => draft ?? toSerializableDraft(initialState),
    [draft]
  )
  const serializableState = useMemo(() => toSerializableDraft(state), [state])

  useEffect(() => {
    if (!isOpen) {
      setInitialized(false)
      setAutosaveEnabled(true)
      return
    }
    if (initialized) return
    setInitialized(true)
    setState(sanitizeDraft(draft))
  }, [draft, initialized, isOpen])

  useEffect(() => {
    if (!isOpen || !autosaveEnabled) return
    if (isEqual(serializableState, baselineDraft)) return
    scheduleSave(serializableState)
  }, [autosaveEnabled, baselineDraft, isOpen, scheduleSave, serializableState])

  const updateState = useCallback((update: Partial<PublishCornerFormState>) => {
    setAutosaveEnabled(true)
    setState((prev) => ({ ...prev, ...update }))
  }, [])

  const closeWithConfirmation = useCallback(() => {
    const hasChanges = !isEqual(serializableState, baselineDraft)
    if (hasChanges) {
      const confirmed = window.confirm(t('publishCorner.confirmClose'))
      if (!confirmed) {
        return
      }
    }
    onClose()
  }, [baselineDraft, onClose, serializableState, t])

  useFocusTrap({
    containerRef: modalRef,
    active: isOpen,
    onEscape: closeWithConfirmation,
  })
  useBodyScrollLock(isOpen)

  useEffect(() => {
    if (!isOpen) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isEqual(serializableState, baselineDraft)) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [baselineDraft, isOpen, serializableState])

  const handleSaveDraft = useCallback(() => {
    saveNow(serializableState)
    toast.success(t('publishCorner.draftSaved'))
  }, [saveNow, serializableState, t])

  const handlePhotoSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const file = files[0]
      const reader = new FileReader()
      reader.onload = () => {
        updateState({
          photo: {
            id: `${file.name}-${Date.now()}`,
            url: String(reader.result),
            alt: file.name,
          },
        })
      }
      reader.onerror = () => {
        toast.error(t('publishCorner.errors.photoRead'))
      }
      reader.readAsDataURL(file)
    },
    [t, updateState]
  )

  const handleRemovePhoto = useCallback(() => {
    updateState({ photo: null })
  }, [updateState])

  const detailsErrors = useMemo(() => {
    const errors: { [key: string]: string } = {}
    if (!state.name.trim()) {
      errors.name = t('publishCorner.errors.name')
    }
    if (!state.hostAlias.trim()) {
      errors.hostAlias = t('publishCorner.errors.hostAlias')
    }
    if (!state.internalContact.trim()) {
      errors.internalContact = t('publishCorner.errors.internalContact')
    }
    return errors
  }, [state.hostAlias, state.internalContact, state.name, t])

  const locationErrors = useMemo(() => {
    const errors: { [key: string]: string } = {}

    if (!state.street.trim()) {
      errors.street = t('publishCorner.errors.street')
    }

    if (!state.number.trim()) {
      errors.number = t('publishCorner.errors.number')
    }

    const latitude = Number(state.latitude)
    const longitude = Number(state.longitude)

    if (!state.addressSearch.trim()) {
      errors.addressSearch = t('publishCorner.errors.addressSearch')
    } else if (
      !state.latitude.trim() ||
      Number.isNaN(latitude) ||
      !state.longitude.trim() ||
      Number.isNaN(longitude)
    ) {
      errors.addressSearch = t('publishCorner.errors.addressSearch')
    } else if (latitude < -90 || latitude > 90) {
      errors.addressSearch = t('publishCorner.errors.latitudeRange')
    } else if (longitude < -180 || longitude > 180) {
      errors.addressSearch = t('publishCorner.errors.longitudeRange')
    }

    if (!state.photo) {
      errors.photo = t('publishCorner.errors.photo')
    }

    if (!state.consent) {
      errors.consent = t('publishCorner.errors.consent')
    }

    return errors
  }, [
    state.addressSearch,
    state.consent,
    state.latitude,
    state.longitude,
    state.number,
    state.photo,
    state.street,
    t,
  ])

  const canProceedDetails = useMemo(
    () => Object.keys(detailsErrors).length === 0,
    [detailsErrors]
  )

  const canProceedLocation = useMemo(
    () =>
      Object.keys(locationErrors).filter((key) => key !== 'consent').length ===
      0,
    [locationErrors]
  )

  const publishDisabled = useMemo(
    () =>
      isPending ||
      !state.consent ||
      !state.photo ||
      !state.addressSearch.trim() ||
      !state.street.trim() ||
      !state.number.trim() ||
      !state.latitude.trim() ||
      !state.longitude.trim() ||
      !canProceedDetails ||
      !canProceedLocation,
    [
      canProceedDetails,
      canProceedLocation,
      isPending,
      state.addressSearch,
      state.latitude,
      state.longitude,
      state.consent,
      state.photo,
      state.number,
      state.street,
    ]
  )

  const handleNext = useCallback(() => {
    setAutosaveEnabled(true)
    setState((prev) => ({
      ...prev,
      step: prev.step === 'details' ? 'location' : 'review',
    }))
  }, [])

  const handleBack = useCallback(() => {
    setAutosaveEnabled(true)
    setState((prev) => ({
      ...prev,
      step: prev.step === 'review' ? 'location' : 'details',
    }))
  }, [])

  const handlePublish = useCallback(async () => {
    if (!state.photo) return
    const payload: PublishCornerPayload = {
      name: state.name,
      scope: state.scope,
      hostAlias: state.hostAlias,
      internalContact: state.internalContact,
      rules: state.rules || undefined,
      schedule: state.schedule || undefined,
      location: {
        address: {
          street: state.street.trim(),
          number: state.number.trim(),
          unit: state.unit.trim() || undefined,
          postalCode: state.postalCode.trim() || undefined,
        },
        coordinates: {
          latitude: Number(state.latitude),
          longitude: Number(state.longitude),
        },
        visibilityPreference: state.visibilityPreference,
      },
      consent: state.consent,
      photo: {
        id: state.photo.id,
        url: state.photo.url,
      },
      status: state.status,
      draft: false,
    }

    try {
      const created = await mutateAsync(payload)
      toast.success(t('publishCorner.published'))
      clear()
      setState(initialState)
      setAutosaveEnabled(true)
      onCreated(created.id)
      onClose()
    } catch {
      toast.error(t('publishCorner.errors.publish'))
    }
  }, [clear, mutateAsync, onClose, onCreated, state, t])

  const stepperSteps = useMemo(
    () =>
      stepOrder.map((step) => ({
        id: step,
        label: t(`publishCorner.steps.${step}.title`),
        description: t(`publishCorner.steps.${step}.description`),
      })),
    [t]
  )

  const leftActions = useMemo<PublishModalAction[]>(
    () => [
      {
        label: t('publishCorner.actions.cancel'),
        onClick: closeWithConfirmation,
        variant: 'secondary',
      },
      {
        label: t('publishCorner.actions.saveDraft'),
        onClick: handleSaveDraft,
        variant: 'secondary',
      },
    ],
    [closeWithConfirmation, handleSaveDraft, t]
  )

  const rightActions = useMemo<PublishModalAction[]>(() => {
    const actions: PublishModalAction[] = []
    if (state.step !== 'details') {
      actions.push({
        label: t('publishCorner.actions.back'),
        onClick: handleBack,
        variant: 'secondary',
      })
    }

    if (state.step === 'details') {
      actions.push({
        label: t('publishCorner.actions.next'),
        onClick: handleNext,
        variant: 'primary',
        disabled: !canProceedDetails,
      })
    } else if (state.step === 'location') {
      actions.push({
        label: t('publishCorner.actions.next'),
        onClick: handleNext,
        variant: 'primary',
        disabled: !canProceedLocation,
      })
    } else {
      actions.push({
        label: isPending
          ? t('publishCorner.actions.publishing')
          : t('publishCorner.actions.publish'),
        onClick: handlePublish,
        variant: 'primary',
        disabled: publishDisabled,
      })
    }

    return actions
  }, [
    canProceedDetails,
    canProceedLocation,
    handleBack,
    handleNext,
    handlePublish,
    isPending,
    publishDisabled,
    state.step,
    t,
  ])

  return {
    modalRef,
    state,
    updateState,
    detailsErrors,
    locationErrors,
    canProceedDetails,
    canProceedLocation,
    publishDisabled,
    stepperSteps,
    leftActions,
    rightActions,
    handlePhotoSelect,
    handleRemovePhoto,
    closeWithConfirmation,
  }
}
