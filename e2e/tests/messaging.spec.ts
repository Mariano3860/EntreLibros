import { test, expect } from "../fixtures/auth";
import type { Page } from "@playwright/test";

type ConversationsPayload = {
  conversations?: Array<{ id: number; participantName: string | null }>;
};

async function openSeedConversation(page: Page, counterpart: string) {
  const socket = page.waitForEvent("websocket", {
    predicate: (websocket) => websocket.url().includes("/socket.io/"),
  });
  await page.goto("/messages");
  const conversations = await page.evaluate(
    async (): Promise<ConversationsPayload> => {
      const response = await fetch("/api/messages", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to load conversations: ${response.status}`);
      }
      return (await response.json()) as ConversationsPayload;
    },
  );
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
    userAPage.locator('div[class*="bubble"]').filter({ hasText: message }),
  ).toBeVisible();
  await expect(
    userBPage.locator('div[class*="bubble"]').filter({ hasText: message }),
  ).toBeVisible({ timeout: 10000 });

  await userBPage.reload();
  await userBPage.getByRole("button", { name: /E2E User A/ }).click();
  await expect(
    userBPage.locator('div[class*="bubble"]').filter({ hasText: message }),
  ).toBeVisible();
});

test("hides a conversation from one participant after a clear confirmation", async ({
  userAPage,
  userBPage,
}) => {
  await openSeedConversation(userAPage, "E2E User B");

  await userAPage
    .getByRole("button", { name: "Eliminar conversación solo para vos" })
    .click();
  const dialog = userAPage.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("La ocultaremos de tus mensajes");
  await expect(dialog).toContainText("La otra persona conserva");

  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(dialog).toBeHidden();

  await userAPage
    .getByRole("button", { name: "Eliminar conversación solo para vos" })
    .click();
  const deleteResponse = userAPage.waitForResponse(
    (response) =>
      /\/api\/messages\/\d+$/.test(response.url()) &&
      response.request().method() === "DELETE" &&
      response.status() === 204,
  );
  await userAPage.getByRole("button", { name: "Eliminar para mí" }).click();
  await deleteResponse;
  await expect(
    userAPage.getByRole("button", { name: /E2E User B/ }),
  ).toHaveCount(0);

  await userBPage.goto("/messages");
  await expect(
    userBPage.getByRole("button", { name: /E2E User A/ }),
  ).toBeVisible();
});
