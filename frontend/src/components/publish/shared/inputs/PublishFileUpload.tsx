import React, { ChangeEvent } from 'react'

import styles from './PublishField.module.scss'

export type PublishFilePreview = {
  id: string
  url: string
  alt?: string
}

type PublishFileUploadProps = {
  id: string
  label: string
  hint?: string
  error?: string
  buttonLabel: string
  accept?: string
  multiple?: boolean
  previews?: PublishFilePreview[]
  onFilesSelected: (files: FileList | null) => void
  onRemoveFile?: (id: string) => void
  containerClassName?: string
  removeLabel?: string
  onDropFiles?: (files: FileList) => void
}

export const PublishFileUpload: React.FC<PublishFileUploadProps> = ({
  id,
  label,
  hint,
  error,
  buttonLabel,
  accept,
  multiple,
  previews,
  onFilesSelected,
  onRemoveFile,
  containerClassName,
  removeLabel,
  onDropFiles,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(event.target.files)
    event.target.value = ''
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!onDropFiles) return
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer.files?.length) {
      onDropFiles(event.dataTransfer.files)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!onDropFiles) return
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div className={`${styles.field} ${containerClassName ?? ''}`.trim()}>
      <span className={styles.label}>{label}</span>
      <div
        className={styles.upload}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <label htmlFor={id} className={styles.uploadButton} role="button">
          {buttonLabel}
        </label>
        <input
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />
        {hint ? <p className={styles.hint}>{hint}</p> : null}
      </div>
      {previews && previews.length > 0 ? (
        <div className={styles.previewList}>
          {previews.map((preview) => (
            <div key={preview.id} className={styles.previewItem}>
              <img src={preview.url} alt={preview.alt ?? ''} />
              {onRemoveFile ? (
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => onRemoveFile(preview.id)}
                  aria-label={removeLabel ?? preview.alt ?? 'Eliminar'}
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {error ? (
        <span role="alert" className={styles.errorMessage}>
          {error}
        </span>
      ) : null}
    </div>
  )
}
