import type { TestInfo } from "@playwright/test";

export const KNOWN_DISCREPANCIES = {
  BOOK_VERIFY_MISSING_ADMIN_GUARD: {
    id: "SEC-BOOK-VERIFY-ADMIN-GUARD",
    expectedStatus: 200,
    description:
      "POST /api/books/:id/verify accepts a common authenticated user; the route should require administrative authorization.",
    nextChange: "openspec/changes/admin-book-verification-authorization",
  },
} as const;

export function assertKnownDiscrepancyObserved(
  testInfo: TestInfo,
  key: keyof typeof KNOWN_DISCREPANCIES,
  observedStatus: number,
) {
  const discrepancy = KNOWN_DISCREPANCIES[key];
  if (observedStatus !== discrepancy.expectedStatus) {
    throw new Error(
      `${discrepancy.id} changed: expected HTTP ${discrepancy.expectedStatus}, observed ${observedStatus}. Update the allowlist and follow-up OpenSpec before changing this test.`,
    );
  }

  testInfo.annotations.push({
    type: "known-discrepancy",
    description: `${discrepancy.id}: ${discrepancy.description} Next: ${discrepancy.nextChange}.`,
  });
}
