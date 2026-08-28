import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import {
  commandAgreement,
  createAgreement,
  getAgreement,
  type AgreementDetails,
} from '../repositories/agreementRepository.js';
import type { AgreementCommand } from '../services/agreementState.js';

const router = Router();
router.use(authenticate);

function asBody(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function id(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function details(value: unknown): AgreementDetails | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const fields = ['meetingPoint', 'area', 'date', 'time', 'bookTitle'];
  if (!fields.every((field) => typeof candidate[field] === 'string'))
    return null;
  return {
    meetingPoint: candidate.meetingPoint as string,
    area: candidate.area as string,
    date: candidate.date as string,
    time: candidate.time as string,
    bookTitle: candidate.bookTitle as string,
  };
}

function failure(error: unknown) {
  const message =
    error instanceof Error ? error.message : 'agreements.errors.failed';
  const status =
    message === 'agreements.errors.forbidden'
      ? 403
      : message === 'agreements.errors.conflict'
        ? 409
        : 422;
  return { status, body: { error: 'AgreementError', message } };
}

router.get('/:id', async (req: AuthenticatedRequest, res) => {
  if (!req.user)
    return res
      .status(401)
      .json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
  const agreementId = id(req.params.id);
  if (!agreementId)
    return res
      .status(422)
      .json({
        error: 'ValidationError',
        message: 'agreements.errors.id_required',
      });
  try {
    const agreement = await getAgreement(agreementId, req.user.id);
    if (!agreement)
      return res
        .status(404)
        .json({ error: 'NotFound', message: 'agreements.errors.not_found' });
    return res.json({ agreement });
  } catch (error) {
    const response = failure(error);
    return res.status(response.status).json(response.body);
  }
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  if (!req.user)
    return res
      .status(401)
      .json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
  const body = asBody(req.body);
  const conversationId =
    typeof body.conversationId === 'number' ? body.conversationId : null;
  const participantId =
    typeof body.participantId === 'number' ? body.participantId : null;
  const agreementDetails = details(body.details);
  if (!conversationId || !participantId || !agreementDetails) {
    return res
      .status(422)
      .json({
        error: 'ValidationError',
        message: 'agreements.errors.invalid_proposal',
      });
  }
  try {
    const agreement = await createAgreement({
      conversationId,
      proposerId: req.user.id,
      participantId,
      details: agreementDetails,
    });
    return res.status(201).json({ agreement });
  } catch (error) {
    const response = failure(error);
    return res.status(response.status).json(response.body);
  }
});

router.post('/:id/commands', async (req: AuthenticatedRequest, res) => {
  if (!req.user)
    return res
      .status(401)
      .json({ error: 'Unauthorized', message: 'auth.errors.unauthorized' });
  const agreementId = id(req.params.id);
  const body = asBody(req.body);
  const command = body.command;
  const expectedVersion = body.expectedVersion;
  if (
    !agreementId ||
    typeof command !== 'string' ||
    !['confirm', 'cancel', 'reject', 'complete'].includes(command) ||
    typeof expectedVersion !== 'number' ||
    !Number.isInteger(expectedVersion) ||
    expectedVersion < 1
  ) {
    return res
      .status(422)
      .json({
        error: 'ValidationError',
        message: 'agreements.errors.invalid_command',
      });
  }
  try {
    const agreement = await commandAgreement({
      id: agreementId,
      actorId: req.user.id,
      expectedVersion,
      command: command as AgreementCommand,
      reason: typeof body.reason === 'string' ? body.reason : undefined,
    });
    return res.json({ agreement });
  } catch (error) {
    const response = failure(error);
    if (response.status === 409) {
      const current = await getAgreement(agreementId, req.user.id);
      return res.status(409).json({ ...response.body, agreement: current });
    }
    return res.status(response.status).json(response.body);
  }
});

export default router;
