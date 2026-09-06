import {
  test as base,
  expect,
  type Browser,
  type BrowserContext,
  type Page,
  type TestInfo,
} from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { E2E_USERS, type E2EUser } from "../support/users";

export async function loginViaUi(page: Page, user: E2EUser) {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="password"]').fill(user.password);
  await page.getByRole("button", { name: /iniciar sesión|login/i }).click();
  await expect(page).toHaveURL(/\/home$/);
}

async function authenticatedPage(
  context: BrowserContext,
  user: E2EUser,
): Promise<Page> {
  const page = await context.newPage();
  await loginViaUi(page, user);
  return page;
}

async function useAuthenticatedFixture(
  browser: Browser,
  user: E2EUser,
  label: string,
  use: (page: Page) => Promise<void>,
  testInfo: TestInfo,
) {
  const context = await browser.newContext();
  const page = await authenticatedPage(context, user);
  const diagnostics: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error") {
      diagnostics.push(`[console:${message.type()}] ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    diagnostics.push(`[pageerror] ${error.message}`);
  });

  try {
    await use(page);
  } finally {
    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach(`client-${label}-diagnostics`, {
        body:
          diagnostics.join("\n") || "No browser console warnings or errors.",
        contentType: "text/plain",
      });
    }
    await context.close();
  }
}

async function attachRuntimeLogs(testInfo: TestInfo) {
  if (testInfo.status === testInfo.expectedStatus) return;

  const logDirectory = resolve("test-results/e2e/runtime");
  for (const name of ["backend.log", "frontend.log", "stack.log"]) {
    try {
      const body = await readFile(resolve(logDirectory, name), "utf8");
      await testInfo.attach(`runtime-${name}`, {
        body,
        contentType: "text/plain",
      });
    } catch {
      // The orchestrator may fail before a particular process creates its log.
    }
  }
}

type AuthFixtures = {
  userAPage: Page;
  userBPage: Page;
  outsiderPage: Page;
  adminPage: Page;
};

type DiagnosticFixtures = { runtimeDiagnostics: void };

export const test = base.extend<AuthFixtures & DiagnosticFixtures>({
  runtimeDiagnostics: [
    async ({}, use, testInfo) => {
      await use();
      await attachRuntimeLogs(testInfo);
    },
    { auto: true },
  ],
  userAPage: async ({ browser }, use, testInfo) => {
    await useAuthenticatedFixture(
      browser,
      E2E_USERS.userA,
      "user-a",
      use,
      testInfo,
    );
  },
  userBPage: async ({ browser }, use, testInfo) => {
    await useAuthenticatedFixture(
      browser,
      E2E_USERS.userB,
      "user-b",
      use,
      testInfo,
    );
  },
  outsiderPage: async ({ browser }, use, testInfo) => {
    await useAuthenticatedFixture(
      browser,
      E2E_USERS.outsider,
      "outsider",
      use,
      testInfo,
    );
  },
  adminPage: async ({ browser }, use, testInfo) => {
    await useAuthenticatedFixture(
      browser,
      E2E_USERS.admin,
      "admin",
      use,
      testInfo,
    );
  },
});

export { expect };
