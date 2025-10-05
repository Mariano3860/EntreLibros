import React from 'react'

import styles from './PublishField.module.scss'

type PublishTextareaFieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  containerClassName?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const PublishTextareaField = React.forwardRef<
  HTMLTextAreaElement,
  PublishTextareaFieldProps
>(({ id, label, hint, error, containerClassName, ...props }, ref) => {
  return (
    <div className={`${styles.field} ${containerClassName ?? ''}`.trim()}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        className={styles.textarea}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      {error ? (
        <span role="alert" className={styles.errorMessage}>
          {error}
        </span>
      ) : null}
    </div>
  )
})

PublishTextareaField.displayName = 'PublishTextareaField'
