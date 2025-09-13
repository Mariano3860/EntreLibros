export interface LogMeta {
  [key: string]: unknown;
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    if (meta) {
      console.log(message, meta);
    } else {
      console.log(message);
    }
  },
  error(message: string, meta?: LogMeta) {
    if (meta) {
      console.error(message, meta);
    } else {
      console.error(message);
    }
  },
};
