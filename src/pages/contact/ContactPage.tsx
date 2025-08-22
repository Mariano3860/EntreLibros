import { ContactForm } from '@components/forms/contact/ContactForm'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'

import styles from './ContactPage.module.scss'

export const ContactPage = () => {
  return (
    <BaseLayout id={'contact-page'}>
      <div className={styles.contactPageWrapper}>
        <div className={styles.formContainer}>
          <ContactForm />
        </div>
      </div>
    </BaseLayout>
  )
}
