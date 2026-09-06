import { test, expect, loginViaUi } from "../fixtures/auth";
import { E2E_USERS } from "../support/users";

test("keeps real sessions isolated between browser contexts", async ({
  userAPage,
  userBPage,
}) => {
  const [userACookies, userBCookies] = await Promise.all([
    userAPage.context().cookies(),
    userBPage.context().cookies(),
  ]);
  const userASession = userACookies.find(
    (cookie) => cookie.name === "sessionToken",
  );
  const userBSession = userBCookies.find(
    (cookie) => cookie.name === "sessionToken",
  );

  expect(userASession?.httpOnly).toBe(true);
  expect(userBSession?.httpOnly).toBe(true);
  expect(userASession?.value).toBeTruthy();
  expect(userASession?.value).not.toBe(userBSession?.value);

  await userAPage.evaluate(() => localStorage.setItem("e2e-context", "a"));
  await expect(
    userBPage.evaluate(() => localStorage.getItem("e2e-context")),
  ).resolves.toBeNull();
});

test("covers visitor, private navigation, logout, and reload with real cookies", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/messages");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fmessages$/);

  await loginViaUi(page, E2E_USERS.userA);
  await page.goto("/messages");
  await expect(page).toHaveURL(/\/messages$/);
  await page.reload();
  await expect(page).toHaveURL(/\/messages$/);

  await page.getByRole("button", { name: /cerrar sesión/i }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /cerrar sesión/i }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/messages");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fmessages$/);
  await context.close();
});
