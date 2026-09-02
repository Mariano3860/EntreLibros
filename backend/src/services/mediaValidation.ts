export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

const SAFE_EXTERNAL_ID = /^[A-Za-z0-9._-]{1,128}$/;

export function isValidImageReference(value: string): boolean {
  if (/^https:\/\/[^\s]+$/i.test(value)) {
    return true;
  }

  const match = value.match(
    /^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/=]+)$/i
  );
  if (!match) {
    return false;
  }

  return Math.floor((match[2].length * 3) / 4) <= MAX_IMAGE_BYTES;
}

export function isSafeExternalId(value: string): boolean {
  return SAFE_EXTERNAL_ID.test(value);
}
