import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";
import {
  assertSafeE2EComposeProject,
  assertSafeE2EDatabaseUrl,
  E2E_COMPOSE_FILE,
  E2E_COMPOSE_PROJECT,
  E2E_DATABASE_URL,
  getE2EProcessEnv,
} from "../support/environment.mjs";

const { Client } = pg;
const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const seedPath = path.join(repositoryRoot, "e2e", "fixtures", "seed.sql");
const composeCommand = process.platform === "win32" ? "docker.exe" : "docker";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    stdio: "inherit",
    shell: false,
    ...options,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} exited with ${result.status}`,
    );
  }
}

function compose(args, options = {}) {
  assertSafeE2EComposeProject();
  run(
    composeCommand,
    ["compose", "-f", E2E_COMPOSE_FILE, "-p", E2E_COMPOSE_PROJECT, ...args],
    {
      env: getE2EProcessEnv({
        E2E_DB_NAME: databaseName(E2E_DATABASE_URL),
        E2E_DB_PORT: new URL(E2E_DATABASE_URL).port || "55432",
        E2E_DB_USER: new URL(E2E_DATABASE_URL).username || "postgres",
        E2E_DB_PASSWORD: decodeURIComponent(
          new URL(E2E_DATABASE_URL).password || "postgres",
        ),
      }),
      ...options,
    },
  );
}

function maintenanceConnectionString(databaseUrl) {
  const parsed = assertSafeE2EDatabaseUrl(databaseUrl);
  parsed.pathname = "/postgres";
  return parsed.toString();
}

function databaseName(databaseUrl) {
  const parsed = assertSafeE2EDatabaseUrl(databaseUrl);
  const name = parsed.pathname.replace(/^\//, "");
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(
      "E2E database name must contain only letters, numbers, and underscores",
    );
  }
  return name;
}

async function withClient(connectionString, work) {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function waitForDatabase({ attempts = 30, delayMs = 1000 } = {}) {
  const connectionString = maintenanceConnectionString(E2E_DATABASE_URL);
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await withClient(connectionString, (client) => client.query("SELECT 1"));
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(
    `E2E PostgreSQL did not become available: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

async function resetDatabase() {
  assertSafeE2EDatabaseUrl();
  const name = databaseName(E2E_DATABASE_URL);

  await withClient(
    maintenanceConnectionString(E2E_DATABASE_URL),
    async (client) => {
      await client.query(
        `SELECT pg_terminate_backend(pid)
       FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
        [name],
      );
      await client.query(`DROP DATABASE IF EXISTS "${name}"`);
      await client.query(`CREATE DATABASE "${name}"`);
    },
  );

  run(process.execPath, ["backend/scripts/migrate.js"], {
    env: getE2EProcessEnv({ NODE_ENV: "test" }),
  });
}

async function seedDatabase() {
  assertSafeE2EDatabaseUrl();
  const seed = await readFile(seedPath, "utf8");
  await withClient(E2E_DATABASE_URL, async (client) => {
    await client.query("BEGIN");
    try {
      await client.query(seed);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    }
  });
}

async function resetAndSeed() {
  compose(["up", "-d", "db"]);
  await waitForDatabase();
  await resetDatabase();
  await seedDatabase();
  console.log("E2E database reset, migrations, and seed completed.");
}

async function resetWithoutSeed() {
  compose(["up", "-d", "db"]);
  await waitForDatabase();
  await resetDatabase();
  console.log(
    "E2E database reset and migrations completed without browser seed.",
  );
}

async function main() {
  const command = process.argv[2] ?? "reset";

  if (command === "up") {
    compose(["up", "-d", "db"]);
    await waitForDatabase();
    console.log("E2E PostgreSQL/PostGIS is ready.");
    return;
  }

  if (command === "wait") {
    await waitForDatabase();
    console.log("E2E PostgreSQL/PostGIS is reachable.");
    return;
  }

  if (command === "reset") {
    await resetAndSeed();
    return;
  }

  if (command === "reset-empty") {
    await resetWithoutSeed();
    return;
  }

  if (command === "seed") {
    await seedDatabase();
    console.log("E2E seed completed.");
    return;
  }

  if (command === "cleanup") {
    assertSafeE2EDatabaseUrl();
    compose(["down", "--volumes", "--remove-orphans"]);
    console.log(
      "E2E PostgreSQL/PostGIS and its dedicated volume were removed.",
    );
    return;
  }

  throw new Error(`Unknown database command: ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
