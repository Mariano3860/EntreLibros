export const DEFAULT_EXTERNAL_REQUEST_TIMEOUT_MS = 5_000;

export function configuredExternalRequestTimeout(
  environmentVariable: string
): number {
  const configured = Number(process.env[environmentVariable]);
  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_EXTERNAL_REQUEST_TIMEOUT_MS;
  }
  return Math.min(Math.floor(configured), 60_000);
}

export async function fetchWithTimeout(
  fetchFn: typeof fetch,
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchFn(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
