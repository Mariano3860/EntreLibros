import {
  findBotIdForConversation,
  publishMessage,
  sendMessageWithStatus,
  type PersistedMessage,
  type SendMessageInput,
  type SendMessageResult,
} from '../repositories/messagingRepository.js';
import {
  sendMessageDraft,
  type SendMessageDraftInput,
  type SendMessageDraftResult,
} from '../repositories/messageDraftRepository.js';
import { recordAnalyticsEvent } from '../repositories/analyticsRepository.js';
import { generateReply } from './chatBot.js';
import { notifyMessageRecipients } from './notifications.js';

type MessageCommandResult = SendMessageResult | SendMessageDraftResult;

async function publishCommittedMessage(
  message: PersistedMessage,
  agreementId?: number
): Promise<void> {
  const attachment = message.attachmentMetadata;
  if (attachment?.kind === 'book') {
    await recordAnalyticsEvent({
      eventType: 'contact_started',
      actorId: message.senderId,
      entityType: 'listing',
      entityId: attachment.bookId,
      metadata: { conversationId: message.conversationId },
      idempotencyKey: `contact-listing:${message.conversationId}:${attachment.bookId}:${message.senderId}`,
    });
  }
  if (agreementId) {
    await recordAnalyticsEvent({
      eventType: 'agreement_created',
      actorId: message.senderId,
      entityType: 'agreement',
      entityId: String(agreementId),
      idempotencyKey: `agreement-created:${agreementId}`,
    });
  }
  await notifyMessageRecipients({
    messageId: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
  });
  publishMessage(message);
}

async function sendBotReply(message: PersistedMessage): Promise<void> {
  const botId = await findBotIdForConversation(
    message.conversationId,
    message.senderId
  );
  if (!botId) return;

  const botResult = await sendMessageWithStatus({
    conversationId: message.conversationId,
    senderId: botId,
    clientKey: `bot-reply-${message.id}`,
    body: await generateReply(message.body),
  });
  if (botResult.created) await publishCommittedMessage(botResult.message);
}

async function completeMessageCommand(
  result: MessageCommandResult,
  options: { agreementId?: number; replyWithBot: boolean }
): Promise<void> {
  if (!result.created) return;
  await publishCommittedMessage(result.message, options.agreementId);
  if (options.replyWithBot) await sendBotReply(result.message);
}

export async function sendDirectMessageCommand(
  input: SendMessageInput
): Promise<SendMessageResult> {
  const result = await sendMessageWithStatus(input);
  await completeMessageCommand(result, { replyWithBot: true });
  return result;
}

export async function sendDraftMessageCommand(
  input: SendMessageDraftInput
): Promise<SendMessageDraftResult> {
  const result = await sendMessageDraft(input);
  await completeMessageCommand(result, {
    agreementId: result.agreementId,
    replyWithBot: true,
  });
  return result;
}
