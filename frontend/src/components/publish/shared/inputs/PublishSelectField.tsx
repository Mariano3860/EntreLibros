import React from 'react'

import styles from './PublishField.module.scss'

type PublishSelectFieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  containerClassName?: string
  children: React.ReactNode
} & React.SelectHTMLAttributes<HTMLSelectElement>

export const PublishSelectField = React.forwardRef<
  HTMLSelectElement,
  PublishSelectFieldProps
>(({ id, label, hint, error, containerClassName, children, ...props }, ref) => {
  return (
    <div className={`${styles.field} ${containerClassName ?? ''}`.trim()}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <select
        ref={ref}
        id={id}
        className={styles.select}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        {children}
      </select>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      {error ? (
        <span role="alert" className={styles.errorMessage}>
          {error}
        </span>
      ) : null}
    </div>
  )
})

PublishSelectField.displayName = 'PublishSelectField'
