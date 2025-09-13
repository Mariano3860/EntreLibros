import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { Messages } from '@components/messages/Messages'
import styles from '@pages/messages/MessagesPage.module.scss'

export const MessagesPage = () => (
  <BaseLayout
    className={styles.messagesContainer}
    mainClassName={styles.messagesContent}
    id={'messages-page'}
  >
    <Messages />
  </BaseLayout>
)
