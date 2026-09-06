import { test, expect } from "../fixtures/auth";
import type { Page } from "@playwright/test";
import {
  assertKnownDiscrepancyObserved,
  KNOWN_DISCREPANCIES,
} from "../support/known-discrepancies";

type ConversationsPayload = {
  conversations?: Array<{ id: number; participantName: string | null }>;
};

type RelationsPayload = {
  items?: Array<{ id?: number | string; userId?: number | string }>;
};

test("keeps the security discrepancy allowlist explicit and countable", () => {
  const entries = Object.values(KNOWN_DISCREPANCIES);
  expect(entries).toHaveLength(1);
  expect(entries.map((entry) => entry.id)).toEqual([
    "SEC-BOOK-VERIFY-ADMIN-GUARD",
  ]);
});

async function requestStatus(
  page: Page,
  path: string,
  init?: { method?: string; body?: unknown },
) {
  return page.evaluate(
    async ({ path: requestPath, init: requestInit }) => {
      const response = await fetch(requestPath, {
        method: requestInit?.method,
        headers: requestInit?.body
          ? { "Content-Type": "application/json" }
          : undefined,
        body: requestInit?.body ? JSON.stringify(requestInit.body) : undefined,
      });
      return response.status;
    },
    { path, init },
  );
}

async function requestJson(page: Page, path: string) {
  return page.evaluate(async (requestPath) => {
    const response = await fetch(requestPath);
    return {
      status: response.status,
      body: (await response.json().catch(() => null)) as unknown,
    };
  }, path);
}

test("enforces visitor and participant authorization at the HTTP boundary", async ({
  browser,
  userAPage,
  outsiderPage,
}) => {
  const conversationsResponse = userAPage.waitForResponse(
    (response) =>
      response.url().endsWith("/api/messages") && response.status() === 200,
  );
  await userAPage.goto("/messages");
  const conversations = (await (
    await conversationsResponse
  ).json()) as ConversationsPayload;
  const seedConversation = conversations.conversations?.find(
    (conversation) => conversation.participantName === "E2E User B",
  );
  expect(seedConversation?.id).toBeDefined();

  const visitorContext = await browser.newContext();
  const visitorPage = await visitorContext.newPage();
  await visitorPage.goto("/messages");
  await expect(visitorPage).toHaveURL(/\/login\?returnTo=%2Fmessages$/);
  const visitorHistoryStatus = await requestStatus(
    visitorPage,
    `/api/messages/${String(seedConversation?.id)}/messages`,
  );
  expect(visitorHistoryStatus).toBe(401);
  await visitorContext.close();

  const outsiderHistoryStatus = await requestStatus(
    outsiderPage,
    `/api/messages/${String(seedConversation?.id)}/messages`,
  );
  expect([403, 404]).toContain(outsiderHistoryStatus);
});

test("records the known book verification authorization discrepancy", async ({
  userAPage,
  adminPage,
}) => {
  const relations = await requestJson(
    userAPage,
    "/api/books/relations?tab=all",
  );
  const payload = relations.body as RelationsPayload;
  const listingId = payload.items?.find((item) => item.id !== undefined)?.id;
  expect(listingId).toBeDefined();

  const commonStatus = await requestStatus(
    userAPage,
    `/api/books/${String(listingId)}/verify`,
    { method: "POST" },
  );
  assertKnownDiscrepancyObserved(
    test.info(),
    "BOOK_VERIFY_MISSING_ADMIN_GUARD",
    commonStatus,
  );

  const adminStatus = await requestStatus(
    adminPage,
    `/api/books/${String(listingId)}/verify`,
    { method: "POST" },
  );
  expect(adminStatus).toBe(200);
});

test("blocks cross-user conversations and restores the seed relationship", async ({
  userAPage,
  userBPage,
}) => {
  const [userAProfile, userBProfile] = await Promise.all([
    requestJson(userAPage, "/api/user/profile"),
    requestJson(userBPage, "/api/user/profile"),
  ]);
  const userAId = (userAProfile.body as { id?: number }).id;
  const userBId = (userBProfile.body as { id?: number }).id;
  expect(userAId).toBeDefined();
  expect(userBId).toBeDefined();

  const blockStatus = await requestStatus(
    userAPage,
    `/api/user/blocks/${String(userBId)}`,
    { method: "PUT" },
  );
  expect(blockStatus).toBe(204);

  const blockedConversationStatus = await requestStatus(
    userBPage,
    "/api/messages/conversations",
    { method: "POST", body: { participantId: userAId } },
  );
  expect(blockedConversationStatus).toBe(403);

  const unblockStatus = await requestStatus(
    userAPage,
    `/api/user/blocks/${String(userBId)}`,
    { method: "DELETE" },
  );
  expect(unblockStatus).toBe(204);
});

test("does not expose an unrelated conversation to the third seed user", async ({
  userAPage,
  outsiderPage,
}) => {
  const conversationsResponse = userAPage.waitForResponse(
    (response) =>
      response.url().endsWith("/api/messages") && response.status() === 200,
  );
  await userAPage.goto("/messages");
  const conversations = (await (
    await conversationsResponse
  ).json()) as ConversationsPayload;
  const seedConversation = conversations.conversations?.find(
    (conversation) => conversation.participantName === "E2E User B",
  );
  expect(seedConversation?.id).toBeDefined();

  const response = await requestJson(
    outsiderPage,
    `/api/messages/${String(seedConversation?.id)}/messages`,
  );
  expect([403, 404]).toContain(response.status);
  expect(JSON.stringify(response.body)).not.toContain(
    "Mensaje inicial del seed E2E.",
  );
});
