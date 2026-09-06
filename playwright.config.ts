import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4300";
const isCI = process.env.CI === "true";

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: 1,
  globalTeardown: "./e2e/support/global-teardown.mjs",
  reporter: isCI ? [["line"], ["html", { open: "never" }]] : "list",
  outputDir: "test-results/e2e",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "node e2e/scripts/stack.mjs",
    url: `${baseURL}/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
