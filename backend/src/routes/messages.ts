import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  createConversation,
  isConversationParticipant,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
  type MessageAttachment,
} from '../repositories/messagingRepository.js';
import { notifyMessageRecipients } from '../services/notifications.js';

const router = Router();

function asPositiveInteger(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function asBody(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asAttachmentMetadata(value: unknown): MessageAttachment | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const metadata = value as Record<string, unknown>;
  if (
    typeof metadata.key !== 'string' ||
    typeof metadata.contentType !== 'string' ||
    typeof metadata.size !== 'number' ||
    !Number.isSafeInteger(metadata.size) ||
    metadata.size < 1
  ) {
    return null;
  }
  return {
    key: metadata.key,
    contentType: metadata.contentType,
    size: metadata.size,
    name: typeof metadata.name === 'string' ? metadata.name : undefined,
  };
}

function hasAttachmentMetadata(value: unknown): boolean {
  return value !== undefined && value !== null;
}

function errorResponse(error: unknown) {
  const key =
    error instanceof Error ? error.message : 'messaging.errors.failed';
  const status = key === 'messaging.errors.forbidden' ? 403 : 422;
  return { status, body: { error: 'MessagingError', message: key } };
}

router.use(authenticate);

router.get('/', async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
  }
  try {
    return res.json({ conversations: await listConversations(req.user.id) });
  } catch {
    return res.status(500).json({
      error: 'MessagingError',
      message: 'messaging.errors.list_failed',
    });
  }
});

router.post('/conversations', async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
  }
  const body = asBody(req.body);
  const participantId = body.participantId;
  if (
    typeof participantId !== 'number' ||
    !Number.isSafeInteger(participantId)
  ) {
    return res.status(422).json({
      error: 'ValidationError',
      message: 'messaging.errors.participant_required',
    });
  }
  try {
    const conversation = await createConversation([req.user.id, participantId]);
    return res.status(201).json({ conversation });
  } catch (error) {
    const response = errorResponse(error);
    return res.status(response.status).json(response.body);
  }
});

router.get(
  '/:conversationId/messages',
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
    }
    const conversationId = asPositiveInteger(req.params.conversationId);
    if (!conversationId) {
      return res.status(422).json({
        error: 'ValidationError',
        message: 'messaging.errors.conversation_required',
      });
    }
    const after = req.query.after ? Number(req.query.after) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    if (
      (after !== undefined && (!Number.isInteger(after) || after < 0)) ||
      (limit !== undefined &&
        (!Number.isInteger(limit) || limit < 1 || limit > 100))
    ) {
      return res.status(422).json({
        error: 'ValidationError',
        message: 'messaging.errors.invalid_pagination',
      });
    }
    try {
      const messages = await listMessages(conversationId, req.user.id, {
        after,
        limit,
      });
      return res.json({
        messages,
        nextAfter: messages.at(-1)?.sequence ?? after ?? 0,
      });
    } catch (error) {
      const response = errorResponse(error);
      return res.status(response.status).json(response.body);
    }
  }
);

router.post(
  '/:conversationId/messages',
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
    }
    const conversationId = asPositiveInteger(req.params.conversationId);
    const body = asBody(req.body);
    if (
      !conversationId ||
      typeof body.clientKey !== 'string' ||
      typeof body.body !== 'string'
    ) {
      return res.status(422).json({
        error: 'ValidationError',
        message: 'messaging.errors.invalid_message',
      });
    }
    const attachmentMetadata = asAttachmentMetadata(body.attachmentMetadata);
    if (hasAttachmentMetadata(body.attachmentMetadata) && !attachmentMetadata) {
      return res.status(422).json({
        error: 'ValidationError',
        message: 'messaging.errors.invalid_attachment',
      });
    }
    try {
      const message = await sendMessage({
        conversationId,
        senderId: req.user.id,
        clientKey: body.clientKey,
        body: body.body,
        attachmentMetadata,
      });
      await notifyMessageRecipients({
        messageId: message.id,
        conversationId,
        senderId: req.user.id,
      });
      return res.status(201).json({ message });
    } catch (error) {
      const response = errorResponse(error);
      return res.status(response.status).json(response.body);
    }
  }
);

router.patch(
  '/:conversationId/read',
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
    }
    const conversationId = asPositiveInteger(req.params.conversationId);
    const body = asBody(req.body);
    const sequence = body.sequence;
    if (
      !conversationId ||
      typeof sequence !== 'number' ||
      !Number.isInteger(sequence) ||
      sequence < 0
    ) {
      return res.status(422).json({
        error: 'ValidationError',
        message: 'messaging.errors.invalid_sequence',
      });
    }
    try {
      if (!(await isConversationParticipant(conversationId, req.user.id))) {
        return res
          .status(403)
          .json({ error: 'Forbidden', message: 'messaging.errors.forbidden' });
      }
      await markConversationRead(conversationId, req.user.id, sequence);
      return res.status(204).send();
    } catch (error) {
      const response = errorResponse(error);
      return res.status(response.status).json(response.body);
    }
  }
);

export default router;
