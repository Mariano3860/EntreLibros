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

const databaseStatus = run(
  process.execPath,
  ["e2e/scripts/database.mjs", "reset-empty"],
  environment,
);
if (databaseStatus !== 0) {
  process.exitCode = databaseStatus;
  process.exit();
}

console.log("E2E_BACKEND_TESTS_START database=e2e");
const status = run(npmCommand, ["run", "test:backend"], environment);
console.log(`E2E_BACKEND_TESTS_END status=${status}`);
process.exitCode = status;
