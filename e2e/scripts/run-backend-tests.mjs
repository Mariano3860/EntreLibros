import { spawnSync } from "node:child_process";
import { getE2EProcessEnv } from "../support/environment.mjs";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, env) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: process.platform === "win32",
    env,
  });

  if (result.error) throw result.error;
  return result.status ?? 1;
}

const environment = getE2EProcessEnv({
  DOTENV_CONFIG_PATH: ".env.test",
  NODE_ENV: "test",
});

let status = 1;

try {
  const databaseStatus = run(
    process.execPath,
    ["e2e/scripts/database.mjs", "reset-empty"],
    environment,
  );

  if (databaseStatus === 0) {
    console.log("E2E_BACKEND_TESTS_START database=e2e");
    status = run(npmCommand, ["run", "test:backend"], environment);
    console.log(`E2E_BACKEND_TESTS_END status=${status}`);
  } else {
    status = databaseStatus;
  }
} finally {
  const cleanupStatus = run(
    process.execPath,
    ["e2e/scripts/database.mjs", "cleanup"],
    environment,
  );

  if (status === 0 && cleanupStatus !== 0) {
    status = cleanupStatus;
  }
}

process.exitCode = status;
