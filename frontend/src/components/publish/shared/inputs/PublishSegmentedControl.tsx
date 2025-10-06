import React from 'react'

import styles from './PublishField.module.scss'

type PublishSegmentedControlOption<TValue extends string> = {
  label: string
  value: TValue
  description?: string
}

type PublishSegmentedControlProps<TValue extends string> = {
  id: string
  label: string
  value: TValue
  options: PublishSegmentedControlOption<TValue>[]
  onChange: (value: TValue) => void
  hint?: string
  error?: string
  containerClassName?: string
}

export const PublishSegmentedControl = <TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
  hint,
  error,
  containerClassName,
}: PublishSegmentedControlProps<TValue>) => {
  return (
    <div className={`${styles.field} ${containerClassName ?? ''}`.trim()}>
      <span className={styles.label} id={id}>
        {label}
      </span>
      <div className={styles.segmented} role="group" aria-labelledby={id}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={styles.segmentButton}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      {error ? (
        <span role="alert" className={styles.errorMessage}>
          {error}
        </span>
      ) : null}
    </div>
  )
}
