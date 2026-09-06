import { URL } from "node:url";

const DEFAULT_DATABASE_URL =
  "postgres://postgres:postgres@127.0.0.1:55432/entrelibros_e2e";
const DEFAULT_E2E_JWT_SECRET = "e2e-test-only-secret";

export const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? DEFAULT_DATABASE_URL;

export const E2E_DB_NAME = new URL(E2E_DATABASE_URL).pathname.replace(
  /^\//,
  "",
);

export const E2E_BACKEND_URL =
  process.env.E2E_BACKEND_URL ?? "http://127.0.0.1:4400";

export const E2E_FRONTEND_URL =
  process.env.E2E_FRONTEND_URL ?? "http://127.0.0.1:4300";

export const E2E_COMPOSE_PROJECT =
  process.env.E2E_COMPOSE_PROJECT ?? "entrelibros-e2e";

export const E2E_COMPOSE_FILE =
  process.env.E2E_COMPOSE_FILE ?? "docker-compose.e2e.yml";

export const E2E_DB_PORT =
  process.env.E2E_DB_PORT ?? new URL(E2E_DATABASE_URL).port ?? "55432";

export function assertSafeE2EDatabaseUrl(databaseUrl = E2E_DATABASE_URL) {
  let parsed;

  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("E2E_DATABASE_URL must be a valid PostgreSQL URL");
  }

  const databaseName = parsed.pathname.replace(/^\//, "");
  const isE2EDatabase = /(^|[_-])e2e($|[_-])/i.test(databaseName);

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("E2E_DATABASE_URL must use the postgres protocol");
  }

  if (!databaseName || !isE2EDatabase) {
    throw new Error(
      "Refusing to use a non-E2E database; the database name must contain e2e",
    );
  }

  return parsed;
}

export function assertSafeE2EComposeProject(project = E2E_COMPOSE_PROJECT) {
  if (!/^entrelibros-e2e(?:-[a-z0-9]+)?$/i.test(project)) {
    throw new Error(
      "E2E_COMPOSE_PROJECT must use the dedicated entrelibros-e2e name",
    );
  }

  return project;
}

export function getE2EProcessEnv(extra = {}) {
  assertSafeE2EDatabaseUrl();

  return {
    ...process.env,
    ...extra,
    DATABASE_URL: E2E_DATABASE_URL,
    E2E_DATABASE_URL,
    E2E_ENVIRONMENT: "true",
    FRONTEND_URL: E2E_FRONTEND_URL,
    PORT: process.env.E2E_BACKEND_PORT ?? "4400",
    PUBLIC_API_USE_MOCKS: "false",
    JWT_SECRET: process.env.E2E_JWT_SECRET ?? DEFAULT_E2E_JWT_SECRET,
    JWT_ALGORITHM: "HS256",
  };
}
