import React, {
  ChangeEvent,
  FormEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'

import styles from './FormBase.module.scss'
import { FormBaseProps, FormBaseRef, FormField } from './FormBase.types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const FormBase = forwardRef<FormBaseRef, FormBaseProps>(
  ({ fields, onSubmit, submitLabel, isSubmitting = false }, ref) => {
    const { t } = useTranslation()

    // Calculamos el estado inicial usando useMemo
    const initialFormState = useMemo(() => {
      return fields.reduce(
        (acc, field) => {
          acc[field.name] = ''
          return acc
        },
        {} as Record<string, string>
      )
    }, [fields])

    const [formData, setFormData] =
      useState<Record<string, string>>(initialFormState)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const prevFieldNamesRef = useRef<string[]>(fields.map((f) => f.name))
    useEffect(() => {
      const currentFieldNames = fields.map((f) => f.name)
      const prevFieldNames = prevFieldNamesRef.current
      const fieldNamesChanged =
        prevFieldNames.length !== currentFieldNames.length ||
        prevFieldNames.some((name, idx) => name !== currentFieldNames[idx])

      if (fieldNamesChanged) {
        setFormData(initialFormState)
        setErrors({})
        prevFieldNamesRef.current = currentFieldNames
      }
    }, [fields, initialFormState])

    const handleChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const validate = (): boolean => {
      const newErrors: Record<string, string> = {}

      fields.forEach((field) => {
        const value = formData[field.name]

        if (field.required && !value) {
          newErrors[field.name] = t('form.errors.required')
          return
        }

        if (field.type === 'email' && value && !EMAIL_REGEX.test(value)) {
          newErrors[field.name] = t('form.errors.invalid_email')
          return
        }

        if (field.minLength && value.length < field.minLength) {
          newErrors[field.name] = t('form.errors.min_length', {
            count: field.minLength,
          })
        }
      })

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (isSubmitting) return // Evitar múltiples envíos
      if (!validate()) return
      onSubmit(formData)
    }

    // Función para resetear el formulario
    const resetForm = () => {
      setFormData(initialFormState)
      setErrors({})
    }

    const getAutoComplete = (field: FormField): string => {
      if (field.type === 'email') return 'email'
      if (field.name.toLowerCase().includes('name')) return 'name'
      return 'off'
    }

    // Expose resetForm through the ref
    useImperativeHandle(ref, () => ({
      resetForm,
    }))

    return (
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div key={field.name} className={styles.formField}>
            <label className={styles.label} htmlFor={field.name}>
              {t(field.label)}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                className={styles.textarea}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder ? t(field.placeholder) : ''}
                autoComplete={getAutoComplete(field)}
                disabled={isSubmitting} // Disable during submission
              />
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                className={styles.input}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder ? t(field.placeholder) : ''}
                autoComplete={getAutoComplete(field)}
                disabled={isSubmitting} // Disable during submission
              />
            )}

            {errors[field.name] && (
              <span className={styles.error}>{errors[field.name]}</span>
            )}
          </div>
        ))}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting} // Deshabilitar durante envío
        >
          {isSubmitting
            ? t('form.submitting')
            : t(submitLabel || 'form.submit')}
        </button>
      </form>
    )
  }
)
