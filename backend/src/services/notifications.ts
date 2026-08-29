import {
  agreementEvents,
  type AgreementSnapshot,
} from '../repositories/agreementRepository.js';
import { createNotification } from '../repositories/notificationRepository.js';
import { query } from '../db.js';

export async function notifyMessageRecipients(input: {
  messageId: number;
  conversationId: number;
  senderId: number;
}): Promise<void> {
  const { rows } = await query<{ user_id: number; sender_name: string }>(
    `SELECT recipient.user_id, sender.name AS sender_name
     FROM conversation_participants recipient
     JOIN users sender ON sender.id = $2
     WHERE recipient.conversation_id = $1 AND recipient.user_id <> $2`,
    [input.conversationId, input.senderId]
  );
  await Promise.all(
    rows.map((row) =>
      createNotification({
        recipientId: row.user_id,
        kind: 'message',
        entityId: String(input.conversationId),
        titleKey: 'notifications.message.title',
        bodyKey: 'notifications.message.body',
        data: {
          conversationId: input.conversationId,
          senderName: row.sender_name,
        },
        idempotencyKey: `message:${input.messageId}:${row.user_id}`,
      })
    )
  );
}

async function notifyAgreement(agreement: AgreementSnapshot): Promise<void> {
  if (agreement.state !== 'confirmed') return;

  const participantIds = [agreement.proposerId, agreement.participantId];
  const { rows } = await query<{ id: number; display_name: string }>(
    `SELECT id, COALESCE(NULLIF(alias, ''), name) AS display_name
     FROM users WHERE id = ANY($1::integer[])`,
    [participantIds]
  );
  const names = new Map(rows.map((row) => [row.id, row.display_name]));
  await Promise.all(
    participantIds.map((recipientId) => {
      const otherParticipantId = participantIds.find(
        (participantId) => participantId !== recipientId
      );
      return createNotification({
        recipientId,
        kind: 'agreement',
        entityId: String(agreement.id),
        titleKey: 'notifications.agreement.title',
        bodyKey: 'notifications.agreement.body',
        data: {
          agreementId: agreement.id,
          conversationId: agreement.conversationId,
          participantName:
            names.get(otherParticipantId ?? recipientId) ?? 'un usuario',
        },
        idempotencyKey: `agreement:${agreement.id}:version:${agreement.currentVersion}:user:${recipientId}`,
      });
    })
  );
}

export function registerNotificationEvents(): void {
  agreementEvents.on('committed', (agreement: AgreementSnapshot) => {
    void notifyAgreement(agreement).catch(() => undefined);
  });
}
