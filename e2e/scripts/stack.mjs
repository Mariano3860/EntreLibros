import { mkdir, open } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  E2E_BACKEND_URL,
  E2E_FRONTEND_URL,
  getE2EProcessEnv,
} from "../support/environment.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const runtimeLogDirectory = path.join(
  repositoryRoot,
  "test-results",
  "e2e",
  "runtime",
);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [];
let stopping = false;
let stackReady = false;

const environment = getE2EProcessEnv({
  NODE_ENV: "test",
  PUBLIC_API_BASE_URL: `${E2E_BACKEND_URL}/api`,
  BACKEND_PROXY_TARGET: E2E_BACKEND_URL,
});

function runChecked(command, args) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    env: environment,
    stdio: "inherit",
    shell: process.platform === "win32" && command === npmCommand,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} exited with ${result.status}`,
    );
  }
}

async function startProcess(command, args, logName, cwd = repositoryRoot) {
  const logPath = path.join(runtimeLogDirectory, logName);
  const logHandle = await open(logPath, "w");
  const child = spawn(command, args, {
    cwd,
    env: environment,
    shell: process.platform === "win32" && command === npmCommand,
    stdio: [
      "ignore",
      logHandle.createWriteStream(),
      logHandle.createWriteStream(),
    ],
  });
  children.push({ child, logHandle });
  child.once("exit", (code, signal) => {
    if (!stopping && !stackReady && code !== 0) {
      console.error(
        `${logName} stopped before the E2E run completed (code=${code}, signal=${signal})`,
      );
      void stop(1);
    }
  });
  return child;
}

function stopProcess(child) {
  if (!child.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
    });
    return;
  }
  child.kill("SIGTERM");
}

async function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const entry of children) stopProcess(entry.child);
  spawnSync(process.execPath, ["e2e/scripts/database.mjs", "cleanup"], {
    cwd: repositoryRoot,
    env: environment,
    stdio: "inherit",
  });
  await Promise.all(
    children.map(async ({ logHandle }) => {
      await logHandle.close().catch(() => undefined);
    }),
  );
  process.exitCode = exitCode;
}

async function waitForHttp(url, name, attempts = 120) {
  let lastError = "no response";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`${name} did not become ready at ${url}: ${lastError}`);
}

async function main() {
  await mkdir(runtimeLogDirectory, { recursive: true });
  runChecked(process.execPath, ["e2e/scripts/database.mjs", "reset"]);
  runChecked(npmCommand, ["run", "build:backend"]);
  runChecked(npmCommand, ["run", "build:frontend"]);

  await startProcess(
    process.execPath,
    ["dist/index.js"],
    "backend.log",
    path.join(repositoryRoot, "backend"),
  );
  await startProcess(
    npmCommand,
    [
      "--prefix",
      "frontend",
      "run",
      "start",
      "--",
      "--host",
      "127.0.0.1",
      "--port",
      "4300",
    ],
    "frontend.log",
  );

  await waitForHttp(`${E2E_BACKEND_URL}/api/health`, "backend");
  await waitForHttp(`${E2E_FRONTEND_URL}/`, "frontend");
  stackReady = true;
  console.log(`E2E stack ready: ${E2E_FRONTEND_URL}`);
}

process.once("SIGINT", () => void stop(130));
process.once("SIGTERM", () => void stop(143));

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await stop(1);
});
