import { spawnSync } from "node:child_process";
import { getE2EProcessEnv } from "./environment.mjs";

export default async function globalTeardown() {
  const result = spawnSync(
    process.execPath,
    ["e2e/scripts/database.mjs", "cleanup"],
    {
      cwd: process.cwd(),
      env: getE2EProcessEnv({ NODE_ENV: "test" }),
      stdio: "inherit",
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`E2E cleanup exited with ${result.status}`);
  }
}
