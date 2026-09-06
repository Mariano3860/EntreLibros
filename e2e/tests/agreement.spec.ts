import { test, expect } from "../fixtures/auth";

type ConversationsPayload = {
  conversations?: Array<{ id: number; agreementId: number | null }>;
};

type AgreementPayload = {
  agreement?: { id: number; state: string; currentVersion: number };
};

test("lets the authorized participant confirm the seeded agreement", async ({
  userBPage,
  userAPage,
}) => {
  const conversationsResponse = userBPage.waitForResponse(
    (response) =>
      response.url().endsWith("/api/messages") && response.status() === 200,
  );
  await userBPage.goto("/messages");
  const conversations = (await (
    await conversationsResponse
  ).json()) as ConversationsPayload;
  const seededConversation = conversations.conversations?.find(
    (conversation) => conversation.agreementId !== null,
  );

  expect(seededConversation?.agreementId).toBeDefined();
  const agreementId = String(seededConversation?.agreementId);
  const agreementResponse = userBPage.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/agreements/${agreementId}`) &&
      response.status() === 200,
  );
  await userBPage.getByRole("button", { name: /E2E User A/ }).click();
  await agreementResponse;
  await expect(
    userBPage.getByText("E2E Book A", { exact: true }),
  ).toBeVisible();

  const commandResponse = userBPage.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/agreements/${agreementId}/commands`) &&
      response.request().method() === "POST" &&
      response.status() === 200,
  );
  await userBPage.getByRole("button", { name: "Aceptar" }).click();
  const command = (await (await commandResponse).json()) as AgreementPayload;
  expect(command.agreement?.state).toBe("partially_confirmed");

  const proposerConversationsResponse = userAPage.waitForResponse(
    (response) =>
      response.url().endsWith("/api/messages") && response.status() === 200,
  );
  await userAPage.goto("/messages");
  await proposerConversationsResponse;
  const proposerAgreementResponse = userAPage.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/agreements/${agreementId}`) &&
      response.status() === 200,
  );
  await userAPage.getByRole("button", { name: /E2E User B/ }).click();
  const proposerAgreement = (await (
    await proposerAgreementResponse
  ).json()) as AgreementPayload;
  expect(proposerAgreement.agreement?.state).toBe("partially_confirmed");
  await expect(
    userAPage.getByText("Acuerdo confirmado", { exact: true }),
  ).toBeVisible();

  const reloadConversationsResponse = userAPage.waitForResponse(
    (response) =>
      response.url().endsWith("/api/messages") && response.status() === 200,
  );
  await userAPage.reload();
  await reloadConversationsResponse;
  const reloadedAgreementResponse = userAPage.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/agreements/${agreementId}`) &&
      response.status() === 200,
  );
  await userAPage.getByRole("button", { name: /E2E User B/ }).click();
  const reloadedAgreement = (await (
    await reloadedAgreementResponse
  ).json()) as AgreementPayload;
  expect(reloadedAgreement.agreement?.state).toBe("partially_confirmed");
});
