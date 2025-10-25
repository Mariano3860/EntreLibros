import validator from 'validator';
import {
  createContactMessage,
  type ContactMessage,
  type CreateContactMessageInput,
} from '../repositories/contactMessageRepository.js';

const MAX_MESSAGE_LENGTH = 5000;
const MAX_NAME_LENGTH = 255;
const EMAIL_VALIDATION_OPTIONS = {
  allow_display_name: false,
  allow_utf8_local_part: true,
  require_tld: true,
  allow_ip_domain: false,
} as const;

const ERROR_MESSAGES = {
  nameRequired: 'contact.errors.name_required',
  nameTooLong: 'contact.errors.name_too_long',
  emailRequired: 'contact.errors.email_required',
  emailInvalid: 'contact.errors.email_invalid',
  messageRequired: 'contact.errors.message_required',
  messageTooLong: 'contact.errors.message_too_long',
} as const;

export class ContactValidationError extends Error {
  public readonly errors: Record<string, string>;

  constructor(errors: Record<string, string>) {
    super('ContactValidationError');
    this.errors = errors;
  }
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  message: string;
}

export type ContactMessageNotifier = (
  message: ContactMessage
) => Promise<void> | void;

let notifier: ContactMessageNotifier | null = null;

export function setContactMessageNotifier(
  handler: ContactMessageNotifier | null
): void {
  notifier = handler;
}

function sanitizePayload(
  payload: ContactMessagePayload
): CreateContactMessageInput {
  return {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    message: payload.message.trim(),
  };
}

function validatePayload(payload: CreateContactMessageInput): void {
  const errors: Record<string, string> = {};

  if (!payload.name) {
    errors.name = ERROR_MESSAGES.nameRequired;
  } else if (payload.name.length > MAX_NAME_LENGTH) {
    errors.name = ERROR_MESSAGES.nameTooLong;
  }

  if (!payload.email) {
    errors.email = ERROR_MESSAGES.emailRequired;
  } else if (!validator.isEmail(payload.email, EMAIL_VALIDATION_OPTIONS)) {
    errors.email = ERROR_MESSAGES.emailInvalid;
  }

  if (!payload.message) {
    errors.message = ERROR_MESSAGES.messageRequired;
  } else if (payload.message.length > MAX_MESSAGE_LENGTH) {
    errors.message = ERROR_MESSAGES.messageTooLong;
  }

  if (Object.keys(errors).length > 0) {
    throw new ContactValidationError(errors);
  }
}

export async function submitContactMessage(
  payload: ContactMessagePayload
): Promise<ContactMessage> {
  const sanitized = sanitizePayload(payload);
  validatePayload(sanitized);

  const message = await createContactMessage(sanitized);

  if (notifier) {
    try {
      await notifier(message);
    } catch (error) {
      console.error('contact.submit.notification_failed', error);
    }
  }

  return message;
}
