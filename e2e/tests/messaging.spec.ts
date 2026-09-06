import { test, expect } from "../fixtures/auth";
import type { Page } from "@playwright/test";

type ConversationsPayload = {
  conversations?: Array<{ id: number; participantName: string | null }>;
};

async function openSeedConversation(page: Page, counterpart: string) {
  const conversationsResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/messages") && response.status() === 200,
  );
  const socket = page.waitForEvent("websocket", {
    predicate: (websocket) => websocket.url().includes("/socket.io/"),
  });
  await page.goto("/messages");
  const conversations = (await (
    await conversationsResponse
  ).json()) as ConversationsPayload;
  const conversation = conversations.conversations?.find(
    (item) => item.participantName === counterpart,
  );
  expect(conversation).toBeDefined();
  await socket;
  const draftResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/messages/${conversation?.id}/draft`) &&
      [200, 304].includes(response.status()),
  );
  await page.getByRole("button", { name: new RegExp(counterpart) }).click();
  await draftResponse;
  await expect(page.getByPlaceholder("Escribí un mensaje...")).toBeVisible();
}

test("delivers a real conversation message between contexts without reload", async ({
  userAPage,
  userBPage,
}) => {
  await Promise.all([
    openSeedConversation(userAPage, "E2E User B"),
    openSeedConversation(userBPage, "E2E User A"),
  ]);

  const message = `E2E realtime ${Date.now()}`;
  const draftResponse = userAPage.waitForResponse(
    (response) =>
      /\/api\/messages\/\d+\/draft$/.test(response.url()) &&
      response.request().method() === "PUT" &&
      response.status() === 200,
  );
  const sendResponse = userAPage.waitForResponse(
    (response) =>
      /\/api\/messages\/\d+\/draft\/send$/.test(response.url()) &&
      response.request().method() === "POST" &&
      response.status() === 201,
  );
  await userAPage.getByPlaceholder("Escribí un mensaje...").fill(message);
  await userAPage.getByRole("button", { name: "Enviar mensaje" }).click();
  await Promise.all([draftResponse, sendResponse]);

  await expect(
    userAPage.locator('div[class*="bubble"]').filter({ hasText: message })
  ).toBeVisible();
  await expect(
    userBPage.locator('div[class*="bubble"]').filter({ hasText: message })
  ).toBeVisible({ timeout: 10000 });

  await userBPage.reload();
  await userBPage.getByRole("button", { name: /E2E User A/ }).click();
  await expect(
    userBPage.locator('div[class*="bubble"]').filter({ hasText: message })
  ).toBeVisible();
});
