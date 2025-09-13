import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { SocketMessages } from '@components/messages/SocketMessages'
import styles from '@pages/messages/MessagesPage.module.scss'

export const MessagesPage = () => (
  <BaseLayout
    className={styles.messagesContainer}
    mainClassName={styles.messagesContent}
    id={'messages-page'}
  >
    <SocketMessages />
  </BaseLayout>
)
