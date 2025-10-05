import React from 'react'

import styles from './PublishField.module.scss'

type PublishTextFieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  containerClassName?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export const PublishTextField = React.forwardRef<
  HTMLInputElement,
  PublishTextFieldProps
>(({ id, label, hint, error, containerClassName, ...inputProps }, ref) => {
  return (
    <div className={`${styles.field} ${containerClassName ?? ''}`.trim()}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={styles.input}
        aria-invalid={error ? 'true' : 'false'}
        {...inputProps}
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

PublishTextField.displayName = 'PublishTextField'
