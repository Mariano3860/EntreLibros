import { test, expect } from "../fixtures/auth";
import { expectRealApiMode, waitForApiResponse } from "../support/helpers";

type RelationsPayload = {
  items?: Array<{ id?: number | string; title?: string }>;
};

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

test("uses the real catalog API when filtering by title", async ({
  userAPage,
}) => {
  await userAPage.goto("/books");
  const search = userAPage.getByRole("textbox", { name: "Buscar libros" });
  const filteredResponse = waitForApiResponse(
    userAPage,
    "/api/books/relations",
  );

  // `/books` is the authenticated user's personal relations catalog, so A
  // is the matching seed publication for this context and B is intentionally
  // outside the returned relation set.
  await search.fill("E2E Book A");
  await filteredResponse;

  await expect(
    userAPage.getByRole("button", { name: "Ver E2E Book A" }),
  ).toBeVisible();
  await expect(
    userAPage.getByRole("button", { name: "Ver E2E Book B" }),
  ).toHaveCount(0);
});
