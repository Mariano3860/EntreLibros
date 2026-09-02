const UNSAFE_CONTENT_PATTERN =
  /<\/?(script|iframe|object|embed)\b|on[a-z]+\s*=|(?:javascript|vbscript|data):/i;
const SUSPICIOUS_LINK_PATTERN = /(?:https?:\/\/|www\.)[^\s<]+/gi;

export type EditorialValidationError =
  | 'books.errors.content_not_allowed'
  | 'books.errors.suspicious_link'
  | 'community.corners.errors.content_not_allowed'
  | 'community.corners.errors.suspicious_link';

export function validateEditorialText(
  values: string[],
  scope: 'books' | 'community'
): EditorialValidationError | null {
  const text = values.join('\n');
  if (UNSAFE_CONTENT_PATTERN.test(text)) {
    return scope === 'books'
      ? 'books.errors.content_not_allowed'
      : 'community.corners.errors.content_not_allowed';
  }

  const links = text.match(SUSPICIOUS_LINK_PATTERN) ?? [];
  if (links.length > 2) {
    return scope === 'books'
      ? 'books.errors.suspicious_link'
      : 'community.corners.errors.suspicious_link';
  }

  return null;
}
