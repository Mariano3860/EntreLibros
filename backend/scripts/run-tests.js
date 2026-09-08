import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { config } from 'dotenv';

import { resetTestDatabase } from './test-database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Ensure test environment configuration exists
const envTestPath = path.join(projectRoot, '.env.test');
const envTestExamplePath = path.join(projectRoot, '.env.test.example');

if (!fs.existsSync(envTestPath) && fs.existsSync(envTestExamplePath)) {
  fs.copyFileSync(envTestExamplePath, envTestPath);
}

const env = { ...process.env, DOTENV_CONFIG_PATH: '.env.test' };
config({ path: envTestPath, processEnv: env });

if (env.E2E_ENVIRONMENT !== 'true') {
  await resetTestDatabase(env.DATABASE_URL);
}

// Run database migrations
execSync('node -r dotenv/config scripts/migrate.js', {
  cwd: projectRoot,
  stdio: 'inherit',
  env,
});

// Execute tests
execSync('node -r dotenv/config ../node_modules/vitest/vitest.mjs --run', {
  cwd: projectRoot,
  stdio: 'inherit',
  env,
});
