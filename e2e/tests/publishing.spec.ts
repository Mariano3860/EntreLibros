import { test, expect } from "../fixtures/auth";
import { waitForApiResponse } from "../support/helpers";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

test("publishes through the UI and persists an edited publication field", async ({
  userAPage,
}) => {
  const title = `E2E UI Book ${Date.now()}`;
  const updatedAuthor = "E2E Author Edited";

  await userAPage.goto("/books/new");
  const modal = userAPage.getByRole("dialog", { name: "Publicar un libro" });

  await modal.getByLabel("Completar manualmente").check();
  await modal.locator("#publish-title").fill(title);
  await modal.locator("#publish-author").fill("E2E Author");
  await modal.locator("#publish-language").fill("Español");
  await modal.locator("#publish-format").fill("Tapa blanda");
  await modal.locator("#publish-upload").setInputFiles({
    name: "e2e-cover.png",
    mimeType: "image/png",
    buffer: onePixelPng,
  });
  await modal.getByRole("button", { name: "Siguiente" }).click();

  await modal
    .locator("label")
    .filter({ hasText: "Donación" })
    .getByRole("checkbox")
    .check();
  await modal.locator('input[name="publish-condition"][value="good"]').check();
  await modal.getByRole("button", { name: "Siguiente" }).click();

  await modal
    .locator("label")
    .filter({ hasText: "Acepto" })
    .getByRole("checkbox")
    .check();

  const publishResponse = userAPage.waitForResponse(
    (response) =>
      response.url().endsWith("/api/books") &&
      response.request().method() === "POST" &&
      response.status() === 201,
  );
  await modal.getByRole("button", { name: "Publicar" }).click();

  const created = (await (await publishResponse).json()) as {
    id?: number | string;
  };
  expect(created.id).toBeDefined();
  await expect(userAPage).toHaveURL(/\/books$/);

  const bookId = String(created.id);
  const detailResponse = waitForApiResponse(userAPage, `/api/books/${bookId}`);
  await userAPage.goto(`/books/${bookId}`);
  await detailResponse;

  const detail = userAPage.getByRole("dialog", { name: "Detalle del libro" });
  await expect(detail.getByText(title, { exact: true })).toBeVisible();
  await detail.getByRole("button", { name: "Editar" }).click();
  await detail.locator("#book-detail-author").fill(updatedAuthor);

  const updateResponse = userAPage.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/books/${bookId}`) &&
      response.request().method() === "PUT" &&
      response.status() === 200,
  );
  await detail.getByRole("button", { name: "Guardar cambios" }).click();
  await updateResponse;
  await expect(userAPage.getByText("Cambios guardados")).toBeVisible();

  await userAPage.reload();
  const reloadedDetail = userAPage.getByRole("dialog", {
    name: "Detalle del libro",
  });
  await expect(
    reloadedDetail.getByText(updatedAuthor, { exact: true }),
  ).toBeVisible();
});
