import { agreementEvents, type AgreementSnapshot } from '../repositories/agreementRepository.js';
import { createNotification } from '../repositories/notificationRepository.js';
import { query } from '../db.js';

export async function notifyMessageRecipients(input: { messageId: number; conversationId: number; senderId: number }): Promise<void> {
  const { rows } = await query<{ user_id: number }>(
    `SELECT user_id FROM conversation_participants
     WHERE conversation_id = $1 AND user_id <> $2`,
    [input.conversationId, input.senderId]
  );
  await Promise.all(rows.map((row) => createNotification({
    recipientId: row.user_id,
    kind: 'message',
    entityId: String(input.conversationId),
    titleKey: 'notifications.message.title',
    bodyKey: 'notifications.message.body',
    data: { conversationId: input.conversationId },
    idempotencyKey: `message:${input.messageId}:${row.user_id}`,
  })));
}

async function notifyAgreement(agreement: AgreementSnapshot): Promise<void> {
  await Promise.all([agreement.proposerId, agreement.participantId].map((recipientId) =>
    createNotification({
      recipientId,
      kind: 'agreement',
      entityId: String(agreement.id),
      titleKey: 'notifications.agreement.title',
      bodyKey: 'notifications.agreement.body',
      data: { agreementId: agreement.id, conversationId: agreement.conversationId },
      idempotencyKey: `agreement:${agreement.id}:version:${agreement.currentVersion}:user:${recipientId}`,
    })
  ));
}

export function registerNotificationEvents(): void {
  agreementEvents.on('committed', (agreement: AgreementSnapshot) => {
    void notifyAgreement(agreement).catch(() => undefined);
  });
}
