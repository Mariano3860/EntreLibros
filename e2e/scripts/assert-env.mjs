import { assertSafeE2EDatabaseUrl } from "../support/environment.mjs";

try {
  assertSafeE2EDatabaseUrl();
  console.log("E2E database target is safe.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
