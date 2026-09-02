import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  createConversation,
  isConversationParticipant,
  listConversationParticipantIds,
  listConversations,
  listMessages,
  markConversationRead,
  searchMessagingContacts,
  sendMessageWithStatus,
  publishMessage,
  type MessageAgreementDetails,
  type MessageBookAttachment,
  type MessageAttachment,
} from '../repositories/messagingRepository.js';
import {
  listPublicBookListingsForUser,
  type BookListing,
} from '../repositories/bookListingRepository.js';
import { markMessageNotificationsRead } from '../repositories/notificationRepository.js';
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

function asSearchParam(value: unknown): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  return typeof candidate === 'string' ? candidate.trim().slice(0, 80) : '';
}

function asMessageBookAttachment(value: unknown): MessageBookAttachment | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const book = value as Record<string, unknown>;
  if (
    typeof book.id !== 'string' ||
    typeof book.title !== 'string' ||
    typeof book.author !== 'string' ||
    typeof book.coverUrl !== 'string'
  ) {
    return null;
  }
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl,
    ...(typeof book.ownerId === 'number' && Number.isSafeInteger(book.ownerId)
      ? { ownerId: book.ownerId }
      : {}),
  };
}

function asAgreementDetails(value: unknown): MessageAgreementDetails | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const details = value as Record<string, unknown>;
  const fields = ['meetingPoint', 'area', 'date', 'time', 'bookTitle'];
  if (!fields.every((field) => typeof details[field] === 'string')) {
    return null;
  }
  return {
    meetingPoint: details.meetingPoint as string,
    area: details.area as string,
    date: details.date as string,
    time: details.time as string,
    bookTitle: details.bookTitle as string,
  };
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
  const base = {
    key: metadata.key,
    contentType: metadata.contentType,
    size: metadata.size,
    name: typeof metadata.name === 'string' ? metadata.name : undefined,
  };
  if (
    metadata.kind === 'book' &&
    typeof metadata.bookId === 'string' &&
    typeof metadata.title === 'string' &&
    typeof metadata.author === 'string' &&
    typeof metadata.coverUrl === 'string'
  ) {
    return {
      ...base,
      kind: 'book',
      bookId: metadata.bookId,
      title: metadata.title,
      author: metadata.author,
      coverUrl: metadata.coverUrl,
      ...(typeof metadata.ownerId === 'number' &&
      Number.isSafeInteger(metadata.ownerId)
        ? { ownerId: metadata.ownerId }
        : {}),
    };
  }
  if (metadata.kind === 'swap') {
    const offered = asMessageBookAttachment(metadata.offered);
    const requested = asMessageBookAttachment(metadata.requested);
    if (!offered || !requested) return null;
    return {
      ...base,
      kind: 'swap',
      offered,
      requested,
      ...(typeof metadata.note === 'string' ? { note: metadata.note } : {}),
    };
  }
  if (metadata.kind === 'agreement') {
    const agreementId = metadata.agreementId;
    const version = metadata.version;
    const events = [
      'proposal',
      'counterproposal',
      'confirm',
      'cancel',
      'reject',
      'complete',
    ] as const;
    const agreementDetails = asAgreementDetails(metadata.details);
    const rawListingIds = metadata.listingIds;
    if (
      typeof agreementId !== 'number' ||
      !Number.isSafeInteger(agreementId) ||
      agreementId < 1 ||
      typeof version !== 'number' ||
      !Number.isSafeInteger(version) ||
      version < 1 ||
      typeof metadata.event !== 'string' ||
      !events.includes(metadata.event as (typeof events)[number]) ||
      !agreementDetails ||
      !Array.isArray(rawListingIds) ||
      rawListingIds.length > 2 ||
      !rawListingIds.every(
        (listingId) =>
          typeof listingId === 'number' &&
          Number.isSafeInteger(listingId) &&
          listingId > 0
      ) ||
      typeof metadata.actorName !== 'string'
    ) {
      return null;
    }
    return {
      ...base,
      kind: 'agreement',
      agreementId,
      version,
      event: metadata.event as (typeof events)[number],
      details: agreementDetails,
      listingIds: [...new Set(rawListingIds as number[])],
      actorName: metadata.actorName,
      ...(typeof metadata.reason === 'string'
        ? { reason: metadata.reason }
        : {}),
    };
  }
  return null;
}

function hasAttachmentMetadata(value: unknown): boolean {
  return value !== undefined && value !== null;
}

function toConversationBook(listing: BookListing) {
  return {
    id: String(listing.id),
    title: listing.title,
    author: listing.author ?? '',
    coverUrl: listing.coverUrl,
    ownerId: listing.userId,
  };
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const key = /^messaging\.errors\.[a-z_]+$/.test(message)
    ? message
    : 'messaging.errors.failed';
  const status =
    key === 'messaging.errors.forbidden'
      ? 403
      : key === 'messaging.errors.failed'
        ? 500
        : 422;
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

router.get('/contacts', async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'auth.errors.unauthorized',
    });
  }
  try {
    const contacts = await searchMessagingContacts(
      req.user.id,
      asSearchParam(req.query.search)
    );
    return res.json({ contacts });
  } catch {
    return res.status(500).json({
      error: 'MessagingError',
      message: 'messaging.errors.contacts_failed',
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
    !Number.isSafeInteger(participantId) ||
    participantId <= 0 ||
    participantId > 2_147_483_647
  ) {
    return res.status(422).json({
      error: 'ValidationError',
      message: 'messaging.errors.participant_required',
    });
  }
  if (participantId === req.user.id) {
    return res.status(422).json({
      error: 'ValidationError',
      message: 'messaging.errors.self_conversation',
    });
  }
  try {
    const conversation = await createConversation(
      [req.user.id, participantId],
      req.user.id
    );
    return res.status(201).json({ conversation });
  } catch (error) {
    const response = errorResponse(error);
    return res.status(response.status).json(response.body);
  }
});

router.get('/:conversationId/books', async (req: AuthenticatedRequest, res) => {
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
  try {
    const participantIds = await listConversationParticipantIds(
      conversationId,
      req.user.id
    );
    const counterpartId = participantIds.find((id) => id !== req.user?.id);
    const [myBooks, theirBooks] = await Promise.all([
      listPublicBookListingsForUser(req.user.id),
      counterpartId
        ? listPublicBookListingsForUser(counterpartId)
        : Promise.resolve([]),
    ]);
    return res.json({
      myBooks: myBooks.map(toConversationBook),
      theirBooks: theirBooks.map(toConversationBook),
    });
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
      const result = await sendMessageWithStatus({
        conversationId,
        senderId: req.user.id,
        clientKey: body.clientKey,
        body: body.body,
        attachmentMetadata,
      });
      const message = result.message;
      if (result.created) {
        await notifyMessageRecipients({
          messageId: message.id,
          conversationId,
          senderId: req.user.id,
        });
        publishMessage(message);
      }
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
      await markMessageNotificationsRead(conversationId, req.user.id);
      return res.status(204).send();
    } catch (error) {
      const response = errorResponse(error);
      return res.status(response.status).json(response.body);
    }
  }
);

export default router;
