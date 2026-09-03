import { useEffect, useId, useRef, useState } from 'react'

import styles from './ProfilePage.module.scss'
import {
  clampProfilePhotoFocus,
  profilePhotoObjectPosition,
  type ProfilePhotoFocus,
} from './profilePhoto'

type ProfilePhotoCropperProps = {
  source: string
  focus: ProfilePhotoFocus
  onFocusChange: (focus: ProfilePhotoFocus) => void
  onReset: () => void
  onCancel: () => void
  labels: {
    title: string
    hint: string
    horizontal: string
    vertical: string
    focus: string
    reset: string
    cancel: string
  }
}

export const ProfilePhotoCropper = ({
  source,
  focus,
  onFocusChange,
  onReset,
  onCancel,
  labels,
}: ProfilePhotoCropperProps) => {
  const previewRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [imageDimensions, setImageDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const horizontalId = useId()
  const verticalId = useId()
  const focusGroupId = useId()

  useEffect(() => {
    setImageDimensions(null)
  }, [source])

  const updateFromPointer = (clientX: number, clientY: number) => {
    const preview = previewRef.current
    if (!preview) return
    const bounds = preview.getBoundingClientRect()
    if (bounds.width === 0 || bounds.height === 0) return
    onFocusChange(
      clampProfilePhotoFocus({
        x: (clientX - bounds.left) / bounds.width,
        y: (clientY - bounds.top) / bounds.height,
      })
    )
  }

  return (
    <div className={styles.cropper}>
      <strong>{labels.title}</strong>
      <p>{labels.hint}</p>
      <div
        ref={previewRef}
        className={styles.cropPreview}
        role="img"
        aria-label={labels.title}
        onPointerDown={(event) => {
          draggingRef.current = true
          event.currentTarget.setPointerCapture?.(event.pointerId)
          updateFromPointer(event.clientX, event.clientY)
        }}
        onPointerMove={(event) => {
          if (draggingRef.current) {
            updateFromPointer(event.clientX, event.clientY)
          }
        }}
        onPointerUp={(event) => {
          draggingRef.current = false
          event.currentTarget.releasePointerCapture?.(event.pointerId)
        }}
        onPointerCancel={() => {
          draggingRef.current = false
        }}
      >
        <img
          className={styles.cropImage}
          src={source}
          alt=""
          draggable={false}
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget
            if (naturalWidth > 0 && naturalHeight > 0) {
              setImageDimensions({ width: naturalWidth, height: naturalHeight })
            }
          }}
          style={{
            objectPosition: imageDimensions
              ? profilePhotoObjectPosition(
                  imageDimensions.width,
                  imageDimensions.height,
                  focus
                )
              : `${focus.x * 100}% ${focus.y * 100}%`,
          }}
        />
      </div>
      <div
        className={styles.cropSliders}
        role="group"
        aria-labelledby={focusGroupId}
      >
        <strong id={focusGroupId}>{labels.focus}</strong>
        <label htmlFor={horizontalId}>
          {labels.horizontal}
          <input
            id={horizontalId}
            type="range"
            min="0"
            max="100"
            value={Math.round(focus.x * 100)}
            onChange={(event) =>
              onFocusChange({
                ...focus,
                x: Number(event.target.value) / 100,
              })
            }
          />
        </label>
        <label htmlFor={verticalId}>
          {labels.vertical}
          <input
            id={verticalId}
            type="range"
            min="0"
            max="100"
            value={Math.round(focus.y * 100)}
            onChange={(event) =>
              onFocusChange({
                ...focus,
                y: Number(event.target.value) / 100,
              })
            }
          />
        </label>
      </div>
      <div className={styles.cropActions}>
        <button type="button" onClick={onReset}>
          {labels.reset}
        </button>
        <button type="button" onClick={onCancel}>
          {labels.cancel}
        </button>
      </div>
    </div>
  )
}
