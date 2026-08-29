export interface LogMeta {
  [key: string]: unknown;
}

const REDACTED = '[REDACTED]';
const SENSITIVE_KEY =
  /(password|token|secret|cookie|authorization|email|name)/i;

function redact(value: unknown, key?: string): unknown {
  if (key && SENSITIVE_KEY.test(key)) {
    return REDACTED;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => redact(entry));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        redact(entryValue, entryKey),
      ])
    );
  }
  return value;
}

export function redactLogMeta(meta: LogMeta): LogMeta {
  return redact(meta) as LogMeta;
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    if (meta) {
      console.log(message, redactLogMeta(meta));
    } else {
      console.log(message);
    }
  },
  error(message: string, meta?: LogMeta) {
    if (meta) {
      console.error(message, redactLogMeta(meta));
    } else {
      console.error(message);
    }
  },
};
