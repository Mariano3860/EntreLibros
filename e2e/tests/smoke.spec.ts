import { test, expect } from "@playwright/test";

test("renders the real frontend without API mocks", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#root")).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-api-mode",
    "mock",
  );
});
