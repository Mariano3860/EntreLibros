import { FormBase } from '@components/form/base/FormBase'
import type { FormField } from '@components/form/base/FormBase.types'
import { useContactForm } from '@hooks/api/useContactForm'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './ContactForm.module.scss'
import { ContactFormData } from './ContactForm.types'

export const ContactForm: React.FC = () => {
  const { t } = useTranslation()
  const formRef = useRef<{ resetForm: () => void }>(null)
  const { mutate, isPending } = useContactForm(() => {
    formRef.current?.resetForm() // Reset directo en éxito
  })

  const handleContactSubmit = (formData: Record<string, string>) => {
    const parsed: ContactFormData = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
    }
    mutate(parsed)
  }

  const fields: FormField[] = [
    {
      name: 'name',
      label: 'contact.name_label',
      type: 'text',
      required: true,
      minLength: 2,
      placeholder: 'contact.name_placeholder',
    },
    {
      name: 'email',
      label: 'contact.email_label',
      type: 'email',
      required: true,
      placeholder: 'contact.email_placeholder',
    },
    {
      name: 'message',
      label: 'contact.message_label',
      type: 'textarea',
      required: true,
      minLength: 10,
      placeholder: 'contact.message_placeholder',
    },
  ]

  return (
    <div className={styles.contactFormWrapper}>
      <h2 className={styles.contactFormTitle}>{t('contact.title')}</h2>
      <FormBase
        ref={formRef}
        fields={fields}
        onSubmit={handleContactSubmit}
        submitLabel="contact.submit_button"
        isSubmitting={isPending}
      />
    </div>
  )
}
