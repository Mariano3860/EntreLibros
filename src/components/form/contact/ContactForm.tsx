import { FormBase } from '@components/form/base/FormBase'
import type { FormField } from '@components/form/base/FormBase.types'
import { useTranslation } from 'react-i18next'

import styles from './ContactForm.module.scss'
import { ContactFormData } from './ContactForm.types'

export const ContactForm: React.FC = () => {
  const { t } = useTranslation()

  const handleContactSubmit = (formData: Record<string, string>) => {
    const parsed: ContactFormData = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
    }
    // TODO return parsed in a toaster
    /* eslint-disable no-console */
    console.log('Mensaje de contacto enviado:', parsed)
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
        fields={fields}
        onSubmit={handleContactSubmit}
        submitLabel="contact.submit_button"
      />
    </div>
  )
}
