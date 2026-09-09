import { test, expect } from "../fixtures/auth";
import { expectRealApiMode, waitForApiResponse } from "../support/helpers";

type RelationsPayload = {
  items?: Array<{ id?: number | string; title?: string }>;
};

type PublicCatalogItem = {
  id?: string;
  title?: string;
};

async function requestJson(page: import("@playwright/test").Page, path: string) {
  return page.evaluate(async (requestPath) => {
    const response = await fetch(requestPath);
    return {
      status: response.status,
      body: (await response.json().catch(() => null)) as unknown,
    };
  }, path);
}

test("lists seeded books and keeps a detail coherent after navigation and reload", async ({
  userAPage,
}) => {
  const relationsResponse = waitForApiResponse(
    userAPage,
    "/api/books/relations",
  );

  await userAPage.goto("/books");
  await expectRealApiMode(userAPage);

  const relations = (await (
    await relationsResponse
  ).json()) as RelationsPayload;
  const seededBook = relations.items?.find(
    (item) => item.title === "E2E Book A" && item.id !== undefined,
  );

  expect(seededBook).toBeDefined();
  await expect(
    userAPage.getByRole("button", { name: "Ver E2E Book A" }),
  ).toBeVisible();

  const detailResponse = waitForApiResponse(
    userAPage,
    `/api/books/${String(seededBook?.id)}`,
  );
  await userAPage.goto(`/books/${String(seededBook?.id)}`);
  await detailResponse;

  const detail = userAPage.getByRole("dialog", { name: "Detalle del libro" });
  await expect(detail).toBeVisible();
  await expect(detail.getByText("E2E Book A", { exact: true })).toBeVisible();

  await userAPage.reload();
  await expect(
    userAPage
      .getByRole("dialog", { name: "Detalle del libro" })
      .getByText("E2E Book A", { exact: true }),
  ).toBeVisible();
});

test("discovers public publications when filtering by title", async ({
  userAPage,
}) => {
  await userAPage.goto("/books");
  const search = userAPage.getByRole("textbox", { name: "Buscar libros" });
  const filteredResponse = waitForApiResponse(
    userAPage,
    "/api/books?scope=all",
  );

  await search.fill("E2E Book B");
  await filteredResponse;

  await expect(
    userAPage.getByRole("button", { name: "Ver E2E Book B" }),
  ).toBeVisible();
  await expect(
    userAPage.getByText("Publicación de otra persona"),
  ).toBeVisible();
});

test("hides a blocked owner's public publication in discovery and detail", async ({
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

  const bookB = await requestJson(userAPage, "/api/books?q=E2E%20Book%20B");
  const listingB = (bookB.body as PublicCatalogItem[]).find(
    (item) => item.title === "E2E Book B",
  );
  expect(listingB?.id).toBeDefined();

  const bookA = await requestJson(userBPage, "/api/books?q=E2E%20Book%20A");
  const listingA = (bookA.body as PublicCatalogItem[]).find(
    (item) => item.title === "E2E Book A",
  );
  expect(listingA?.id).toBeDefined();

  try {
    await userAPage.evaluate(async (blockedId) => {
      await fetch(`/api/user/blocks/${String(blockedId)}`, { method: "PUT" });
    }, userBId);

    const blockedCatalog = await requestJson(
      userAPage,
      "/api/books?q=E2E%20Book%20B",
    );
    expect(blockedCatalog.body).toEqual([]);
    await expect(
      requestJson(userAPage, `/api/books/${String(listingB?.id)}`),
    ).resolves.toMatchObject({ status: 404 });

    await expect(
      requestJson(userBPage, `/api/books/${String(listingB?.id)}`),
    ).resolves.toMatchObject({ status: 200 });

    await userAPage.evaluate(async (blockedId) => {
      await fetch(`/api/user/blocks/${String(blockedId)}`, {
        method: "DELETE",
      });
    }, userBId);
    await userBPage.evaluate(async (blockedId) => {
      await fetch(`/api/user/blocks/${String(blockedId)}`, { method: "PUT" });
    }, userAId);

    const reverseBlockedCatalog = await requestJson(
      userBPage,
      "/api/books?q=E2E%20Book%20A",
    );
    expect(reverseBlockedCatalog.body).toEqual([]);
    await expect(
      requestJson(userBPage, `/api/books/${String(listingA?.id)}`),
    ).resolves.toMatchObject({ status: 404 });
  } finally {
    await userAPage.evaluate(async (blockedId) => {
      await fetch(`/api/user/blocks/${String(blockedId)}`, {
        method: "DELETE",
      });
    }, userBId);
    await userBPage.evaluate(async (blockedId) => {
      await fetch(`/api/user/blocks/${String(blockedId)}`, {
        method: "DELETE",
      });
    }, userAId);
  }
});
