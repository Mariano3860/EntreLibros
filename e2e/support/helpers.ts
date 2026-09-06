import { expect, type Page, type Response } from "@playwright/test";

export function waitForApiResponse(
  page: Page,
  path: string,
  status = 200,
): Promise<Response> {
  return page.waitForResponse(
    (response) => response.url().includes(path) && response.status() === status,
  );
}

export async function expectRealApiMode(page: Page) {
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-api-mode",
    "mock",
  );
}

export async function navigateAndWait(page: Page, path: string) {
  await page.goto(path);
  await expect(page).toHaveURL(new RegExp(`${path.replace("/", "\\/")}$`));
}
