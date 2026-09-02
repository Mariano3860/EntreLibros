const ISBN_10_PATTERN = /^\d{9}[\dX]$/i;
const ISBN_13_PATTERN = /^\d{13}$/;

/**
 * Returns the canonical ISBN representation accepted by the MVP.
 * Separators are removed, ISBN-10 keeps an uppercase X check digit, and
 * ISBN-13 is kept as entered after checksum validation.
 */
export function normalizeIsbn(value: string): string | null {
  const compact = value.replace(/[\s-]/g, '').toUpperCase();

  if (ISBN_10_PATTERN.test(compact) && isValidIsbn10(compact)) {
    return compact;
  }

  if (ISBN_13_PATTERN.test(compact) && isValidIsbn13(compact)) {
    return compact;
  }

  return null;
}

function isValidIsbn10(value: string): boolean {
  const sum = value.split('').reduce((total, digit, index) => {
    const numeric = digit === 'X' ? 10 : Number(digit);
    return total + numeric * (10 - index);
  }, 0);

  return sum % 11 === 0;
}

function isValidIsbn13(value: string): boolean {
  const sum = value
    .slice(0, 12)
    .split('')
    .reduce(
      (total, digit, index) =>
        total + Number(digit) * (index % 2 === 0 ? 1 : 3),
      0
    );
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === Number(value[12]);
}
